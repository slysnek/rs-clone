import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import windowSize from './constants';

type dirObj = {
  direction: string;
};

class Game extends Phaser.Scene {
  hero: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gridEngine: GridEngine;

  constructor(hero: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
    super('game'); // why and how this works?
    this.hero = hero;
    this.cursors = cursors;
    this.target = new Phaser.Math.Vector2();
    this.gridEngine = gridEngine;
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/maps/isometric3.json');
    this.load.image('tiles', 'assets/maps/grassland_tiles.png');
    this.load.spritesheet('player', 'assets/spritesheets/woman-01.png', { frameWidth: 75, frameHeight: 133 });
  }

  create() {
    const map = this.buildMap();
    this.createHero();
    this.createCamera();
    this.setFramesForHeroAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.gridEngineInit(map);
    this.tintTiles(map);
    this.subscribeCharacterToChangeMoving(this.hero);
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
    this.gridEngine.create(map, gridEngineConfig);
  }

  subscribeCharacterToChangeMoving(character: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
    // Hero movements subscribers
    this.gridEngine.movementStarted().subscribe(({ direction }: dirObj) => {
      character.anims.play(direction);
    });

    this.gridEngine.movementStopped().subscribe(({ direction }: dirObj) => {
      character.anims.stop();
      character.setFrame(this.getStopFrame(direction));
    });

    this.gridEngine.directionChanged().subscribe(({ direction }: dirObj) => {
      character.setFrame(this.getStopFrame(direction));
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

  setFramesForHeroAnimations(){
    this.createPlayerAnimation.call(this.hero, "up-right", 0, 7);
    this.createPlayerAnimation.call(this.hero, "down-right", 16, 23);
    this.createPlayerAnimation.call(this.hero, "down-left", 24, 31);
    this.createPlayerAnimation.call(this.hero, "up-left", 40, 47);
  }

  createPlayerAnimation(name: string, startFrame: number, endFrame: number) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers("player", {
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
