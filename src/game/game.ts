import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { windowSize, startPositionsForScorpions, heroAnims, scorpionAnims } from './constants';
import Enemy from './enemy';
import Hero from './hero';

type gridEngineType = {
  characters: {
    id: string;
    sprite: Hero | Enemy;
    startPosition: {
      x: number;
      y: number;
    };
    offsetX: number;
    offsetY: number;
    walkingAnimationEnabled: boolean;
    speed: number;
  }[];
  numberOfDirections: number;
}
class Game extends Phaser.Scene {
  hero: Hero;
  entitiesMap: Map<string, Hero | Enemy>;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  gridEngine: GridEngine;
  enemiesMovesTimers: { [enemyId: string]: NodeJS.Timer }

  constructor(hero: Hero, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
    super('game');
    this.hero = hero;
    this.entitiesMap = new Map();
    this.cursors = cursors;
    this.target = new Phaser.Math.Vector2();
    this.gridEngine = gridEngine;
    this.enemiesMovesTimers = {};
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/maps/isometric3.json');
    this.load.image('tiles', 'assets/maps/grassland_tiles.png');
    this.load.spritesheet('hero', 'assets/spritesheets/woman-13-spritesheet.png', { frameWidth: 75, frameHeight: 133 });
    this.load.spritesheet('scorpion1', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
    this.load.spritesheet('scorpion2', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
    this.load.spritesheet('dummy', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    const map = this.buildMap();
    this.tintTiles(map);

    this.createHero(map);
    this.hero.setFramesForEntityAnimations(this.hero, 'hero', heroAnims);

    this.createCamera();

    this.createEnemy('scorpion1', map, 3);
    this.createEnemy('scorpion2', map, 3, 0.75);
    this.createEnemy('dummy', map, 3, 0.75); // dummy to test fight system

    this.gridEngineInit(map);

    this.enemyRadiusSteppedOnHero(map, 30, 30, 3, 0xdd1111); // -
    this.gridEngine.moveTo('dummy', { x: 37, y: 29 }); // -

    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (entityKey.match(/^scorpion/i)) {
        entityValue.setFramesForEntityAnimations(entityValue, entityKey, scorpionAnims);
        (entityValue as Enemy).setEnemyWalkBehavior(entityKey, map);
      }
    });
    this.hero.setPointerDownListener(map);
    this.subscribeCharacterToChangeMoving(map);
  }

  update() {
    this.hero.moveHeroByArrows();
  }

  buildMap() {
    const map = this.make.tilemap({ key: 'map' });
    const tilesets = map.addTilesetImage('grassland_tiles', 'tiles');

    // Layers creation based on tilemap's layers
    for (let i = 0; i < map.layers.length; i++) {
      map.createLayer(i, tilesets, 0, 0);
    }
    return map;
  }

  createHero(map: Tilemaps.Tilemap) {
    this.hero = this.add.existing(new Hero(this, 'hero', this.gridEngine, map, this.cursors));
    this.hero.scale = 1.5;
    this.entitiesMap.set('hero', this.hero);
  }

  createEnemy(key: string, map: Tilemaps.Tilemap, battleRadius: number, scaleValue = 1) {
    const enemy = this.add.existing(new Enemy(this, key, this.gridEngine, map, battleRadius));
    this.entitiesMap.set(`${key}`, enemy);
    enemy.scale = scaleValue;
  }

  createCamera() {
    this.cameras.main.setSize(windowSize.windowWidth, windowSize.windowHeight);
    this.cameras.main.startFollow(this.hero, true);
  }

  gridEngineInit(map: Tilemaps.Tilemap) {
    const gridEngineConfig: gridEngineType = {
      characters: [
        {
          id: 'hero',
          sprite: this.hero,
          startPosition: { x: 35, y: 28 },
          offsetX: 0,
          offsetY: 42,
          walkingAnimationEnabled: false,
          speed: 7,
        },
      ],
      numberOfDirections: 4
    };
    this.entitiesMap.forEach((enemyValue, enemyKey) => {
      if (!enemyKey.match(/^hero/i)) {
        gridEngineConfig.characters.push(
          {
            id: enemyKey,
            sprite: enemyValue,
            startPosition: { x: startPositionsForScorpions[enemyKey].x, y: startPositionsForScorpions[enemyKey].y },
            offsetX: 0,
            offsetY: 15,
            walkingAnimationEnabled: false,
            speed: 2,
          }
        )
      }
    })
    this.gridEngine.create(map, gridEngineConfig);
  }

  // Entities movements subscribers
  subscribeCharacterToChangeMoving(map: Tilemaps.Tilemap) {
    this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Hero | Enemy;
      entity.anims.play(direction);
    });

    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Hero | Enemy;
      entity.anims.stop();
      entity.setFrame(entity.getStopFrame(direction, charId));
    });

    this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Hero | Enemy;
      entity.setFrame(entity.getStopFrame(direction, charId));
    });

    const positionChangeText = this.add.text(this.hero.x, this.hero.y - 50, "");
    positionChangeText.depth = 100;
    const positionChangeFinishedText = this.add.text(this.hero.x, this.hero.y, "");
    positionChangeFinishedText.depth = 100;

    this.gridEngine
      .positionChangeStarted()
      .subscribe(({ charId, exitTile, enterTile }) => {
        if (charId.match(/^hero/i)) {
          positionChangeText.text =
            `positionChangeStarted:\n exit: (${exitTile.x}, ${exitTile.y})\n` +
            `enter: (${enterTile.x}, ${enterTile.y})`;
        }
      });

    this.gridEngine
      .positionChangeFinished()
      .subscribe(({ charId, exitTile, enterTile }) => {

        if (charId.match(/^hero/i)) {
          positionChangeText.setX(this.hero.x);
          positionChangeText.setY(this.hero.y - 50);
          positionChangeFinishedText.setX(this.hero.x);
          positionChangeFinishedText.setY(this.hero.y);

          positionChangeFinishedText.text =
            `positionChangeFinished:\n exit: (${exitTile.x}, ${exitTile.y})\n` +
            `enter: (${enterTile.x}, ${enterTile.y})`;

          this.heroSteppedOnEnemyRadius();
        }
        if (!charId.match(/^hero/i)) {
          const currentEnemy = this.entitiesMap.get(charId) as Enemy;
          // clear previous zone
          this.enemyRadiusSteppedOnHero(map, exitTile.x, exitTile.y, currentEnemy.battleRadius, 0xffffff);
          // create new zone
          this.enemyRadiusSteppedOnHero(map, enterTile.x, enterTile.y, currentEnemy.battleRadius, 0xdd1111);
        }
      });
  }

  tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
    }
  }

  tintTiles(map: Tilemaps.Tilemap) {
    this.tintTile(map, 30, 35, 0xff7a4a); // orange
    this.tintTile(map, 35, 28, 0xffff0a); // yellow
    this.tintTile(map, 35, 25, 0x4a4aff); // blue
    this.tintTile(map, 15, 18, 0x4aff4a); // green
    this.tintTile(map, 20, 28, 0xaf2462); // red
    this.tintTile(map, 40, 48, 0xaf22ff); // magenta (unreachable)
    this.tintTile(map, 0, 0, 0xaf2462); // red (unreachable)
    this.tintTile(map, 48, 53, 0xaf2462); // red (unreachable)
  }

  heroSteppedOnEnemyRadius() {
    // console.log('heroGridPos (hero on radius): ', this.gridEngine.getPosition('hero'));
    const heroPos = this.gridEngine.getPosition('hero');

    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        const enemyPos = this.gridEngine.getPosition(entityKey);
        if (this.manhattanDist(enemyPos.x, enemyPos.y, heroPos.x, heroPos.y) <= (entityValue as Enemy).battleRadius) {
          console.log(`Hero stepped on enemy radius: (${heroPos.x},${heroPos.y})`);
        }
      }
    });
  }

  enemyRadiusSteppedOnHero(tilemap: Tilemaps.Tilemap, posX: number, posY: number, radius: number, color: number) {
    // console.log('heroGridPos (radius on hero): ', this.gridEngine.getPosition('hero'));
    // console.log('whateverEnemy (radius on hero): ', { x: posX, y: posY });
    const heroPos = this.gridEngine.getPosition('hero');

    for (let x = 0; x <= radius; x++) {
      for (let y = 0; y <= radius; y++) {
        if (this.manhattanDist(posX, posY, heroPos.x, heroPos.y) <= radius) {
          console.log(`Enemy radius stepped on hero: (${heroPos.x},${heroPos.y})`);
        }
        if (this.manhattanDist(posX, posY, posX + x, posY + y) <= radius) {
          this.tintTile(tilemap, posX + x, posY + y, color);
        }
        if (this.manhattanDist(posX, posY, posX - x, posY + y) <= radius) {
          this.tintTile(tilemap, posX - x, posY + y, color);
        }
        if (this.manhattanDist(posX, posY, posX + x, posY - y) <= radius) {
          this.tintTile(tilemap, posX + x, posY - y, color);
        }
        if (this.manhattanDist(posX, posY, posX - x, posY - y) <= radius) {
          this.tintTile(tilemap, posX - x, posY - y, color);
        }
      }
    }
  }

  manhattanDist(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}

export default Game;
