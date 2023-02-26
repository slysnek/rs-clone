import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine, Position } from 'grid-engine';
import Enemy from "./enemy";
import { damageFromHero, lostActionPointsForHero } from './battlePoints';
import { colors, heroAnims, oppositeDirections } from "./constants";
import Weapon from './weapon'
import { attack, manhattanDist, randomIntFromInterval } from './utils';
import UI from './ui';
import { thingsContainerItemsType } from './types';

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
    this.mainWeapon = new Weapon('fists', './assets/weapons/fist.png', 5, 75, 85, 1);
    this.secondaryWeapon = new Weapon('pistol', './assets/weapons/pistol-03.png', 12, 55, 75, 3);
    this.currentWeapon = this.mainWeapon;
    this.id = 'hero';
    this.deleteEntityFromEntitiesMap = deleteEntityFromEntitiesMap;
    this.moveEnemiesToHero = moveEnemiesToHero;
    this.ui = ui;
    this.sounds = sounds;
    this.inventory = {
      pistol: {
        src: '../assets/ui-elements/inventory/pistol-03.png',
        quantity: 1
      },
    };
    this.addItemToInventory = this.addItemToInventory.bind(this);
    this.deleteItemFromInventory = this.deleteItemFromInventory.bind(this);
    this.isHeroInArmor = false;
  }

  setUiProperty(ui: UI) {
    this.ui = ui;
  }

  setPointerDownListener(map: Tilemaps.Tilemap) {
    // Moving on mouse click
    this.scene.input.on('pointerdown', () => {
      // Converting world coords into tile coords
      const gridMouseCoords = map.worldToTileXY(this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY);
      gridMouseCoords.x = Math.round(gridMouseCoords.x) - 1;
      gridMouseCoords.y = Math.round(gridMouseCoords.y);

      const clickedTile = map.getTileAt(gridMouseCoords.x, gridMouseCoords.y, false, 0);

      // clickedTile.alpha = 0.85;
      // clickedTile.tint = 0xff7a4a;

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

  changeWeapon() {
    if (this.currentWeapon.name === this.mainWeapon.name) this.currentWeapon = this.secondaryWeapon;
    else this.currentWeapon = this.mainWeapon;
    this.behavior = this.currentWeapon.name === 'pistol' ? 'walkWithPistol' : 'walk';
    this.changeAnimationWithWeapon(this.behavior);
    this.sounds.changeWeapon.play();
    this.drawBattleTiles(); // !
  }

  setPunchAnimation() {
    this.createEntityAnimation('fists_up-right', 'hero', heroAnims.fists.upRight.startFrame, heroAnims.fists.upRight.endFrame, 0);
    this.createEntityAnimation('fists_down-right', 'hero', heroAnims.fists.downRight.startFrame, heroAnims.fists.downRight.endFrame, 0);
    this.createEntityAnimation('fists_down-left', 'hero', heroAnims.fists.downLeft.startFrame, heroAnims.fists.downLeft.endFrame, 0);
    this.createEntityAnimation('fists_up-left', 'hero', heroAnims.fists.upLeft.startFrame, heroAnims.fists.upLeft.endFrame, 0);
  }

  setShootAnimation() {
    this.createEntityAnimation('pistol_up-right', 'hero', heroAnims.pistol.upRight.startFrame, heroAnims.pistol.upRight.endFrame, 0);
    this.createEntityAnimation('pistol_down-right', 'hero', heroAnims.pistol.downRight.startFrame, heroAnims.pistol.downRight.endFrame, 0);
    this.createEntityAnimation('pistol_down-left', 'hero', heroAnims.pistol.downLeft.startFrame, heroAnims.pistol.downLeft.endFrame, 0);
    this.createEntityAnimation('pistol_up-left', 'hero', heroAnims.pistol.upLeft.startFrame, heroAnims.pistol.upLeft.endFrame, 0);
  }

  setDamageAnimation() {
    this.createEntityAnimation('damage-fists_up-right', 'hero', heroAnims.damageWithFist.upRight.startFrame, heroAnims.damageWithFist.upRight.endFrame, 0);
    this.createEntityAnimation('damage-fists_down-right', 'hero', heroAnims.damageWithFist.downRight.startFrame, heroAnims.damageWithFist.downRight.endFrame, 0);
    this.createEntityAnimation('damage-fists_down-left', 'hero', heroAnims.damageWithFist.downLeft.startFrame, heroAnims.damageWithFist.downLeft.endFrame, 0);
    this.createEntityAnimation('damage-fists_up-left', 'hero', heroAnims.damageWithFist.upLeft.startFrame, heroAnims.damageWithFist.upLeft.endFrame, 0);
    this.createEntityAnimation('damage-pistol_up-right', 'hero', heroAnims.damageWithPistol.upRight.startFrame, heroAnims.damageWithPistol.upRight.endFrame, 0);
    this.createEntityAnimation('damage-pistol_down-right', 'hero', heroAnims.damageWithPistol.downRight.startFrame, heroAnims.damageWithPistol.downRight.endFrame, 0);
    this.createEntityAnimation('damage-pistol_down-left', 'hero', heroAnims.damageWithPistol.downLeft.startFrame, heroAnims.damageWithPistol.downLeft.endFrame, 0);
    this.createEntityAnimation('damage-pistol_up-left', 'hero', heroAnims.damageWithPistol.upLeft.startFrame, heroAnims.damageWithPistol.upLeft.endFrame, 0);
  }

  setDeathAnimation() {
    this.createEntityAnimation('death', 'hero', heroAnims.death.upLeft.startFrame, heroAnims.death.upLeft.endFrame, 0);
  }

  setGetHidePistolAnimation() {
    this.createEntityAnimation('getPistol_up-right', 'hero', heroAnims.getPistol.upRight.startFrame, heroAnims.getPistol.upRight.endFrame, 0);
    this.createEntityAnimation('getPistol_down-right', 'hero', heroAnims.getPistol.downRight.startFrame, heroAnims.getPistol.downRight.endFrame, 0);
    this.createEntityAnimation('getPistol_down-left', 'hero', heroAnims.getPistol.downLeft.startFrame, heroAnims.getPistol.downLeft.endFrame, 0);
    this.createEntityAnimation('getPistol_up-left', 'hero', heroAnims.getPistol.upLeft.startFrame, heroAnims.getPistol.upLeft.endFrame, 0);
    this.createEntityAnimation('hidePistol_up-right', 'hero', heroAnims.hidePistol.upRight.startFrame, heroAnims.hidePistol.upRight.endFrame, 0);
    this.createEntityAnimation('hidePistol_down-right', 'hero', heroAnims.hidePistol.downRight.startFrame, heroAnims.hidePistol.downRight.endFrame, 0);
    this.createEntityAnimation('hidePistol_down-left', 'hero', heroAnims.hidePistol.downLeft.startFrame, heroAnims.hidePistol.downLeft.endFrame, 0);
    this.createEntityAnimation('hidePistol_up-left', 'hero', heroAnims.hidePistol.upLeft.startFrame, heroAnims.hidePistol.upLeft.endFrame, 0);
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
    this.setFramesForEntityAnimations(this, 'hero', heroAnims, behavior);
    this.behavior === 'walk' ? this.anims.play(`hidePistol_${currentDirection}`) : this.anims.play(`getPistol_${currentDirection}`);
  }

  attackEnemy(enemy: Enemy) {
    const heroCoords = this.gridEngine.getPosition(this.id);
    const enemyCoords = this.gridEngine.getPosition(enemy.id);
    const HeroAnimationDirection = attack(heroCoords, enemyCoords, this.currentWeapon.maxRange);
    if (!HeroAnimationDirection) {
      return;
    } else {
      this._attackEnemyAnimation(enemy, HeroAnimationDirection);
      this._dealDamageToEnemy(enemy);
      this._decreaseHeroAPOnAttack();
      this._isHeroEndTurn();
      this.isAllEnemiesDead();
    }
  }

  private _attackEnemyAnimation(enemy: Enemy, HeroAnimationDirection: "up-right" | "down-left" | "up-left" | "down-right" | "" | undefined) {
    this.anims.play(`${this.currentWeapon.name}_${HeroAnimationDirection}`);
    this.sounds[this.currentWeapon.name].play();
    enemy.play(`damage_${oppositeDirections.get(HeroAnimationDirection)}`);
    this.sounds.radScorpionDamage.play();
  }

  private _dealDamageToEnemy(enemy: Enemy) {
    // changing accuracy. Is enough to attack?
    if (this.currentWeapon.getRandomAccuracy >= randomIntFromInterval(0, 100)) {
      const damage = damageFromHero[this.currentWeapon.name];
      enemy.updateHealthPoints(damage);
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

  moveHeroByArrows() {
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

  playDeathAnimation() {
    this.anims.play('death');
    this.deleteEntityFromEntitiesMap(this.id);
  }

  addItemToInventory(itemName: string, item: { src: string; quantity: number }) {
    this.inventory[itemName] = item;
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

  // TODO: сделать выделение тайлов на первой картинке с альфа каналом и другим цветом,
  // чтобы было едва видно и оставить красную подсветку под врагами
  // единственный вопрос что будет если они наложатся друг на друга
  // ? разбить метод на draw и clear если не получится подчищать при движении?
  // TODO: ! переназвать attack в isAbleToAttack

  // TODO: в entity сделать _fightMode, в Hero и Enemy - fightMode prop
  // в enemy простой, в hero на отслеживание смены состояния
  drawBattleTiles() {
    if (this.fightMode) {
      this.clearColoredTiles();
      this._drawWeaponDistanceTiles();
      this._drawHittableEnemiesTiles();
    }
  }

  // TODO: альфа-канал или разные цвета
  clearColoredTiles() {
    const heroCoords = this.gridEngine.getPosition(this.id);
    const weaponsMaxRangeDoubled = Math.max(this.mainWeapon.maxRange, this.secondaryWeapon.maxRange) * 2;

    for (let x = 0; x <= weaponsMaxRangeDoubled; x++) {
      for (let y = 0; y <= weaponsMaxRangeDoubled; y++) {
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x + x, heroCoords.y + y) <= weaponsMaxRangeDoubled) {
          this.tintTile(this.map, heroCoords.x + x, heroCoords.y + y, colors.TRANSPARENT);
        }
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x - x, heroCoords.y + y) <= weaponsMaxRangeDoubled) {
          this.tintTile(this.map, heroCoords.x - x, heroCoords.y + y, colors.TRANSPARENT);
        }
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x + x, heroCoords.y - y) <= weaponsMaxRangeDoubled) {
          this.tintTile(this.map, heroCoords.x + x, heroCoords.y - y, colors.TRANSPARENT);
        }
        if (manhattanDist(heroCoords.x, heroCoords.y, heroCoords.x - x, heroCoords.y - y) <= weaponsMaxRangeDoubled) {
          this.tintTile(this.map, heroCoords.x - x, heroCoords.y - y, colors.TRANSPARENT);
        }
      }
    }
  }

  private _drawWeaponDistanceTiles() {
    // ? вынести в аргументы?
    const heroCoords = this.gridEngine.getPosition(this.id);

    for (let i = 1; i <= this.currentWeapon.maxRange; i++) {
      this.tintTile(this.map, heroCoords.x + i, heroCoords.y, colors.WEAPON_RANGE);
      this.tintTile(this.map, heroCoords.x - i, heroCoords.y, colors.WEAPON_RANGE);
      this.tintTile(this.map, heroCoords.x, heroCoords.y + i, colors.WEAPON_RANGE);
      this.tintTile(this.map, heroCoords.x, heroCoords.y - i, colors.WEAPON_RANGE);
    }
  }

  private _drawHittableEnemiesTiles() {
    this.getEntitiesMap().forEach((entityValue, entityKey) => {
      if (!entityKey.match(/^hero/i)) {
        const enemyCoords = this.gridEngine.getPosition(entityKey);
        const heroCoords = this.gridEngine.getPosition(this.id);
        const HeroAnimationDirection = attack(heroCoords, enemyCoords, this.currentWeapon.maxRange);
        if (HeroAnimationDirection) {
          this.tintTile(this.map, enemyCoords.x, enemyCoords.y, colors.ENEMY_TILE);
        }
      }
    });
  }

  // ? private
  tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number, alpha = 1) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
      element.tilemapLayer.layer.data[row][col].alpha = alpha;
    }
  }
}

export default Hero;