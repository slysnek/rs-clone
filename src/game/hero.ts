import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine, Position } from 'grid-engine';
import Enemy from "./enemy";
import { damageFromHero, lostActionPointsForHero } from './battlePoints';
import { colors, oppositeDirections } from "./constants";
import Weapon from './weapon'
import { isAbleToAnimateAttack, manhattanDist, randomIntFromInterval } from './utils';
import UI from './ui';
import { Animations, thingsContainerItemsType } from './types';
import { currentLevel } from "./levels";
import { armorHealthPoints } from './constants';

class Hero extends Entity {
  gridEngine: GridEngine;
  map: Tilemaps.Tilemap;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  getEntitiesMap: () => Map<string, Hero | Enemy>;
  secondaryWeapon: Weapon;
  currentWeapon: Weapon;
  id: string;
  deleteEntityFromEntitiesMap: (entityKey: string) => void;
  moveEnemiesToHero: (heroPos: Position) => void;
  sounds: { [soundName: string]: Phaser.Sound.BaseSound };
  ui: UI;
  inventory: thingsContainerItemsType;
  isHeroInArmor: boolean;

  public get fightMode(): boolean {
    return this._fightMode;
  }
  public set fightMode(value: boolean) {
    if (this._fightMode !== value) {
      if (value) {
        this.gridEngine.stopMovement(this.id);
        this.sounds.startFight.play();
      }
      this._fightMode = value;
    }
  }

  constructor(scene: Phaser.Scene,
    texture: string,
    gridEngine: GridEngine,
    map: Tilemaps.Tilemap,
    cursor: Phaser.Types.Input.Keyboard.CursorKeys,
    healthPoints: number,
    totalActionPoints: number,
    getEntitiesMap: () => Map<string, Hero | Enemy>,
    deleteEntityFromEntitiesMap: (entityKey: string) => void,
    moveEnemiesToHero: (heroPos: Position) => void,
    sounds: { [soundName: string]: Phaser.Sound.BaseSound },
    ui: UI) {
    super(scene, texture, healthPoints, totalActionPoints)
    this.scene = scene;
    this.gridEngine = gridEngine;
    this.map = map;
    this.cursor = cursor;
    this.getEntitiesMap = getEntitiesMap;
    this.mainWeapon = new Weapon('fists', './assets/weapons/fist.png', damageFromHero.fists, 75, 85, 1);
    this.secondaryWeapon = new Weapon('pistol', './assets/weapons/pistol-03.png', damageFromHero.pistol, 65, 80, 3);
    this.currentWeapon = this.mainWeapon;
    this.id = 'hero';
    this.deleteEntityFromEntitiesMap = deleteEntityFromEntitiesMap;
    this.moveEnemiesToHero = moveEnemiesToHero;
    this.ui = ui;
    this.sounds = sounds;
    this.inventory = currentLevel.heroInventory;
    this.addItemToInventory = this.addItemToInventory.bind(this);
    this.deleteItemFromInventory = this.deleteItemFromInventory.bind(this);
    this.changeArmorAnimations = this.changeArmorAnimations.bind(this);
    this.getHeroHealthPoints = this.getHeroHealthPoints.bind(this);
    this.getHeroArmorState = this.getHeroArmorState.bind(this);
    this.putOnArmor = this.putOnArmor.bind(this);
    this.takeOffArmor = this.takeOffArmor.bind(this);
    this.getHeroAnims = this.getHeroAnims.bind(this);
    this.addArmorHealthPoints = this.addArmorHealthPoints.bind(this);
    this.deleteArmorHealthPoints = this.deleteArmorHealthPoints.bind(this);
    this.addHealthPointsFromHeals = this.addHealthPointsFromHeals.bind(this);
    this.restoredActionPoints = this.restoredActionPoints.bind(this);
    this.throwAwayPistol = this.throwAwayPistol.bind(this);
    this.isHeroInArmor = currentLevel.isHeroInArmor;
  }

  restoredActionPoints() {
    if (this.fightMode && this.currentActionPoints > 0 && this.isAllEnemiesIdle()) {
      this.refreshActionPoints();
      this.ui.updateAP(this);
      return true;
    } else {
      return false;
    }
  }

  throwAwayPistol() {
    if (this.currentWeapon === this.secondaryWeapon) {
      this.changeWeapon();
      this.ui.updateWeapon(this);
      this.ui.putMessageToConsole(`Your current weapon: ${this.currentWeapon.name}`);
    }
  }

  isPistolInInventory() {
    // eslint-disable-next-line no-prototype-builtins
    return this.inventory.hasOwnProperty('pistol');
  }

