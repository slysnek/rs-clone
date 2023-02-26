import Phaser, { Tilemaps } from 'phaser';
import { GridEngine, Position } from 'grid-engine';
import { windowSize, heroAnims } from './constants';
import Enemy from './enemy';
import Hero from './hero';
import { gridEngineType } from './types';
import UI from './ui';
import { entitiesTotalActionPoints } from './battlePoints';
import { manhattanDist } from './utils';
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
  inventoryContainer: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

  constructor(hero: Hero, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine, inventoryContainer: Phaser.Types.Physics.Arcade.SpriteWithStaticBody, ui: UI) {
    super('game');
    this.hero = hero;
    this.entitiesMap = new Map();
    this.cursors = cursors;
    this.target = new Phaser.Math.Vector2();
    this.gridEngine = gridEngine;
    this.getEntitiesMap = this.getEntitiesMap.bind(this);
    this.deleteEntityFromEntitiesMap = this.deleteEntityFromEntitiesMap.bind(this);
    this.moveEnemiesToHero = this.moveEnemiesToHero.bind(this);
    this.ui = ui;
    this.sounds = {};
    this.inventoryContainer = inventoryContainer;
  }

  preload() {
    this._preloadLoadBar();

    this.load.tilemapTiledJSON('map', `assets/maps/${currentLevel.map}.json`);
    this.load.image('tiles', `assets/maps/${currentLevel.tiles}.png`);
    this.load.spritesheet('hero', 'assets/spritesheets/woman-13-spritesheet.png', { frameWidth: 75, frameHeight: 133 });
    for (let i = 0; i < currentLevel.enemyQuantity; i++) {
      this.load.spritesheet(`${currentLevel.enemyName}${i + 1}`, `assets/spritesheets/${currentLevel.enemySpriteSheet}.png`, currentLevel.spriteSheetsSizes);
    }
    this.load.html('ui', '/assets/html/test.html');

    this._preloadSounds();

    // this.input.setDefaultCursor('url("assets/cursor/cursor-24x24.png"), pointer');
    this.load.image('dump', 'assets/maps/dump.png');
  }

  private _preloadLoadBar() {
    //loading screen
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(100, windowSize.windowHeight / 2, windowSize.windowWidth - 200, 50);

    const loadingText = this.make.text({
      x: 100,
      y: windowSize.windowHeight / 2 - 50,
      text: 'Loading...',
      style: {
        font: '28px monospace',
        fontFamily: 'Fallout Font',
        color: '#3cf800'
      }
    });

    const percentText = this.make.text({
      x: windowSize.windowWidth / 2,
      y: windowSize.windowHeight / 2 + 10,
      text: '0%',
      style: {
        font: '28px monospace',
        color: '#3cf800'
      }
    });

    const assetText = this.make.text({
      x: 100,
      y: windowSize.windowHeight / 2 + 55,
      text: '',
      style: {
        font: '20px monospace',
        color: 'white'
      }
    });

    this.load.on('progress', function (value: number) {
      progressBar.clear();
      progressBar.fillStyle(0x3cf800, 1);
      progressBar.fillRect(100, windowSize.windowHeight / 2, (windowSize.windowWidth - 200) * value, 50);
      percentText.setText((value * 100).toFixed(1) + '%');
    });

    this.load.on('fileprogress', function (file: { key: string; }) {
      assetText.setText('Loading asset: ' + file.key);
    });
    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  private _preloadSounds() {
    // hero gets damage
    this.load.audio('heroDamageFromEnemy', currentLevel.enemySounds.heroDamageFromEnemy.src);
    // enemy attack sound
    this.load.audio('enemyPunch', currentLevel.enemySounds.enemyPunch.src);
    // enemy gets damage
    this.load.audio('enemyDamage', currentLevel.enemySounds.enemyDamage.src);
    // enemy dies
    this.load.audio('enemyDeath', currentLevel.enemySounds.enemyDeath.src);
    console.log(currentLevel.enemySounds.enemyDeath.src);
    // hero sounds
    this.load.audio('heroDeath', 'assets/sounds/heroSounds/heroDeath.wav');
    this.load.audio('fistsAttack', 'assets/sounds/heroSounds/fistsAttack.wav');
    this.load.audio('pistolAttack', 'assets/sounds/heroSounds/pistolAttack.wav');
    // ui sounds
    this.load.audio('changeWeapon', 'assets/sounds/uiSounds/changeWeapon.wav');
    this.load.audio('startFight', 'assets/sounds/uiSounds/startFight.wav');
    this.load.audio('buttonClick', 'assets/sounds/uiSounds/buttonClick1.wav'); // всего их 4
    this.load.audio('itemMove', 'assets/sounds/uiSounds/itemMove.wav');
    this.load.audio('openChest', 'assets/sounds/uiSounds/openChest.wav');
    this.load.audio('stimpak', 'assets/sounds/uiSounds/stimpak.wav');
    this.load.audio('beer', 'assets/sounds/uiSounds/beer.wav');
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    const map = this.buildMap();
    // this.tintTiles(map);
    this._createSounds();
    this.createHero(map);
    this.ui = new UI(this,
      this.hero.addItemToInventory,
      this.hero.inventory,
      this.hero.deleteItemFromInventory,
      this.hero.putOnArmor,
      this.hero.takeOffArmor,
      this.hero.isHeroInArmor);
    this.hero.setUiProperty(this.ui);
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
    this.placeObject();
    this.setInventoryContainerListener();
    this.gridEngineInit(map);
    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        entityValue.setFramesForEntityAnimations(entityValue, entityKey, currentLevel.enemyAnims, defaultBehavior);
        (entityValue as Enemy).setAttackAnimation();
        (entityValue as Enemy).setDamageAnimation();
        (entityValue as Enemy).setEnemyWalkBehavior(entityKey);
      }
    });
    this.hero.setPointerDownListener(map);
    this.subscribeCharacterToChangeMoving();
    this._createUI();
  }

  private _createSounds() {
    // hero gets damage
    this.sounds.heroDamageFromEnemy = this.sound.add('heroDamageFromEnemy', {
      volume: currentLevel.enemySounds.heroDamageFromEnemy.volume
    });
    // enemy attack sound
    this.sounds.enemyPunch = this.sound.add('enemyPunch', {
      volume: currentLevel.enemySounds.enemyPunch.volume
    });
    // enemy gets damage
    this.sounds.enemyDamage = this.sound.add('enemyDamage', {
      volume: currentLevel.enemySounds.enemyDamage.volume
    });
    // enemy dies
    this.sounds.enemyDeath = this.sound.add('enemyDeath', {
      volume: currentLevel.enemySounds.enemyDeath.volume
    });
    // hero sounds
    this.sounds.heroDeath = this.sound.add('heroDeath', { volume: 1 });
    this.sounds.fists = this.sound.add('fistsAttack', { volume: 3 });
    this.sounds.pistol = this.sound.add('pistolAttack', { volume: 2 });
    // ui sounds
    this.sounds.changeWeapon = this.sound.add('changeWeapon', { volume: 2 });
    this.sounds.startFight = this.sound.add('startFight', { volume: 6 });
    this.sounds.buttonClick = this.sound.add('buttonClick', { volume: 2 });
    this.sounds.itemMove = this.sound.add('itemMove', { volume: 2 });
    this.sounds.openChest = this.sound.add('openChest', { volume: 2 });
    this.sounds.stimpak = this.sound.add('stimpak', { volume: 0.75 });
    this.sounds.beer = this.sound.add('beer', { volume: 3 });
  }

  private _createUI() {
    this.ui.createUI(this)
    this.ui.putMessageToConsole('Game loaded')
    this.ui.updateHP(this.hero)
    this.ui.updateAP(this.hero)
    this.ui.updateWeapon(this.hero)
    this.ui.setInvButtonListener();
    this.ui.setChangeWeaponListener(this.hero)
    this.ui.setTakeAllButtonListener();
    this.ui.setCloseExchangePanelButtonListener();
    this.ui.setCloseInventoryPanelButtonListener();
    this.ui.setArmorContainerListener();
  }

  deleteEntityFromEntitiesMap(entityKey: string) {
    this.entitiesMap.delete(entityKey);
  }

  getEntitiesMap() {
    return this.entitiesMap;
  }

  update() {
    this.hero.moveHeroByArrows();
    this.sortEntitiesByDepth();
  }

  sortEntitiesByDepth() {
    this.entitiesMap.forEach((entityValue, entityKey) => {
      entityValue.setDepth(entityValue.y + this.gridEngine.getOffsetY(entityKey));
    });
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
    this.hero = this.add.existing(new Hero(this, 'hero', this.gridEngine, map, this.cursors, 20, entitiesTotalActionPoints.hero, this.getEntitiesMap, this.deleteEntityFromEntitiesMap, this.moveEnemiesToHero, this.sounds, this.ui));
    this.hero.scale = 1.5;
    this.entitiesMap.set('hero', this.hero);
  }

  createEnemy(key: string, map: Tilemaps.Tilemap, battleRadius: number, size = 'big', scaleValue = 1) {
    const enemy = this.add.existing(new Enemy(this, key, this.gridEngine, map, key, 15, battleRadius, size, entitiesTotalActionPoints[currentLevel.enemyName], this.deleteEntityFromEntitiesMap, this.sounds, this.ui));

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
          startPosition: currentLevel.heroStartCoords,
          offsetX: 0,
          offsetY: 42,
          walkingAnimationEnabled: false,
          speed: 7,
        },
        {
          id: 'dump',
          sprite: this.inventoryContainer,
          startPosition: { x: 72, y: 48 },
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
      if (charId.match(/^hero/i)) {
        this.hero.clearColoredTiles();
      }
    });

    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Hero | Enemy;
      entity.anims.stop();
      entity.setFrame(entity.getStopFrame(direction, charId));
      this.hero.drawBattleTiles();
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

          if (this.hero.currentActionPoints <= 0) {
            this.gridEngine.stopMovement(charId);
            this.refreshAllEnemiesActionPoints();
          }
          if (this.hero.currentActionPoints) {
            this.hero.makeStep();
          }
        }
        if (!charId.match(/^hero/i)) {
          const enemy = this.entitiesMap.get(charId) as Enemy;
          if (enemy.currentActionPoints <= 0) {
            this.gridEngine.stopMovement(charId);
          }
          if (enemy.currentActionPoints) {
            enemy.makeStep();
          }
          if (this.isAllEnemiesLostActionPoints()) {
            this.hero.refreshActionPoints();
          }
        }

        this.ui.updateHP(this.hero);
        this.ui.updateAP(this.hero);
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
            this.enableFightMode();
            this.moveEnemiesToHero(enterTile);
            this.ui.updateHP(this.hero);
          }
        }

        if (!charId.match(/^hero/i)) {
          const enemy = this.entitiesMap.get(charId) as Enemy;
          if (enemy.currentActionPoints <= 0) {
            this.gridEngine.stopMovement(charId);
          }
          if (!this.gridEngine.isMoving(charId) && enemy.currentActionPoints > 0 && enemy.fightMode) {
            if (this.isEnemyStaysNearHero(enemy)) {
              enemy.attackHero(this.hero);
              this.hero.refreshActionPoints();
              this.hero.drawBattleTiles();
            } else {
              this.moveEnemiesToHero(this.gridEngine.getPosition(this.hero.id));
            }
          }
        }

        this.ui.updateHP(this.hero);
        this.ui.updateAP(this.hero);
      });
  }

  moveEnemiesToHero(targetPos: Position) {
    const emptyTilesAroundHero: Array<Position> = this.getEmptyPositionsArrNearObject(targetPos as Entity);
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
        if (!this.gridEngine.isMoving(enemyKey) && enemyObj.currentActionPoints > 0 && enemyObj.fightMode) {
          if (this.isEnemyStaysNearHero(enemyObj)) {
            enemyObj.attackHero(this.hero);
            this.hero.refreshActionPoints();
            this.hero.drawBattleTiles();
          } else {
            this.gridEngine.moveTo(enemyKey, emptyTilesAroundHero[index]);
          }
        }
      });
    }
    catch (e) {
      // console.log('TypeError: Cannot read properties of undefined (reading x)');
      closestEnemiesAroundHero.forEach((enemyKey) => {
        const enemyObj = (this.entitiesMap.get(enemyKey) as Enemy);
        if (enemyObj.currentActionPoints > 0 && this.isEnemyStaysNearHero(enemyObj)
          && !this.gridEngine.isMoving(enemyKey) && enemyObj.fightMode) {
          this.gridEngine.stopMovement(enemyKey);
          enemyObj.attackHero(this.hero);
          this.hero.refreshActionPoints();
          this.hero.drawBattleTiles();
        }
        enemyObj.clearTimer();
        enemyObj.currentActionPoints = 0;
      });
      return;
    }
    this.ui.updateHP(this.hero);
    this.ui.updateAP(this.hero);
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
    // this.tintTile(map, currentLevel.enemyStartPositions.ghoul1.x, currentLevel.enemyStartPositions.ghoul1.y, 0xaf2462); // red (unreachable)
    // this.tintTile(map, currentLevel.enemyStartPositions.ghoul2.x, currentLevel.enemyStartPositions.ghoul2.y, 0xaf2462);
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

  placeObject() {
    this.inventoryContainer = this.physics.add.staticSprite(0, 0, 'dump');
  }

  setInventoryContainerListener() {
    this.inventoryContainer.setInteractive().on('pointerdown', (pointer: Phaser.Types.Input.Keyboard.CursorKeys, localX: number, localY: number, event: Event) => {
      event.stopPropagation();
      const heroPosition = this.gridEngine.getPosition('hero');
      const inventoryContainerPosition = this.gridEngine.getPosition('dump');
      const isXPositionRight = ((inventoryContainerPosition.x - 2) <= heroPosition.x && (inventoryContainerPosition.x + 2) >= heroPosition.x);
      const iYPositionRight = ((inventoryContainerPosition.y - 2) <= heroPosition.y && (inventoryContainerPosition.y + 2) >= heroPosition.y)
      if (iYPositionRight && isXPositionRight) {
        this.ui.showExchangePanel();
      }
    }, this);
  }
}

export default Game;
