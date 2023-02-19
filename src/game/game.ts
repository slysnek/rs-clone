import Phaser, { Tilemaps } from 'phaser';
import { GridEngine, Position } from 'grid-engine';
import { windowSize, heroAnims } from './constants';
import Enemy from './enemy';
import Hero from './hero';
import { gridEngineType } from './types';
import UI from './ui';
import { entitiesTotalActionPoints } from './battlePoints';
import { manhattanDist } from './utilsForAttackAnimations';
import Entity from './entity';
import { currentLevel } from './levels';

const defaultBehavior = 'walk';

class Game extends Phaser.Scene {
  hero: Hero;
  entitiesMap: Map<string, Hero | Enemy>;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  gridEngine: GridEngine;
  ui: UI;
  sounds: { [soundName: string]: Phaser.Sound.BaseSound }

  constructor(hero: Hero, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
    super('game');
    this.hero = hero;
    this.entitiesMap = new Map();
    this.cursors = cursors;
    this.target = new Phaser.Math.Vector2();
    this.gridEngine = gridEngine;
    this.getEntitiesMap = this.getEntitiesMap.bind(this);
    this.deleteEntityFromEntitiesMap = this.deleteEntityFromEntitiesMap.bind(this);
    this.moveEnemiesToHero = this.moveEnemiesToHero.bind(this);
    this.ui = new UI();
    this.sounds = {};
  }