  isItEnoughBullets() {
    // eslint-disable-next-line no-prototype-builtins
    if (this.inventory.hasOwnProperty('bullets')) {
      return this.inventory.bullets.quantity > 0;
    }
  }

  deleteBulletFromInventory() {
    this.inventory.bullets.quantity -= 1;
    if (this.inventory.bullets.quantity === 0) {
      this.deleteItemFromInventory('bullets');
    }
  }

  isPistolAttackAvailable() {
    return this.isPistolInInventory() && this.isItEnoughBullets();
  }

  setUiProperty(ui: UI) {
    this.ui = ui;
  }

  addHealthPointsFromHeals(healthPointsFromHeal: number) {
    this.healthPoints += healthPointsFromHeal;
    this.ui.updateHP(this);
  }

  addArmorHealthPoints() {
    this.healthPoints += armorHealthPoints;
    this.ui.updateHP;
  }

  deleteArmorHealthPoints() {
    this.healthPoints -= armorHealthPoints;
  }

  setPointerDownListener(map: Tilemaps.Tilemap) {
    // Moving on mouse click
    this.scene.input.on('pointerdown', () => {
      if (this.healthPoints <= 0) {
        return;
      }
      // Converting world coords into tile coords
      const gridMouseCoords = map.worldToTileXY(this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY);
      gridMouseCoords.x = Math.round(gridMouseCoords.x) - 1;
      gridMouseCoords.y = Math.round(gridMouseCoords.y);

      const clickedTile = map.getTileAt(gridMouseCoords.x, gridMouseCoords.y, false, 0);

      // attack if fight mode and enough AP
      if (this.fightMode) {
        const entitiesMap = this.getEntitiesMap();
        entitiesMap.forEach((entityValue, entityKey) => {
          if (!entityKey.match(/^hero/i)) {
            const enemyPosition = this.gridEngine.getPosition(entityKey);
            if (enemyPosition.x === clickedTile.x && enemyPosition.y === clickedTile.y
              && this.currentActionPoints >= lostActionPointsForHero[this.currentWeapon.name]
              && this.isAllEnemiesIdle()) {
              this.attackEnemy(entityValue as Enemy);
            }
          }
        });
        // walk if enough AP and all enemies is not moving
        if (this.currentActionPoints > 0 && this.isAllEnemiesIdle()) {
          this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });
        }
        return;
      }

      // walk if not in fight
      this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });

    }, this);
  }

  moveHeroByArrows() {
    if (this.fightMode) {
      if (this.currentActionPoints > 0 && this.isAllEnemiesIdle()) {
        this._moveOnArrows();
      }
    } else {
      this._moveOnArrows();
    }
  }

  private _moveOnArrows() {
    if (this.cursor.left.isDown) {
      this.gridEngine.move("hero", Direction.UP_LEFT);
    } else if (this.cursor.right.isDown) {
      this.gridEngine.move("hero", Direction.DOWN_RIGHT);
    } else if (this.cursor.up.isDown) {
      this.gridEngine.move("hero", Direction.UP_RIGHT);
    } else if (this.cursor.down.isDown) {
      this.gridEngine.move("hero", Direction.DOWN_LEFT);
    }
  }

  changeWeapon() {
    if (this.currentWeapon.name === this.mainWeapon.name) this.currentWeapon = this.secondaryWeapon;
    else this.currentWeapon = this.mainWeapon;
    this.behavior = this.currentWeapon.name === 'pistol' ? 'walkWithPistol' : 'walk';
    this.changeAnimationWithWeapon(this.behavior);
    this.sounds.changeWeapon.play();
    this.drawBattleTiles();
  }

  setPunchAnimation(currentAnims: Animations) {
    this.createEntityAnimation('fists_up-right', 'hero', currentAnims.fists.upRight.startFrame, currentAnims.fists.upRight.endFrame, 0);
    this.createEntityAnimation('fists_down-right', 'hero', currentAnims.fists.downRight.startFrame, currentAnims.fists.downRight.endFrame, 0);
    this.createEntityAnimation('fists_down-left', 'hero', currentAnims.fists.downLeft.startFrame, currentAnims.fists.downLeft.endFrame, 0);
    this.createEntityAnimation('fists_up-left', 'hero', currentAnims.fists.upLeft.startFrame, currentAnims.fists.upLeft.endFrame, 0);
  }

  setShootAnimation(currentAnims: Animations) {
    this.createEntityAnimation('pistol_up-right', 'hero', currentAnims.pistol.upRight.startFrame, currentAnims.pistol.upRight.endFrame, 0);
    this.createEntityAnimation('pistol_down-right', 'hero', currentAnims.pistol.downRight.startFrame, currentAnims.pistol.downRight.endFrame, 0);
    this.createEntityAnimation('pistol_down-left', 'hero', currentAnims.pistol.downLeft.startFrame, currentAnims.pistol.downLeft.endFrame, 0);
    this.createEntityAnimation('pistol_up-left', 'hero', currentAnims.pistol.upLeft.startFrame, currentAnims.pistol.upLeft.endFrame, 0);
  }

  setDamageAnimation(currentAnims: Animations) {
    this.createEntityAnimation('damage-fists_up-right', 'hero', currentAnims.damageWithFist.upRight.startFrame, currentAnims.damageWithFist.upRight.endFrame, 0);
    this.createEntityAnimation('damage-fists_down-right', 'hero', currentAnims.damageWithFist.downRight.startFrame, currentAnims.damageWithFist.downRight.endFrame, 0);
    this.createEntityAnimation('damage-fists_down-left', 'hero', currentAnims.damageWithFist.downLeft.startFrame, currentAnims.damageWithFist.downLeft.endFrame, 0);
    this.createEntityAnimation('damage-fists_up-left', 'hero', currentAnims.damageWithFist.upLeft.startFrame, currentAnims.damageWithFist.upLeft.endFrame, 0);
    this.createEntityAnimation('damage-pistol_up-right', 'hero', currentAnims.damageWithPistol.upRight.startFrame, currentAnims.damageWithPistol.upRight.endFrame, 0);
    this.createEntityAnimation('damage-pistol_down-right', 'hero', currentAnims.damageWithPistol.downRight.startFrame, currentAnims.damageWithPistol.downRight.endFrame, 0);
    this.createEntityAnimation('damage-pistol_down-left', 'hero', currentAnims.damageWithPistol.downLeft.startFrame, currentAnims.damageWithPistol.downLeft.endFrame, 0);
    this.createEntityAnimation('damage-pistol_up-left', 'hero', currentAnims.damageWithPistol.upLeft.startFrame, currentAnims.damageWithPistol.upLeft.endFrame, 0);
  }

  setDeathAnimation(currentAnims: Animations) {
    this.createEntityAnimation('death', 'hero', currentAnims.death.upLeft.startFrame, currentAnims.death.upLeft.endFrame, 0);
  }

  setGetHidePistolAnimation(currentAnims: Animations) {
    this.createEntityAnimation('getPistol_up-right', 'hero', currentAnims.getPistol.upRight.startFrame, currentAnims.getPistol.upRight.endFrame, 0);
    this.createEntityAnimation('getPistol_down-right', 'hero', currentAnims.getPistol.downRight.startFrame, currentAnims.getPistol.downRight.endFrame, 0);
    this.createEntityAnimation('getPistol_down-left', 'hero', currentAnims.getPistol.downLeft.startFrame, currentAnims.getPistol.downLeft.endFrame, 0);
    this.createEntityAnimation('getPistol_up-left', 'hero', currentAnims.getPistol.upLeft.startFrame, currentAnims.getPistol.upLeft.endFrame, 0);
    this.createEntityAnimation('hidePistol_up-right', 'hero', currentAnims.hidePistol.upRight.startFrame, currentAnims.hidePistol.upRight.endFrame, 0);
    this.createEntityAnimation('hidePistol_down-right', 'hero', currentAnims.hidePistol.downRight.startFrame, currentAnims.hidePistol.downRight.endFrame, 0);
    this.createEntityAnimation('hidePistol_down-left', 'hero', currentAnims.hidePistol.downLeft.startFrame, currentAnims.hidePistol.downLeft.endFrame, 0);
    this.createEntityAnimation('hidePistol_up-left', 'hero', currentAnims.hidePistol.upLeft.startFrame, currentAnims.hidePistol.upLeft.endFrame, 0);
  }

  changeAnimationWithWeapon(behavior: string) {
    const currentAnim = this.anims.currentAnim;
    const currentFrame = currentAnim ? currentAnim.key : 'up-right';
    const underScoreIndex = currentFrame.indexOf('_');
    let currentDirection;
    if (underScoreIndex > 1) {
      currentDirection = currentFrame.slice(underScoreIndex + 1);
    } else {
      currentDirection = currentFrame;
    }
    this.anims.remove('up-right');
    this.anims.remove('down-right');
    this.anims.remove('down-left');
    this.anims.remove('up-left');
    this.setFramesForEntityAnimations(this, 'hero', this.currentAnims as Animations, behavior);
    this.behavior === 'walk' ? this.anims.play(`hidePistol_${currentDirection}`) : this.anims.play(`getPistol_${currentDirection}`);
  }

  changeArmorAnimations(currentAnims: Animations) {
    this.currentAnims = currentAnims;
    this.removeAllAnims();
    this.setFramesForEntityAnimations(this, 'hero', currentAnims, 'walk');
    this.setPunchAnimation(currentAnims);
    this.setShootAnimation(currentAnims);
    this.setGetHidePistolAnimation(currentAnims);
    this.setDamageAnimation(currentAnims);
    this.setDeathAnimation(currentAnims);
  }

  removeAllAnims() {
    this.anims.remove('up-right');
    this.anims.remove('down-right');
    this.anims.remove('down-left');
    this.anims.remove('up-left');
    this.anims.remove('fists_up-right');
    this.anims.remove('fists_down-right');
    this.anims.remove('fists_down-left');
    this.anims.remove('fists_up-left');
    this.anims.remove('pistol_up-right');
    this.anims.remove('pistol_down-right');
    this.anims.remove('pistol_down-left');
    this.anims.remove('pistol_up-left');
    this.anims.remove('damage-fists_up-right');
    this.anims.remove('damage-fists_down-right');
    this.anims.remove('damage-fists_down-left');
    this.anims.remove('damage-fists_up-left');
    this.anims.remove('damage-pistol_up-right');
    this.anims.remove('damage-pistol_down-right');
    this.anims.remove('damage-pistol_down-left');
    this.anims.remove('damage-pistol_up-left');
    this.anims.remove('death');
    this.anims.remove('getPistol_up-right');
    this.anims.remove('getPistol_down-right');
    this.anims.remove('getPistol_down-left');
    this.anims.remove('getPistol_up-left');
    this.anims.remove('hidePistol_up-right');
    this.anims.remove('hidePistol_down-right');
    this.anims.remove('hidePistol_down-left');
    this.anims.remove('hidePistol_up-left');
  }

  attackEnemy(enemy: Enemy) {
    const heroCoords = this.gridEngine.getPosition(this.id);
    const enemyCoords = this.gridEngine.getPosition(enemy.id);
    const HeroAnimationDirection = isAbleToAnimateAttack(heroCoords, enemyCoords, this.currentWeapon.maxRange);
    if (!HeroAnimationDirection) {
      return;
    } else {
      if ((this.currentWeapon.name === 'pistol' && this.isPistolAttackAvailable()) || this.currentWeapon.name === 'fists') {
        if (this.currentWeapon.name === 'pistol') {
          this.deleteBulletFromInventory();
        }
        this._attackEnemyAnimation(enemy, HeroAnimationDirection);
        this._dealDamageToEnemy(enemy);
        this._decreaseHeroAPOnAttack();
        this._isHeroEndTurn();
        this.isAllEnemiesDead();
      } else {
        this.sounds.misfire.play();
        this.ui.putMessageToConsole(`Your ${this.currentWeapon.name} is out of ammo`);
      }
    }
  }

  private _attackEnemyAnimation(enemy: Enemy, HeroAnimationDirection: "up-right" | "down-left" | "up-left" | "down-right" | "" | undefined) {
    this.anims.play(`${this.currentWeapon.name}_${HeroAnimationDirection}`);
    enemy.play(`damage_${oppositeDirections.get(HeroAnimationDirection)}`);
    this.sounds[this.currentWeapon.name].play();
  }

  private _dealDamageToEnemy(enemy: Enemy) {
    if (this.currentWeapon.getRandomAccuracy >= randomIntFromInterval(0, 100)) {
      const damage = damageFromHero[this.currentWeapon.name];
      enemy.updateHealthPoints(damage);
      this.sounds.enemyDamage.play();
      if (enemy.healthPoints <= 0) {
        enemy.playDeathAnimation();
        this.drawBattleTiles();
      }
      this.ui.putMessageToConsole(`Hero hits enemy: -${damage} health`);
    } else {
      this.ui.putMessageToConsole(`Hero misses the attack`);
    }
  }

  private _decreaseHeroAPOnAttack() {
    const lostPoints = lostActionPointsForHero[this.currentWeapon.name];
    this.updateActionPoints(lostPoints);
    this.ui.updateAP(this);
  }

  private _isHeroEndTurn() {
    // if hero turn finished with attack, refresh enemies AP then
    if (this.currentActionPoints <= 0) {
      const entitiesMap = this.getEntitiesMap();
      entitiesMap.forEach((entityValue, entityKey) => {
        if (!entityKey.match(/^hero/i)) {
          (entityValue as Enemy).refreshActionPoints();
        }
      });
    }
    this.moveEnemiesToHero(this.gridEngine.getPosition(this.id));
  }

  isAllEnemiesIdle() {
    let isAllIdle = true;
    const entitiesMap = this.getEntitiesMap();
    entitiesMap.forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        if (this.gridEngine.isMoving(entityKey)) {
          isAllIdle = false;
        }
      }
    });
    return isAllIdle;
  }

  isAllEnemiesDead() {
    const entitiesMap = this.getEntitiesMap();
    if (entitiesMap.size === 1) {
      this.fightMode = false;
      this.currentActionPoints = 10;
      this.ui.makeNextLevelButtonAvailable();
      this.ui.setNextLevelButtonListener();
      this.clearColoredTiles();
    }
  }

  makeStep() {
    if (this.fightMode) {
      const lostPoints = lostActionPointsForHero.step;
      this.updateActionPoints(lostPoints);
      this.ui.updateAP(this);
      this.isAllEnemiesDead();
    }
  }

  playDeathAnimation() {
    this.anims.play('death');
    this.deleteEntityFromEntitiesMap(this.id);
    this.sounds.heroDeath.play();
  }

  addItemToInventory(itemName: string, item: { src: string; quantity: number; description: string }) {
    if (this.inventory[itemName]) {
      this.inventory[itemName].quantity = this.inventory[itemName].quantity + item.quantity;
    } else {
      this.inventory[itemName] = item;
    }
  }

  deleteItemFromInventory(itemName: string) {
    delete this.inventory[itemName];
  }

  putOnArmor() {
    this.isHeroInArmor = true;
  }

  takeOffArmor() {
    this.isHeroInArmor = false;
  }
  getHeroHealthPoints() {
    return this.healthPoints;
  }

  getHeroArmorState() {
    return this.isHeroInArmor;
  }
  drawBattleTiles() {
    if (this.fightMode) {
      this.clearColoredTiles();
      this._drawWeaponDistanceTiles();
      this._drawHittableEnemiesTiles();
    }
  }

  clearColoredTiles() {
    const heroCoords = this.gridEngine.getPosition(this.id);
    const weaponsMaxRangeDoubled = Math.max(this.mainWeapon.maxRange, this.secondaryWeapon.maxRange) * 2;

    for (let x = 0; x <= weaponsMaxRangeDoubled; x++) {
      for (let y = 0; y <= weaponsMaxRangeDoubled; y++) {
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x + x, heroCoords.y + y) <= weaponsMaxRangeDoubled) {
          this._tintTile(this.map, heroCoords.x + x, heroCoords.y + y, colors.TRANSPARENT);
        }
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x - x, heroCoords.y + y) <= weaponsMaxRangeDoubled) {
          this._tintTile(this.map, heroCoords.x - x, heroCoords.y + y, colors.TRANSPARENT);
        }
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x + x, heroCoords.y - y) <= weaponsMaxRangeDoubled) {
          this._tintTile(this.map, heroCoords.x + x, heroCoords.y - y, colors.TRANSPARENT);
        }
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x - x, heroCoords.y - y) <= weaponsMaxRangeDoubled) {
          this._tintTile(this.map, heroCoords.x - x, heroCoords.y - y, colors.TRANSPARENT);
        }
      }
    }
  }

  private _drawWeaponDistanceTiles() {
    const heroCoords = this.gridEngine.getPosition(this.id);

    for (let i = 1; i <= this.currentWeapon.maxRange; i++) {
      this._tintTile(this.map, heroCoords.x + i, heroCoords.y, colors.WEAPON_RANGE);
      this._tintTile(this.map, heroCoords.x - i, heroCoords.y, colors.WEAPON_RANGE);
      this._tintTile(this.map, heroCoords.x, heroCoords.y + i, colors.WEAPON_RANGE);
      this._tintTile(this.map, heroCoords.x, heroCoords.y - i, colors.WEAPON_RANGE);
    }
  }

  private _drawHittableEnemiesTiles() {
    this.getEntitiesMap().forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        const enemyCoords = this.gridEngine.getPosition(entityKey);
        const heroCoords = this.gridEngine.getPosition(this.id);
        const HeroAnimationDirection = isAbleToAnimateAttack(heroCoords, enemyCoords, this.currentWeapon.maxRange);
        if (HeroAnimationDirection) {
          this._tintTile(this.map, enemyCoords.x, enemyCoords.y, colors.ENEMY_TILE);
        }
      }
    });
  }

  private _tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number, alpha = 1) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
      element.tilemapLayer.layer.data[row][col].alpha = alpha;
    }
  }
}

export default Hero;