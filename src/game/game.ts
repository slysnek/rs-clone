import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { windowSize, startPositionsForScorpions, heroAnims, scorpionAnims } from './constants';
import Enemy from './enemy';
import Hero from './hero';
import { gridEngineType } from './types';
import UI from './ui'

class Game extends Phaser.Scene {
  hero: Hero;
  entitiesMap: Map<string, Hero | Enemy>;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  gridEngine: GridEngine;
  enemiesMovesTimers: { [enemyId: string]: NodeJS.Timer }
  ui: UI;

  constructor(hero: Hero, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
    super('game'); // why and how this works?
    this.hero = hero;
    this.entitiesMap = new Map();
    this.cursors = cursors;
    this.target = new Phaser.Math.Vector2();
    this.gridEngine = gridEngine;
    this.enemiesMovesTimers = {};
    this.ui = new UI();
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/maps/currentMap.json');
    this.load.image('tiles', 'assets/maps/tiles-02.png');
    this.load.spritesheet('hero', 'assets/spritesheets/woman-13-spritesheet.png', { frameWidth: 75, frameHeight: 133 });
    this.load.spritesheet('scorpion1', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
    this.load.spritesheet('scorpion2', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
    this.load.html('ui', '/assets/html/test.html')
  }

  create() {
    const map = this.buildMap();
    this.tintTiles(map);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.createHero(map);
    this.createCamera();
    this.hero.setFramesForEntityAnimations(this.hero, 'hero', heroAnims);
    this.createEnemy('scorpion1', map);
    this.createEnemy('scorpion2', map, 0.75);
    this.gridEngineInit(map);
    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (entityKey !== 'hero') {
        entityValue.setFramesForEntityAnimations(entityValue, entityKey, scorpionAnims);
        (entityValue as Enemy).setEnemyWalkBehavior(entityKey, map);
      }
    })
    this.setPointerDownListener(map);
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

  createDamageButton(){
    const damageButton = this.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight - 200)
    .createElement('div', 'width: 250px; height: 30px; background-color: black; color: green; cursor: pointer', 'Click me to give hero 1 damage')
    damageButton.scrollFactorX = 0;
    damageButton.scrollFactorY = 0;
    damageButton.addListener('click')
    damageButton.on('click', () => {
      if(this.hero.healthPoints === 0){
        this.ui.putMessageToConsole('I am already dead. Stop mocking me.')
        return
      }
      
      this.hero.healthPoints -=1;
      this.ui.updateHP(this.hero)
      if(this.hero.healthPoints === 0){
        this.ui.putMessageToConsole('You killed me.')
        return
      }
      this.ui.putMessageToConsole('Ouch, you have given me 1 debug damage')
    })
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
    this.hero = this.add.existing(new Hero(this, 20, 34, 'hero', this.gridEngine, map, this.cursors));
    this.hero.scale = 1.5;
    this.entitiesMap.set('hero', this.hero);
  }

  createEnemy(key: string, map: Tilemaps.Tilemap, scaleValue = 1) {
    const enemy = this.add.existing(new Enemy(this, 0, 0, key, this.gridEngine, map));
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
          startPosition: { x: 65, y: 48 },
          offsetX: 0,
          offsetY: 42,
          walkingAnimationEnabled: false,
          speed: 7,
        },
      ],
      numberOfDirections: 4
    };
    this.entitiesMap.forEach((enemyValue, enemyKey) => {
      if (enemyKey !== 'hero') {
        gridEngineConfig.characters.push(
          {
            id: enemyKey,
            sprite: enemyValue,
            startPosition: { x: startPositionsForScorpions[enemyKey].x, y: startPositionsForScorpions[enemyKey].y },
            offsetX: 0,
            offsetY: 15,
            walkingAnimationEnabled: false,
            speed: 7,
          }
        )
      }
    })
    this.gridEngine.create(map, gridEngineConfig);
  }

  setPointerDownListener(map: Tilemaps.Tilemap) {
    // Moving on mouse click
    this.input.on('pointerdown', () => {
        // Converting world coords into tile coords
        const gridMouseCoords = map.worldToTileXY(this.input.activePointer.worldX, this.input.activePointer.worldY);
        const heroCoords = map.worldToTileXY(this.hero.x, this.hero.y);
        gridMouseCoords.x = Math.round(gridMouseCoords.x) - 1;
        gridMouseCoords.y = Math.round(gridMouseCoords.y);
        heroCoords.x = Math.round(heroCoords.x)
        heroCoords.y = Math.round(heroCoords.y) + 1;
        //updating AP
/*         const distance = Math.abs(Math.abs(gridMouseCoords.x - heroCoords.x) + Math.abs(gridMouseCoords.y - heroCoords.y))
        this.hero.updateAP(distance)
        this.ui.updateAP(this.hero)
        console.log(this.hero.actionPoints); */

        // Get 0-layer's tile by coords
        const clickedTile = map.getTileAt(gridMouseCoords.x, gridMouseCoords.y, false, 0);
        clickedTile.tint = 0xff7a4a;

        // MoveTo provides "player" move to grid coords
        this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });
    }, this);
}

  subscribeCharacterToChangeMoving() {
    // Hero movements subscribers
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
  }

  tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
    }
  }

  tintTiles(map: Tilemaps.Tilemap) {
    this.tintTile(map, 30, 35, 0xff7a4a); // orange
    this.tintTile(map, 35, 28, 0xffff0a); // yellow
    this.tintTile(map, 30, 22, 0x4a4aff); // blue
    this.tintTile(map, 15, 18, 0x4aff4a); // green
    this.tintTile(map, 20, 28, 0xaf2462); // red
    this.tintTile(map, 40, 48, 0xaf22ff); // magenta (unreachable)
    this.tintTile(map, 0, 0, 0xaf2462); // red (unreachable)
    this.tintTile(map, 48, 53, 0xaf2462); // red (unreachable)
  }
}

export default Game;
