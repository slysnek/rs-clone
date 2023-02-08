import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import windowSize from './constants';

const startPositionsForEnemy: { [key: string]: { x: number, y: number } } = { 
  enemy1: { x: 20, y: 34 },
  enemy2: { x: 23, y: 36 }
};

function getRandomXYDelta(){
  const deltaValue = () => Math.ceil(Math.random() * 10 / 3);
  return {xDelta: deltaValue(), yDelta: deltaValue()};
}

const timeModifier = 5;

function getRandomTimeInterval(){
  return (Math.ceil(Math.random() * timeModifier) * 1000);
}

class Game extends Phaser.Scene {
  hero: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  entitiesMap: Map<string, Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  gridEngine: GridEngine;
  enemiesMovesTimers: { [enemyId: string]: NodeJS.Timer }

  constructor(hero: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
    super('game'); // why and how this works?
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
    this.load.spritesheet('player', 'assets/spritesheets/woman-01.png', { frameWidth: 75, frameHeight: 133 });
    this.load.spritesheet('enemy1', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
    this.load.spritesheet('enemy2', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
  }

  create() {
    const map = this.buildMap();
    this.tintTiles(map);
    this.createHero();
    this.createCamera();
    this.createEnemy('enemy1');
    this.createEnemy('enemy2', 0.7);
    this.setFramesForEntitiesAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.gridEngineInit(map);
    this.entitiesMap.forEach((entityValue, entityKey) => {
      if(entityKey !== 'player'){
        this.setEnemyWalkBehavior(entityKey, map);
      }
    })
    this.subscribeCharacterToChangeMoving();
    this.setPointerDownListener(map);
  }

  update() {
   this.moveHeroByArrows();
  }

  buildMap(){
    const map = this.make.tilemap({ key: 'map' });
    const tilesets = map.addTilesetImage('grassland_tiles', 'tiles');

    // Layers creation based on tilemap's layers
    for (let i = 0; i < map.layers.length; i++) {
      map.createLayer(i, tilesets, 0, 0);
    }
    return map;
  }

  createHero(){
    this.hero = this.physics.add.sprite(0, 0, 'player');
    this.hero.scale = 0.75;
    this.entitiesMap.set('player', this.hero);
  }

  createEnemy(key: string, scaleValue = 1){
    const enemy = this.physics.add.sprite(0, 0, `${key}`);
    this.entitiesMap.set(`${key}`, enemy);
    enemy.scale = scaleValue;
  }

  createCamera(){
    this.cameras.main.setSize(windowSize.windowWidth, windowSize.windowHeight);
    this.cameras.main.startFollow(this.hero, true);
  }

  gridEngineInit(map: Tilemaps.Tilemap){
    const gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.hero,
          startPosition: { x: 35, y: 28 },
          offsetX: 5,
          offsetY: -10,
          walkingAnimationEnabled: false,
          speed: 7,
        },
      ],
      numberOfDirections: 4
    };
    this.entitiesMap.forEach((enemyValue, enemyKey) => {
      if(enemyKey !== 'player'){
        gridEngineConfig.characters.push(
          {
            id: enemyKey,
            sprite: enemyValue,
            startPosition: { x: startPositionsForEnemy[enemyKey].x, y: startPositionsForEnemy[enemyKey].y },
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

  subscribeCharacterToChangeMoving(){
    // Hero movements subscribers
    this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      entity.anims.play(direction);
    });

    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      entity.anims.stop();
      entity.setFrame(this.getStopFrame(direction));
    });

    this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      entity.setFrame(this.getStopFrame(direction));
    });
  }

  setPointerDownListener(map: Tilemaps.Tilemap){
    // Moving on mouse click
    this.input.on('pointerdown', () => {
      // Converting world coords into tile coords
      const gridMouseCoords = map.worldToTileXY(this.input.activePointer.worldX, this.input.activePointer.worldY);
      gridMouseCoords.x = Math.round(gridMouseCoords.x) - 1;
      gridMouseCoords.y = Math.round(gridMouseCoords.y);

      // Get 0-layer's tile by coords
      const clickedTile = map.getTileAt(gridMouseCoords.x, gridMouseCoords.y, false, 0);
      clickedTile.tint = 0xff7a4a;

      // MoveTo provides "player" move to grid coords
      this.gridEngine.moveTo("player", { x: gridMouseCoords.x, y: gridMouseCoords.y });
    }, this);
  }

  // позже надо удалить из аргументов карту и функцию покраски тайлов

  setEnemyWalkBehavior(charId: string, map: Tilemaps.Tilemap){
    this.enemiesMovesTimers.charId = setInterval(() => {
      const deltaXY = getRandomXYDelta();
      this.gridEngine.moveTo(`${charId}`, { x: startPositionsForEnemy[charId].x + deltaXY.xDelta, y: startPositionsForEnemy[charId].y + deltaXY.yDelta } );
      this.tintTile(map, startPositionsForEnemy[charId].x + deltaXY.xDelta, startPositionsForEnemy[charId].y + deltaXY.yDelta, 0xff7a4a);

    }, getRandomTimeInterval())
  }

  moveHeroByArrows(){
 // Move hero by arrows (can be deleted?)
    if (this.cursors.left.isDown) {
      this.gridEngine.move("player", Direction.UP_LEFT);
    } else if (this.cursors.right.isDown) {
      this.gridEngine.move("player", Direction.DOWN_RIGHT);
    } else if (this.cursors.up.isDown) {
      this.gridEngine.move("player", Direction.UP_RIGHT);
    } else if (this.cursors.down.isDown) {
      this.gridEngine.move("player", Direction.DOWN_LEFT);
    }
  }

  setFramesForEntitiesAnimations(){
    console.log(this.entitiesMap)
    this.entitiesMap.forEach((entityValue, entityKey) => {
      this.createEntityAnimation.call(entityValue, "up-right", entityKey, 0, 7);
      this.createEntityAnimation.call(entityValue, "down-right", entityKey, 16, 23);
      this.createEntityAnimation.call(entityValue, "down-left", entityKey, 24, 31);
      this.createEntityAnimation.call(entityValue, "up-left", entityKey, 40, 47);
    })
  }

  createEntityAnimation(direction: string, entityName: string, startFrame: number, endFrame: number) {
    this.anims.create({
      key: direction,
      frames: this.anims.generateFrameNumbers(`${entityName}`, {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 9,
      repeat: -1,
      yoyo: false,
    });
  }

  getStopFrame(direction: string): number {
    switch (direction) {
      case "up-right":
        return 0;
      case "down-right":
        return 16;
      case "down-left":
        return 24;
      case "up-left":
        return 40;
      default:
        return -1;
    }
  }

  tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
    }
  }

  tintTiles(map: Tilemaps.Tilemap){
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
