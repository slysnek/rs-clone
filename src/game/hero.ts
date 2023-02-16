import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import Enemy from "./enemy";
import { lostActionPointsForHero } from './battlePoints';
import { heroAnims, oppositeDirections } from "./constants";
import MeleeWeapon from './meleeweapon'

type coords  = {
  x: number,
  y: number
}

function getDirectionTo(entityA: coords, entityB: coords) {
  if (entityA.x === entityB.x) {
    return entityA.y > entityB.y ? 'up-right' : 'down-left';
  }
  
  if (entityA.y === entityB.y) {
    return entityA.x > entityB.x ? 'up-left' : 'down-right';
  }
}

function isAttackPossible(entityA: coords, entityB: coords) {
  if (entityA.x !== entityB.x && entityA.y !== entityB.y) {
  return false;
  }
  return true;
}

function getDistance(entityA: coords, entityB: coords) {
  return Math.abs(entityA.x - entityB.x) + Math.abs(entityA.y - entityB.y)
}

function isAttackInRange(entityA: coords, entityB: coords, attackRange: number) {
  if (isAttackPossible(entityA, entityB)) {
    return getDistance(entityA, entityB) <= attackRange;
  }
  return false;  
}

function attack(entityA: coords, entityB: coords, range: number) {
  if (isAttackInRange(entityA, entityB, range)) {
  return getDirectionTo(entityA, entityB);
  } else {
  return '';
  }
}

class Hero extends Entity {
  gridEngine: GridEngine;
  map: Tilemaps.Tilemap;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  getEntitiesMap: () => Map<string, Hero | Enemy>;
  secondaryWeapon: MeleeWeapon;
  currentWeapon: MeleeWeapon;
  id: string;

  constructor(scene: Phaser.Scene,
    texture: string,
    gridEngine: GridEngine,
    map: Tilemaps.Tilemap,
    cursor: Phaser.Types.Input.Keyboard.CursorKeys,
    healthPoints: number,
    getEntitiesMap: () => Map<string, Hero | Enemy>) {
    super(scene, texture, healthPoints)
    this.scene = scene;
    this.gridEngine = gridEngine;
    this.map = map;
    this.cursor = cursor;
    this.getEntitiesMap = getEntitiesMap;
    this.mainWeapon = new MeleeWeapon('fists', './assets/weapons/fist.png', 5, 0.8, 1)
    this.secondaryWeapon = new MeleeWeapon('pistol', './assets/weapons/pistol-03.png', 12, 0.6, 3)
    this.currentWeapon = this.mainWeapon;
    this.id = 'hero';
  }

  setPointerDownListener(map: Tilemaps.Tilemap) {
    // Moving on mouse click
    this.scene.input.on('pointerdown', () => {
      // Converting world coords into tile coords
      const gridMouseCoords = map.worldToTileXY(this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY);
      gridMouseCoords.x = Math.round(gridMouseCoords.x) - 1;
      gridMouseCoords.y = Math.round(gridMouseCoords.y);

      // Get 0-layer's tile by coords
      const clickedTile = map.getTileAt(gridMouseCoords.x, gridMouseCoords.y, false, 0);
      clickedTile.tint = 0xff7a4a;
      if (this.fightMode) {
        const entitiesMap = this.getEntitiesMap();
        entitiesMap.forEach((entityValue, entityKey) => {
          if (!entityKey.match(/^hero/i)) {
            const enemyPosition = this.gridEngine.getPosition(entityKey);
            if (enemyPosition.x === clickedTile.x && enemyPosition.y === clickedTile.y) {
              this.attackEnemy(entityValue as Enemy);
            }
          }
        })
      }
      // MoveTo provides "player" move to grid coords
      this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });
    }, this);
  }

  changeWeapon() {
    if (this.currentWeapon.name === this.mainWeapon.name) this.currentWeapon = this.secondaryWeapon;
    else this.currentWeapon = this.mainWeapon;
    this.behavior = this.currentWeapon.name === 'pistol' ? 'walkWithPistol' : 'walk';
    this.changeAnimationWithWeapon(this.behavior);
  }

  updateAP(distance: number) {
    this.actionPoints -= distance;
    while (this.actionPoints < 0) this.actionPoints += 10
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
    if(underScoreIndex > 1){
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
    if(!HeroAnimationDirection){
      return;
    } else {
      this.anims.play(`${this.currentWeapon.name}_${HeroAnimationDirection}`);
      enemy.play(`damage_${oppositeDirections.get(HeroAnimationDirection)}`);
    }
  }

  makeStep() {
    const lostPoints = lostActionPointsForHero.step;
    this.updateActionPoints(lostPoints);
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