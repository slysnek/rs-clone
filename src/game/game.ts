import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import windowSize from './constants';

const startPositionsForEnemy: { [key: string]: { x: number, y: number } } = {
  scorpion1: { x: 20, y: 34 },
  scorpion2: { x: 23, y: 36 }
};

function getRandomXYDelta() {
  const deltaValue = () => Math.ceil(Math.random() * 10 / 3);
  return { xDelta: deltaValue(), yDelta: deltaValue() };
}

const timeModifier = 5;

function getRandomTimeInterval() {
  return (Math.ceil(Math.random() * timeModifier) * 1000);
}

type Animations = {
  walk: {
    upRight: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    },
    downRight: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    },
    downLeft: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    },
    upLeft: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    }
  }
}

const heroAnims = {
  walk: {
  //   upRight: {
  //     startFrame: 0,
  //     endFrame: 7,
  //     stopFrame: 10,
  //   },
  // downRight: {
  //   startFrame: 11,
  //   endFrame: 18,
  //   stopFrame: 21,
  // },
  // downLeft: {
  //   startFrame: 22,
  //   endFrame: 29,
  //   stopFrame: 32,
  // },

  upRight: {
    startFrame: 176,
    endFrame: 183,
    stopFrame: 176,
  },
  downRight: {
    startFrame: 187,
    endFrame: 194,
    stopFrame: 197,
  },
  downLeft: {
    startFrame: 198,
    endFrame: 205,
    stopFrame: 208,
  },
  upLeft: {
    startFrame: 33,
    endFrame: 40,
    stopFrame: 43,
  },
},
};

const scorpionAnims = {
  walk: {
    upRight: {
      startFrame: 0,
      endFrame: 7,
      stopFrame: 0,
    },
    downRight: {
      startFrame: 16,
      endFrame: 23,
      stopFrame: 16,
    },
    downLeft: {
      startFrame: 24,
      endFrame: 31,
      stopFrame: 24,
    },
    upLeft: {
      startFrame: 40,
      endFrame: 47,
      stopFrame: 40,
    },
  },
};

class Game extends Phaser.Scene {
  hero: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  entitiesMap: Map<string, Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  gridEngine: GridEngine;
  enemiesMovesTimers: { [enemyId: string]: NodeJS.Timer }

  constructor(hero: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
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
    this.load.spritesheet('player', 'assets/spritesheets/woman-13-spritesheet.png', { frameWidth: 75, frameHeight: 133 });
    this.load.spritesheet('scorpion1', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
    this.load.spritesheet('scorpion2', 'assets/spritesheets/rad-scorpion-walk.png', { frameWidth: 120, frameHeight: 100 });
  }

  create() {
    const map = this.buildMap();
    this.tintTiles(map);
    this.createHero();
    this.createCamera();
    this.createEnemy('scorpion1');
    this.createEnemy('scorpion2', 0.7);
    this.setFramesForEntitiesAnimations(this.entitiesMap);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.gridEngineInit(map);
    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (entityKey !== 'player') {
        this.setEnemyWalkBehavior(entityKey, map);
      }
    })
    this.subscribeCharacterToChangeMoving();
    this.setPointerDownListener(map);
  }

  update() {
    this.moveHeroByArrows();
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

  createHero() {
    this.hero = this.physics.add.sprite(0, 0, 'player');
    this.hero.scale = 1.5;
    this.entitiesMap.set('player', this.hero);
  }

  createEnemy(key: string, scaleValue = 1) {
    const enemy = this.physics.add.sprite(0, 0, `${key}`);
    this.entitiesMap.set(`${key}`, enemy);
    enemy.scale = scaleValue;
  }

  createCamera() {
    this.cameras.main.setSize(windowSize.windowWidth, windowSize.windowHeight);
    this.cameras.main.startFollow(this.hero, true);
  }

  gridEngineInit(map: Tilemaps.Tilemap) {
    const gridEngineConfig = {
      characters: [
        {
          id: "player",
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
      if (enemyKey !== 'player') {
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

  subscribeCharacterToChangeMoving() {
    // Hero movements subscribers
    this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      entity.anims.play(direction);
    });

    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      entity.anims.stop();
      entity.setFrame(this.getStopFrame(direction, charId));
    });

    this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      entity.setFrame(this.getStopFrame(direction, charId));
    });
  }

  setPointerDownListener(map: Tilemaps.Tilemap) {
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
  setEnemyWalkBehavior(charId: string, map: Tilemaps.Tilemap) {
    this.enemiesMovesTimers.charId = setInterval(() => {
      const deltaXY = getRandomXYDelta();
      this.gridEngine.moveTo(`${charId}`, { x: startPositionsForEnemy[charId].x + deltaXY.xDelta, y: startPositionsForEnemy[charId].y + deltaXY.yDelta });
      this.tintTile(map, startPositionsForEnemy[charId].x + deltaXY.xDelta, startPositionsForEnemy[charId].y + deltaXY.yDelta, 0xff7a4a);

    }, getRandomTimeInterval())
  }

  moveHeroByArrows() {
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

  setFramesForEntitiesAnimations(entitiesMap: Map<string, Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>) {
    const heroRegex = /^player/i;
    const scorpionRegex = /^scorpion/i;

    entitiesMap.forEach((entityValue, entityKey) => {
      if (entityKey.match(heroRegex)) {
        this.setFramesForEntityAnimations(entityValue, entityKey, heroAnims);
      }
      if (entityKey.match(scorpionRegex)) {
        this.setFramesForEntityAnimations(entityValue, entityKey, scorpionAnims);
      }
    });
  }

  private setFramesForEntityAnimations(entityValue: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, entityKey: string, entityAnims: Animations) {
    this.createEntityAnimation.call(entityValue, "up-right", entityKey, entityAnims.walk.upRight.startFrame, entityAnims.walk.upRight.endFrame);
    this.createEntityAnimation.call(entityValue, "down-right", entityKey, entityAnims.walk.downRight.startFrame, entityAnims.walk.downRight.endFrame);
    this.createEntityAnimation.call(entityValue, "down-left", entityKey, entityAnims.walk.downLeft.startFrame, entityAnims.walk.downLeft.endFrame);
    this.createEntityAnimation.call(entityValue, "up-left", entityKey, entityAnims.walk.upLeft.startFrame, entityAnims.walk.upLeft.endFrame);
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

  getStopFrame(direction: string, entityKey: string): number {
    const heroRegex = /^player/i;
    const scorpionRegex = /^scorpion/i;

    let entityAnims = {
      walk: {
        upRight: {
          stopFrame: -1,
        },
        downRight: {
          stopFrame: -1,
        },
        downLeft: {
          stopFrame: -1,
        },
        upLeft: {
          stopFrame: -1,
        },
      },
    };
    if (entityKey.match(heroRegex)) {
      entityAnims = heroAnims;
    }
    if (entityKey.match(scorpionRegex)) {
      entityAnims = scorpionAnims;
    }

    switch (direction) {
      case "up-right":
        return entityAnims.walk.upRight.stopFrame;
      case "down-right":
        return entityAnims.walk.downRight.stopFrame;
      case "down-left":
        return entityAnims.walk.downLeft.stopFrame;
      case "up-left":
        return entityAnims.walk.upLeft.stopFrame;
      default:
        return -1;
    }
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