  preload() {
    this.load.tilemapTiledJSON('map', `assets/maps/${currentLevel.map}.json`);
    this.load.image('tiles', `assets/maps/${currentLevel.tiles}.png`);
    this.load.spritesheet('hero', 'assets/spritesheets/woman-13-spritesheet.png', { frameWidth: 75, frameHeight: 133 });
    for (let i = 0; i < currentLevel.enemyQuantity; i++) {
      this.load.spritesheet(`${currentLevel.enemyName}${i + 1}`, `assets/spritesheets/${currentLevel.enemySpriteSheet}.png`, currentLevel.spriteSheetsSizes);
    }
    // this.load.spritesheet('scorpion1', 'assets/spritesheets/scorpion-02.png', { frameWidth: 106, frameHeight: 135 });
    // this.load.spritesheet('scorpion2', 'assets/spritesheets/scorpion-02.png', { frameWidth: 106, frameHeight: 135 });
    // this.load.spritesheet('scorpion3', 'assets/spritesheets/scorpion-02.png', { frameWidth: 106, frameHeight: 135 });
    this.load.html('ui', '/assets/html/test.html');
    this.load.audio('enemyAttack', 'assets/music/enemyAttack.wav');
    this.load.audio('changeWeapon', 'assets/music/changeWeapon.wav');
    this.load.audio('deathClawPunch', 'assets/music/deathClawPunch.wav');
    this.load.audio('heroAttack', 'assets/music/heroAttack.wav');
    this.load.audio('heroDamageFromGhoul', 'assets/music/heroDamageFromGhoul.wav');
    this.load.audio('heroDamageFromRadScorpion', 'assets/music/heroDamageFromRadScorpion.wav');
    this.load.audio('fists', 'assets/music/fists.wav');
    this.load.audio('pistol', 'assets/music/pistol.wav');
    this.load.audio('radScorpionDamage', 'assets/music/radScorpionDamage.wav');
    this.load.audio('startFight', 'assets/music/startFight.wav');
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    const map = this.buildMap();
    this.tintTiles(map);
    this.addSounds();
    this.createHero(map);
    this.hero.setFramesForEntityAnimations(this.hero, 'hero', heroAnims, defaultBehavior);
    this.hero.setPunchAnimation();
    this.hero.setShootAnimation();
    this.hero.setGetHidePistolAnimation();
    this.hero.setDamageAnimation();
    this.hero.setDeathAnimation();
    this.createCamera();
    for (let i = 0; i < currentLevel.enemyQuantity; i++) {
      const name = `${currentLevel.enemyName}${i + 1}`;
      this.createEnemy(name, map, 6, currentLevel.infoForCreateEnemies[name].size, currentLevel.infoForCreateEnemies[name].scale);
    }
    // this.createEnemy('scorpion1', map, 6, 'big');
    // this.createEnemy('scorpion2', map, 6, 'small', 0.75);
    // this.createEnemy('scorpion3', map, 6, 'small', 0.75);

    this.gridEngineInit(map);

    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        entityValue.setFramesForEntityAnimations(entityValue, entityKey, currentLevel.enemyAnims, defaultBehavior);
        (entityValue as Enemy).setAttackAnimation();
        (entityValue as Enemy).setDamageAnimation();
        // (entityValue as Enemy).setEnemyWalkBehavior(entityKey, map);
      }
    });
    this.hero.setPointerDownListener(map);
    this.subscribeCharacterToChangeMoving();
    //ui section
    this.ui.createUI(this);
    this.ui.putMessageToConsole('Game loaded');
    this.ui.updateHP(this.hero);
    this.ui.updateAP(this.hero);
    this.ui.updateWeapon(this.hero);
    this.createDamageButton();
    this.ui.setChangeWeaponListener(this.hero);
  }

  addSounds() {
    this.sounds.enemyAttack = this.sound.add('enemyAttack');
    this.sounds.changeWeapon = this.sound.add('changeWeapon');
    this.sounds.deathClawPunch = this.sound.add('deathClawPunch');
    this.sounds.heroAttack = this.sound.add('heroAttack');
    this.sounds.heroDamageFromGhoul = this.sound.add('heroDamageFromGhoul');
    this.sounds.heroDamageFromRadScorpion = this.sound.add('heroDamageFromRadScorpion');
    this.sounds.fists = this.sound.add('fists');
    this.sounds.pistol = this.sound.add('pistol');
    this.sounds.radScorpionDamage = this.sound.add('radScorpionDamage');
    this.sounds.startFight = this.sound.add('startFight');
  }

  createDamageButton() {
    const damageButton = this.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight - 100)
      .createElement('div', 'width: 250px; height: 30px; background-color: black; color: green; cursor: pointer', 'Click me to give hero 1 damage')
    damageButton.scrollFactorX = 0;
    damageButton.scrollFactorY = 0;
    damageButton.addListener('click');
    damageButton.on('click', () => {
      if (this.hero.healthPoints === 0) {
        this.ui.putMessageToConsole('I am already dead. Stop mocking me.');
        return;
      }

      this.hero.healthPoints -= 1;
      this.ui.updateHP(this.hero);
      if (this.hero.healthPoints === 0) {
        this.ui.putMessageToConsole('You killed me.');
        return;
      }
      this.ui.putMessageToConsole('Ouch, you have given me 1 debug damage');
    })
  }

  deleteEntityFromEntitiesMap(entityKey: string) {
    this.entitiesMap.delete(entityKey);
  }

  getEntitiesMap() {
    return this.entitiesMap;
  }

  update() {
    this.hero.moveHeroByArrows();
  }

  buildMap() {
    const map = this.make.tilemap({ key: 'map' });
    const tilesets = map.addTilesetImage(`${currentLevel.tiles}`, 'tiles');

    // Layers creation based on tilemap's layers
    for (let i = 0; i < map.layers.length; i++) {
      map.createLayer(i, tilesets, 0, 0);
    }
    return map;
  }

  createHero(map: Tilemaps.Tilemap) {
    this.hero = this.add.existing(new Hero(this, 'hero', this.gridEngine, map, this.cursors, 20, entitiesTotalActionPoints.hero, this.getEntitiesMap, this.deleteEntityFromEntitiesMap, this.moveEnemiesToHero, this.sounds));
    this.hero.scale = 1.5;
    this.entitiesMap.set('hero', this.hero);
  }

  createEnemy(key: string, map: Tilemaps.Tilemap, battleRadius: number, size = 'big', scaleValue = 1) {
    const enemy = this.add.existing(new Enemy(this, key, this.gridEngine, map, key, 15, battleRadius, size, entitiesTotalActionPoints[currentLevel.enemyName], this.deleteEntityFromEntitiesMap, this.sounds));

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
          startPosition: { x: 68, y: 58 },
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
            startPosition: { x: currentLevel.enemyStartPositions[enemyKey].x, y: currentLevel.enemyStartPositions[enemyKey].y },
            offsetX: currentLevel.enemyOffsetCoords[(enemyValue as Enemy).size].x,
            offsetY: currentLevel.enemyOffsetCoords[(enemyValue as Enemy).size].y,
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

          if (this.hero.currentActionPoints) {
            this.hero.makeStep();
          }
          if (this.hero.currentActionPoints <= 0) {
            this.gridEngine.stopMovement(charId);
            this.refreshAllEnemiesActionPoints();
          }
          // console.log(this.hero.currentActionPoints, charId);
        }
        if (!charId.match(/^hero/i)) {
          const enemy = this.entitiesMap.get(charId) as Enemy;
          if (enemy.currentActionPoints) {
            enemy.makeStep();
          }
          if (enemy.currentActionPoints <= 0) {
            this.gridEngine.stopMovement(charId);
          }
          if (this.isAllEnemiesLostActionPoints()) {
            this.hero.refreshActionPoints();
          }
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

          if (this.isHeroSteppedOnEnemyRadius() || this.hero.fightMode) {
            this.moveEnemiesToHero(enterTile);
            this.enableFightMode();
            this.ui.updateHP(this.hero);
          }
        }
        if (!charId.match(/^hero/i)) {
          const enemy = this.entitiesMap.get(charId) as Enemy;

          if (!this.gridEngine.isMoving(charId) && enemy.currentActionPoints > 0) {
            if (this.isEnemyStaysNearHero(enemy)) {
              enemy.playAttackHeroAnimation(this.hero);
              enemy.attackHero(this.hero);
              this.hero.refreshActionPoints();
              this.ui.updateHP(this.hero);
            } else {
              this.moveEnemiesToHero(this.gridEngine.getPosition(this.hero.id));
              this.ui.updateHP(this.hero);
            }
          }
        }
        // console.log('Hero HP:', this.hero.healthPoints);
      });
  }

  moveEnemiesToHero(targetPos: Position) {
    // get an array of empty tiles around the hero
    const emptyTilesAroundHero: Array<Position> = this.getEmptyPositionsArrNearObject(targetPos as Entity);
    // get an array of the enemies relative to the hero
    const closestEnemiesAroundHero: Array<string> = [];
    this.entitiesMap.forEach((_entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        closestEnemiesAroundHero.push(entityKey);
      }
    });
    try {
      closestEnemiesAroundHero.forEach((enemyKey, index) => {
        const enemyObj = (this.entitiesMap.get(enemyKey) as Enemy);

        enemyObj.clearTimer();
        if (enemyObj.currentActionPoints > 0) {
          if (this.isEnemyStaysNearHero(enemyObj) && !this.gridEngine.isMoving(enemyKey)) {
            enemyObj.playAttackHeroAnimation(this.hero);
            enemyObj.attackHero(this.hero);
            this.hero.refreshActionPoints();
          } else {
            this.gridEngine.moveTo(enemyKey, emptyTilesAroundHero[index]);
          }
        }
      });
    }
    catch (e) {
      console.log('TypeError: Cannot read properties of undefined (reading x)');
      closestEnemiesAroundHero.forEach((enemyKey) => {
        const enemyObj = (this.entitiesMap.get(enemyKey) as Enemy);
        if (enemyObj.currentActionPoints > 0 && this.isEnemyStaysNearHero(enemyObj)
        && !this.gridEngine.isMoving(enemyKey)) {
          enemyObj.playAttackHeroAnimation(this.hero);
          enemyObj.attackHero(this.hero);
          this.gridEngine.stopMovement(enemyKey);
          this.hero.refreshActionPoints();
        }
        enemyObj.clearTimer();
        enemyObj.currentActionPoints = 0;
      });
      return;
    }

  }

  isEnemyStaysNearHero(enemy: Enemy) {
    const enemyPos = this.gridEngine.getPosition(enemy.id);
    const heroPos = this.gridEngine.getPosition(this.hero.id);
    if (enemyPos.x === heroPos.x - 1 && enemyPos.y === heroPos.y) {
      return true;
    }
    if (enemyPos.x === heroPos.x && enemyPos.y === heroPos.y - 1) {
      return true;
    }
    if (enemyPos.x === heroPos.x + 1 && enemyPos.y === heroPos.y) {
      return true;
    }
    if (enemyPos.x === heroPos.x && enemyPos.y === heroPos.y + 1) {
      return true;
    }
    return false;
  }

  getEmptyPositionsArrNearObject(obj: Entity) {
    const emptyTilesAroundHero: Array<Position> = [];
    if (!this.gridEngine.isBlocked({ x: obj.x - 1, y: obj.y })) {
      emptyTilesAroundHero.push({ x: obj.x - 1, y: obj.y });
    }
    if (!this.gridEngine.isBlocked({ x: obj.x, y: obj.y - 1 })) {
      emptyTilesAroundHero.push({ x: obj.x, y: obj.y - 1 });
    }
    if (!this.gridEngine.isBlocked({ x: obj.x + 1, y: obj.y })) {
      emptyTilesAroundHero.push({ x: obj.x + 1, y: obj.y });
    }
    if (!this.gridEngine.isBlocked({ x: obj.x, y: obj.y + 1 })) {
      emptyTilesAroundHero.push({ x: obj.x, y: obj.y + 1 });
    }

    return emptyTilesAroundHero;
  }

  isHeroSteppedOnEnemyRadius() {
    const heroPos = this.gridEngine.getPosition('hero');
    let isStepped = false;

    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        const enemyPos = this.gridEngine.getPosition(entityKey);
        if (manhattanDist(enemyPos.x, enemyPos.y, heroPos.x, heroPos.y) <= (entityValue as Enemy).battleRadius) {
          // console.log(`Hero stepped on enemy radius: (${heroPos.x},${heroPos.y})`);
          isStepped = true;
        }
      }
    });
    return isStepped;
  }

  enableFightMode() {
    this.entitiesMap.forEach((entityValue) => {
      entityValue.fightMode = true;
    });
  }

  refreshAllEnemiesActionPoints() {
    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        entityValue.refreshActionPoints();
      }
    });
  }

  isAllEnemiesLostActionPoints() {
    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i) && entityValue.currentActionPoints > 0) {
        return false;
      }
    });
    return true;
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
    this.tintTile(map, 40, 48, 0xaf22ff); // magenta
    this.tintTile(map, 0, 0, 0xaf2462); // red
    this.tintTile(map, 48, 53, 0xaf2462); // red
    // this.tintTile(map, currentLevel.sta.scorpion1.x, startPositionsForScorpions.scorpion1.y, 0xaf2462); // red (unreachable)
    // this.tintTile(map, startPositionsForScorpions.scorpion2.x, startPositionsForScorpions.scorpion2.y, 0xaf2462);
  }

  tintRadius(tilemap: Tilemaps.Tilemap, posX: number, posY: number, radius: number, color: number) {
    for (let x = 0; x <= radius; x++) {
      for (let y = 0; y <= radius; y++) {
        if (manhattanDist(posX, posY, posX + x, posY + y) <= radius) {
          this.tintTile(tilemap, posX + x, posY + y, color);
        }
        if (manhattanDist(posX, posY, posX - x, posY + y) <= radius) {
          this.tintTile(tilemap, posX - x, posY + y, color);
        }
        if (manhattanDist(posX, posY, posX + x, posY - y) <= radius) {
          this.tintTile(tilemap, posX + x, posY - y, color);
        }
        if (manhattanDist(posX, posY, posX - x, posY - y) <= radius) {
          this.tintTile(tilemap, posX - x, posY - y, color);
        }
      }
    }
  }
}

export default Game;
