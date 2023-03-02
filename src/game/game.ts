import Phaser, { Tilemaps } from 'phaser';
import { GridEngine, Position } from 'grid-engine';
import { windowSize } from './constants';
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
    this.load.spritesheet('hero', 'assets/spritesheets/hero-all-anims.png', { frameWidth: 75, frameHeight: 133 });
    for (let i = 0; i < currentLevel.enemyQuantity; i++) {
      this.load.spritesheet(`${currentLevel.enemyName}${i + 1}`, `assets/spritesheets/${currentLevel.enemySpriteSheet}.png`, currentLevel.spriteSheetsSizes);
    }
    this.load.html('ui', '/assets/html/ui.html');

    this._preloadSounds();

    this.load.image(currentLevel.storage.key, currentLevel.storage.src);
  }

  private _preloadLoadBar() {
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
    this.load.audio('heroDamageFromEnemy', currentLevel.enemySounds.heroDamageFromEnemy.src);
    this.load.audio('enemyPunch', currentLevel.enemySounds.enemyPunch.src);
    this.load.audio('enemyDamage', currentLevel.enemySounds.enemyDamage.src);
    this.load.audio('enemyDeath', currentLevel.enemySounds.enemyDeath.src);
    this.load.audio('heroDeath', 'assets/sounds/heroSounds/heroDeath.wav');
    this.load.audio('fistsAttack', 'assets/sounds/heroSounds/fistsAttack.wav');
    this.load.audio('pistolAttack', 'assets/sounds/heroSounds/pistolAttack.wav');
    this.load.audio('misfire', 'assets/sounds/heroSounds/misfire.mp3');
    this.load.audio('changeWeapon', 'assets/sounds/uiSounds/changeWeapon.wav');
    this.load.audio('startFight', 'assets/sounds/uiSounds/startFight.wav');
    this.load.audio('buttonClick', 'assets/sounds/uiSounds/buttonClick1.wav');
    this.load.audio('itemMove', 'assets/sounds/uiSounds/itemMove.wav');
    this.load.audio('openChest', 'assets/sounds/uiSounds/openChest.wav');
    this.load.audio('stimpak', 'assets/sounds/uiSounds/stimpak.wav');
    this.load.audio('healPowder', 'assets/sounds/uiSounds/healPowder.wav');
    this.load.audio('beer', 'assets/sounds/uiSounds/beer.wav');
    this.load.audio('dice', 'assets/sounds/uiSounds/DICE.wav');
    this.load.audio('elvis', 'assets/sounds/uiSounds/Elvis_Presley_-_Comon_Comon.mp3');
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    const map = this.buildMap();
    this._createSounds();
    this.createHero(map);
    this.ui = new UI(this,
      this.hero.addItemToInventory,
      this.hero.inventory,
      this.hero.deleteItemFromInventory,
      this.hero.putOnArmor,
      this.hero.takeOffArmor,
      this.hero.changeArmorAnimations,
      this.hero.getHeroHealthPoints,
      this.hero.getHeroArmorState,
      this.hero.getHeroAnims,
      this.hero.addArmorHealthPoints,
      this.hero.deleteArmorHealthPoints,
      this.hero.addHealthPointsFromHeals,
      this.sounds,
      this.hero.restoredActionPoints,
      this.hero.throwAwayPistol);

    this.hero.setUiProperty(this.ui);
    this.hero.setFramesForEntityAnimations(this.hero, 'hero', currentLevel.heroAnims, defaultBehavior);
    this.hero.setPunchAnimation(currentLevel.heroAnims);
    this.hero.setShootAnimation(currentLevel.heroAnims);
    this.hero.setGetHidePistolAnimation(currentLevel.heroAnims);
    this.hero.setDamageAnimation(currentLevel.heroAnims);
    this.hero.setDeathAnimation(currentLevel.heroAnims);

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
    this.sounds.heroDamageFromEnemy = this.sound.add('heroDamageFromEnemy', {
      volume: currentLevel.enemySounds.heroDamageFromEnemy.volume
    });
    this.sounds.enemyPunch = this.sound.add('enemyPunch', {
      volume: currentLevel.enemySounds.enemyPunch.volume
    });
    this.sounds.enemyDamage = this.sound.add('enemyDamage', {
      volume: currentLevel.enemySounds.enemyDamage.volume
    });
    this.sounds.enemyDeath = this.sound.add('enemyDeath', {
      volume: currentLevel.enemySounds.enemyDeath.volume
    });
    this.sounds.heroDeath = this.sound.add('heroDeath', { volume: 1 });
    this.sounds.fists = this.sound.add('fistsAttack', { volume: 3 });
    this.sounds.pistol = this.sound.add('pistolAttack', { volume: 2 });
    this.sounds.changeWeapon = this.sound.add('changeWeapon', { volume: 2 });
    this.sounds.startFight = this.sound.add('startFight', { volume: 3 });
    this.sounds.buttonClick = this.sound.add('buttonClick', { volume: 2 });
    this.sounds.itemMove = this.sound.add('itemMove', { volume: 2 });
    this.sounds.openChest = this.sound.add('openChest', { volume: 2 });
    this.sounds.stimulant = this.sound.add('stimpak', { volume: 0.75 });
    this.sounds.healPowder = this.sound.add('healPowder', { volume: 0.75 });
    this.sounds.beer = this.sound.add('beer', { volume: 4 });
    this.sounds.misfire = this.sound.add('misfire', { volume: 2 });
    this.sounds.dice = this.sound.add('dice', { volume: 2 });
    this.sounds.elvis = this.sound.add('elvis', { volume: 1 });
  }

  private _createUI() {
    this.ui.createUI(this);
    this.ui.putMessageToConsole('Game loaded');
    this.ui.updateHP(this.hero);
    this.ui.updateAP(this.hero);
    this.ui.updateWeapon(this.hero);
    this.ui.setInvButtonListener();
    this.ui.setChangeWeaponListener(this.hero);
    this.ui.setTakeAllButtonListener();
    this.ui.setCloseExchangePanelButtonListener();
    this.ui.setCloseInventoryPanelButtonListener();
    this.ui.setArmorContainerListener();
    this.ui.setEndTurnListener(this.hero, this);
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
    for (let i = 0; i < map.layers.length; i++) {
      map.createLayer(i, tilesets, 0, 0);
    }
    return map;
  }

  createHero(map: Tilemaps.Tilemap) {
    this.hero = this.add.existing(new Hero(this, 'hero', this.gridEngine, map, this.cursors, currentLevel.heroHealthPoints, entitiesTotalActionPoints.hero, this.getEntitiesMap, this.deleteEntityFromEntitiesMap, this.moveEnemiesToHero, this.sounds, this.ui));
    this.hero.scale = 1.5;
    this.entitiesMap.set('hero', this.hero);
  }

  createEnemy(key: string, map: Tilemaps.Tilemap, battleRadius: number, size = 'big', scaleValue = 1) {
    const enemy = this.add.existing(new Enemy(this, key, this.gridEngine, map, key, currentLevel.enemyHealthPoints, battleRadius, size, entitiesTotalActionPoints[currentLevel.enemyName], this.deleteEntityFromEntitiesMap, this.sounds, this.ui));

    this.entitiesMap.set(`${key}`, enemy);
    enemy.scale = scaleValue;
  }

  createCamera() {
    this.cameras.main.setSize(windowSize.windowWidth, windowSize.windowHeight);
    this.cameras.main.startFollow(this.hero, true, 0.2, 0.2, -100, -100);
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
          speed: 4.5,
        },
        {
          id: currentLevel.storage.key,
          sprite: this.inventoryContainer,
          startPosition: currentLevel.storage.position,
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

    this.gridEngine
      .positionChangeStarted()
      .subscribe(({ charId }) => {
        if (charId.match(/^hero/i)) {
          if (this.hero.currentActionPoints) {
            this.hero.makeStep();
          }
          if (this.hero.currentActionPoints <= 0) {
            this.gridEngine.stopMovement(charId);
            this.refreshAllEnemiesActionPoints();
          }
        }
        if (!charId.match(/^hero/i)) {
          const enemy = this.entitiesMap.get(charId) as Enemy;
          if (!enemy) {
            this.gridEngine.stopMovement(charId);
            return;
          }
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

        this.ui.updateHP(this.hero);
        this.ui.updateAP(this.hero);
      });

    this.gridEngine
      .positionChangeFinished()
      .subscribe(({ charId, enterTile }) => {
        if (charId.match(/^hero/i)) {
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
              this.hero.drawBattleTiles();
              this.hero.refreshActionPoints();
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
            this.hero.drawBattleTiles();
            this.hero.refreshActionPoints();
          } else {
            this.gridEngine.moveTo(enemyKey, emptyTilesAroundHero[index]);
          }
        }
      });
    }
    catch (e) {
      closestEnemiesAroundHero.forEach((enemyKey) => {
        const enemyObj = (this.entitiesMap.get(enemyKey) as Enemy);
        if (enemyObj.currentActionPoints > 0 && this.isEnemyStaysNearHero(enemyObj)
          && !this.gridEngine.isMoving(enemyKey) && enemyObj.fightMode) {
          enemyObj.attackHero(this.hero);
          this.hero.drawBattleTiles();
          this.gridEngine.stopMovement(enemyKey);
          this.hero.refreshActionPoints();
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

  placeObject() {
    this.inventoryContainer = this.physics.add.staticSprite(0, 0, currentLevel.storage.key);
  }

  setInventoryContainerListener() {
    this.inventoryContainer.setInteractive().on('pointerdown', (pointer: Phaser.Types.Input.Keyboard.CursorKeys, localX: number, localY: number, event: Event) => {
      event.stopPropagation();
      const heroPosition = this.gridEngine.getPosition('hero');
      const inventoryContainerPosition = this.gridEngine.getPosition(currentLevel.storage.key);
      const isXPositionRight = ((inventoryContainerPosition.x - 1) <= heroPosition.x && (inventoryContainerPosition.x + 1) >= heroPosition.x);
      const iYPositionRight = ((inventoryContainerPosition.y - 1) <= heroPosition.y && (inventoryContainerPosition.y + 1) >= heroPosition.y);
      if (iYPositionRight && isXPositionRight) {
        this.ui.showExchangePanel();
        this.sounds.openChest.play();
      }
    }, this);
  }
}

export default Game;
