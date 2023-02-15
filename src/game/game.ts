import Phaser, { Tilemaps } from 'phaser';
import { GridEngine, Position } from 'grid-engine';
import { windowSize, startPositionsForScorpionsMap1, heroAnims, scorpionAnims, offsetCoordForScorpions } from './constants';
import Enemy from './enemy';
import Hero from './hero';
import { gridEngineType } from './types';
import UI from './ui'

const defaultBehavior = 'walk';

class Game extends Phaser.Scene {
  hero: Hero;
  entitiesMap: Map<string, Hero | Enemy>;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  gridEngine: GridEngine;
  ui: UI;

  constructor(hero: Hero, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
    super('game');
    this.hero = hero;
    this.entitiesMap = new Map();
    this.cursors = cursors;
    this.target = new Phaser.Math.Vector2();
    this.gridEngine = gridEngine;
    this.getEntitiesMap = this.getEntitiesMap.bind(this);
    this.ui = new UI();
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/maps/currentMap.json');
    this.load.image('tiles', 'assets/maps/tiles-02.png');
    this.load.spritesheet('hero', 'assets/spritesheets/woman-13-spritesheet.png', { frameWidth: 75, frameHeight: 133 });
    this.load.spritesheet('scorpion1', 'assets/spritesheets/scorpion-01.png', { frameWidth: 175, frameHeight: 135 });
    this.load.spritesheet('scorpion2', 'assets/spritesheets/scorpion-01.png', { frameWidth: 175, frameHeight: 135 });
    this.load.spritesheet('scorpion3', 'assets/spritesheets/scorpion-01.png', { frameWidth: 175, frameHeight: 135 });
    this.load.html('ui', '/assets/html/test.html');
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    const map = this.buildMap();
    this.tintTiles(map);

    this.createHero(map);
    this.hero.setFramesForEntityAnimations(this.hero, 'hero', heroAnims, defaultBehavior);
    this.hero.setPunchAnimation();
    this.hero.setGetHidePistolAnimation();
    console.log(this.hero.anims)
    this.createCamera();

    this.createEnemy('scorpion1', map, 6, 'big');
    this.createEnemy('scorpion2', map, 6, 'small', 0.75);
    this.createEnemy('scorpion3', map, 6, 'small', 0.75);

    this.gridEngineInit(map);

    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        entityValue.setFramesForEntityAnimations(entityValue, entityKey, scorpionAnims, defaultBehavior);
        (entityValue as Enemy).setAttackAnimation();
        (entityValue as Enemy).setDamageAnimation();
        (entityValue as Enemy).setEnemyWalkBehavior(entityKey, map);
      }
    });
    this.hero.setPointerDownListener(map);
    this.subscribeCharacterToChangeMoving();
    this.subscribeCharacterToChangeMoving();
    //ui section
    this.ui.createUI(this)
    this.ui.putMessageToConsole('Game loaded')
    this.ui.updateHP(this.hero)
    this.ui.updateAP(this.hero)
    this.ui.updateWeapon(this.hero)
    this.createDamageButton()
    this.ui.setChangeWeaponListener(this.hero)
  }

  createDamageButton() {
    const damageButton = this.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight - 100)
      .createElement('div', 'width: 250px; height: 30px; background-color: black; color: green; cursor: pointer', 'Click me to give hero 1 damage')
    damageButton.scrollFactorX = 0;
    damageButton.scrollFactorY = 0;
    damageButton.addListener('click')
    damageButton.on('click', () => {
      if (this.hero.healthPoints === 0) {
        this.ui.putMessageToConsole('I am already dead. Stop mocking me.')
        return
      }

      this.hero.healthPoints -= 1;
      this.ui.updateHP(this.hero)
      if (this.hero.healthPoints === 0) {
        this.ui.putMessageToConsole('You killed me.')
        return
      }
      this.ui.putMessageToConsole('Ouch, you have given me 1 debug damage')
    })
  }

  getEntitiesMap() {
    return this.entitiesMap;
  }

  update() {
    this.hero.moveHeroByArrows();
  }

  buildMap() {
    const map = this.make.tilemap({ key: 'map' });
    const tilesets = map.addTilesetImage('tiles-02', 'tiles');

    // Layers creation based on tilemap's layers
    for (let i = 0; i < map.layers.length; i++) {
      map.createLayer(i, tilesets, 0, 0);
    }
    return map;
  }

  createHero(map: Tilemaps.Tilemap) {
    this.hero = this.add.existing(new Hero(this, 'hero', this.gridEngine, map, this.cursors, 20, this.getEntitiesMap));
    this.hero.scale = 1.5;
    this.entitiesMap.set('hero', this.hero);
  }

  createEnemy(key: string, map: Tilemaps.Tilemap, battleRadius: number, size: string, scaleValue = 1) {
    const enemy = this.add.existing(new Enemy(this, key, this.gridEngine, map, key, 15, battleRadius, size));

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
          startPosition: { x: 68, y: 68 },
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
            startPosition: { x: startPositionsForScorpionsMap1[enemyKey].x, y: startPositionsForScorpionsMap1[enemyKey].y },
            offsetX: offsetCoordForScorpions[(enemyValue as Enemy).size].x,
            offsetY: offsetCoordForScorpions[(enemyValue as Enemy).size].y,
            walkingAnimationEnabled: false,
            speed: 2,
          }
        )
      }
    })
    this.gridEngine.create(map, gridEngineConfig);
  }

  subscribeCharacterToChangeMoving() {
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

          if (this.isHeroSteppedOnEnemyRadius()) {
            // Start fight
            this.moveClosestEnemiesToHero(enterTile, 15);
          }
        }
      });
  }

  moveClosestEnemiesToHero(heroPos: Position, enemyTriggerRadius: number) {
    // Получаем массив свободных ячеек вокруг героя
    const emptyTilesAroundHero: Array<Position> = [];
    if (!this.gridEngine.isBlocked({ x: heroPos.x - 1, y: heroPos.y })) {
      emptyTilesAroundHero.push({ x: heroPos.x - 1, y: heroPos.y });
    }
    if (!this.gridEngine.isBlocked({ x: heroPos.x, y: heroPos.y - 1 })) {
      emptyTilesAroundHero.push({ x: heroPos.x, y: heroPos.y - 1 });
    }
    if (!this.gridEngine.isBlocked({ x: heroPos.x + 1, y: heroPos.y })) {
      emptyTilesAroundHero.push({ x: heroPos.x + 1, y: heroPos.y });
    }
    if (!this.gridEngine.isBlocked({ x: heroPos.x, y: heroPos.y + 1 })) {
      emptyTilesAroundHero.push({ x: heroPos.x, y: heroPos.y + 1 });
    }
    // Получаем массив ближайших врагов относительно героя
    let closestEnemiesAroundHero: Array<[string, number]> = [];
    this.entitiesMap.forEach((_entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        const enemyPos = this.gridEngine.getPosition(entityKey);
        const distanceToHero = this.manhattanDist(heroPos.x, heroPos.y, enemyPos.x, enemyPos.y);
        closestEnemiesAroundHero.push([entityKey, distanceToHero]);
      }
    });
    closestEnemiesAroundHero = closestEnemiesAroundHero.sort((a, b) => {
      if (a[1] > b[1]) {
        return 1;
      }
      if (a[1] < b[1]) {
        return -1;
      }
      return 0;
    });
    // Не больше 4 врагов, не дальше чем 15 клеток (манхэттенская дистанция)
    closestEnemiesAroundHero = closestEnemiesAroundHero.slice(0, emptyTilesAroundHero.length);
    closestEnemiesAroundHero = closestEnemiesAroundHero.filter((enemy) => enemy[1] < enemyTriggerRadius);

    // Двигаем каждого врага к позиции героя
    closestEnemiesAroundHero.forEach((enemy, index) => {
      (this.entitiesMap.get(enemy[0]) as Enemy).clearTimer();
      this.gridEngine.moveTo(enemy[0], emptyTilesAroundHero[index]);
    });
  }

  isHeroSteppedOnEnemyRadius() {
    const heroPos = this.gridEngine.getPosition('hero');
    let isStepped = false;

    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        const enemyPos = this.gridEngine.getPosition(entityKey);
        if (this.manhattanDist(enemyPos.x, enemyPos.y, heroPos.x, heroPos.y) <= (entityValue as Enemy).battleRadius) {
          // console.log(`Hero stepped on enemy radius: (${heroPos.x},${heroPos.y})`);
          isStepped = true;
        }
      }
    });
    return isStepped;
  }

  isEnemyRadiusSteppedOnHero(tilemap: Tilemaps.Tilemap, posX: number, posY: number, radius: number, color: number) {
    const heroPos = this.gridEngine.getPosition('hero');
    let isStepped = false;

    if (this.manhattanDist(posX, posY, heroPos.x, heroPos.y) <= radius) {
      // console.log(`Enemy radius stepped on hero: (${heroPos.x},${heroPos.y})`);
      isStepped = true;
    }
    this.tintRadius(tilemap, posX, posY, radius, color);
    return isStepped;
  }

  manhattanDist(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
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
    this.tintTile(map, startPositionsForScorpionsMap1.scorpion1.x, startPositionsForScorpionsMap1.scorpion1.y, 0xaf2462); // red (unreachable)
    this.tintTile(map, startPositionsForScorpionsMap1.scorpion2.x, startPositionsForScorpionsMap1.scorpion2.y, 0xaf2462);
  }

  tintRadius(tilemap: Tilemaps.Tilemap, posX: number, posY: number, radius: number, color: number) {
    for (let x = 0; x <= radius; x++) {
      for (let y = 0; y <= radius; y++) {
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
}

export default Game;
