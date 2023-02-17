import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import Enemy from "./enemy";
import { damageFromHero, lostActionPointsForHero } from './battlePoints';
import { heroAnims, oppositeDirections } from "./constants";
import Weapon from './weapon'
import attack from './utilsForAttackAnimations';

class Hero extends Entity {
  gridEngine: GridEngine;
  map: Tilemaps.Tilemap;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  getEntitiesMap: () => Map<string, Hero | Enemy>;
  secondaryWeapon: Weapon;
  currentWeapon: Weapon;
  id: string;
  deleteEntityFromEntitiesMap: (entityKey: string) => void;

  constructor(scene: Phaser.Scene,
    texture: string,
    gridEngine: GridEngine,
    map: Tilemaps.Tilemap,
    cursor: Phaser.Types.Input.Keyboard.CursorKeys,
    healthPoints: number,
    totalActionPoints: number,
    getEntitiesMap: () => Map<string, Hero | Enemy>,
    deleteEntityFromEntitiesMap: (entityKey: string) => void) {
    super(scene, texture, healthPoints, totalActionPoints)
    this.scene = scene;
    this.gridEngine = gridEngine;
    this.map = map;
    this.cursor = cursor;
    this.getEntitiesMap = getEntitiesMap;
    this.mainWeapon = new Weapon('fists', './assets/weapons/fist.png', 5, 0.8, 1)
    this.secondaryWeapon = new Weapon('pistol', './assets/weapons/pistol-03.png', 12, 0.6, 3)
    this.currentWeapon = this.mainWeapon;
    this.id = 'hero';
    this.deleteEntityFromEntitiesMap = deleteEntityFromEntitiesMap;
  }

  setPointerDownListener(map: Tilemaps.Tilemap) {
    // Moving on mouse click
    this.scene.input.on('pointerdown', () => {
      // Converting world coords into tile coords
      const gridMouseCoords = map.worldToTileXY(this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY);
      gridMouseCoords.x = Math.round(gridMouseCoords.x) - 1;
      gridMouseCoords.y = Math.round(gridMouseCoords.y);

      const clickedTile = map.getTileAt(gridMouseCoords.x, gridMouseCoords.y, false, 0);
      clickedTile.tint = 0xff7a4a;

      // attack if fight mode and enough AP
      if (this.fightMode) {
        const entitiesMap = this.getEntitiesMap();
        entitiesMap.forEach((entityValue, entityKey) => {
          if (!entityKey.match(/^hero/i)) {
            const enemyPosition = this.gridEngine.getPosition(entityKey);
            if (enemyPosition.x === clickedTile.x && enemyPosition.y === clickedTile.y
              && this.currentActionPoints >= lostActionPointsForHero[this.currentWeapon.name]) {
              // this.playAttackEnemyAnimation(entityValue as Enemy);
              // ! заменить имя
              // this.playAttackEnemyAnimation(entityValue as Enemy);
              // (entityValue as Enemy).playDeathAnimation();
              this.playDeathAnimation();
            }
          }
        });
        // walk if enough AP and all enemies is not moving
        if (this.currentActionPoints > 0 && this.isAllEnemiesIdle()) {
          this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });
        }
        return;
      }

      // walk if enough AP and all enemies is not moving
      this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });

    }, this);
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

  changeWeapon() {
    if (this.currentWeapon.name === this.mainWeapon.name) this.currentWeapon = this.secondaryWeapon;
    else this.currentWeapon = this.mainWeapon;
    this.behavior = this.currentWeapon.name === 'pistol' ? 'walkWithPistol' : 'walk';
    this.changeAnimationWithWeapon(this.behavior);
  }

  // // ?
  // updateAP(distance: number) {
  //   this.currentActionPoints -= distance;
  //   while (this.currentActionPoints < 0) this.currentActionPoints += 10;
  // }

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

  setDeathAnimation(){
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

  playDeathAnimation(){
    this.anims.play('death');
    this.deleteEntityFromEntitiesMap(this.id);
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

  playAttackEnemyAnimation(enemy: Enemy) {
    const heroCoords = this.gridEngine.getPosition(this.id);
    const enemyCoords = this.gridEngine.getPosition(enemy.id);
    const HeroAnimationDirection = attack(heroCoords, enemyCoords, this.currentWeapon.maxRange);
    if (!HeroAnimationDirection) {
      return;
    } else {
      this.anims.play(`${this.currentWeapon.name}_${HeroAnimationDirection}`);
      enemy.play(`damage_${oppositeDirections.get(HeroAnimationDirection)}`);
      // вынести в метод
      const lostPoints = lostActionPointsForHero[this.currentWeapon.name];
      this.updateActionPoints(lostPoints);

      const damage = damageFromHero[this.currentWeapon.name];
      enemy.updateHealthPoints(damage);

      console.log("Hero Weapon:", this.currentWeapon.name);
      console.log("Hero AP:", this.currentActionPoints, ", Enemy HP:", enemy.healthPoints);
    }
  }

  makeStep() {
    if (this.fightMode) {
      const lostPoints = lostActionPointsForHero.step;
      this.updateActionPoints(lostPoints);
    }
  }

  moveHeroByArrows() {
    // Move hero by arrows (can be deleted?)
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
}

export default Hero;