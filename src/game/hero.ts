import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import Enemy from "./enemy";
import { lostActionPointsForHero, damageFromHero } from './battlePoints';
import { heroAnims } from "./constants";
import MeleeWeapon from './meleeweapon'

class Hero extends Entity {
  gridEngine: GridEngine;
  map: Tilemaps.Tilemap;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  weapon: string;
  getEntitiesMap: () => Map<string, Hero | Enemy>;
  secondaryWeapon: MeleeWeapon;
  currentWeapon: MeleeWeapon;

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
    this.weapon = 'fistPunch';
    this.getEntitiesMap = getEntitiesMap;
    this.mainWeapon = new MeleeWeapon('Fists', './assets/weapons/fist.png', 5, 0.8)
    this.secondaryWeapon = new MeleeWeapon('Pistol', './assets/weapons/pistol-03.png', 12, 0.6)
    this.currentWeapon = this.mainWeapon;
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
              this.attackEnemy(entityValue as Enemy)
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
    this.behavior = this.currentWeapon.name === 'Pistol' ? 'walkWithPistol' : 'walk';
    this.changeAnimationWithWeapon(this.behavior);
  }

  updateAP(distance: number) {
    this.actionPoints -= distance;
    while (this.actionPoints < 0) this.actionPoints += 10
  }

  setPunchAnimation() {
    this.createEntityAnimation('punch_up-right', 'hero', heroAnims.punch.upRight.startFrame, heroAnims.punch.upRight.endFrame, 0);
    this.createEntityAnimation('punch_down-right', 'hero', heroAnims.punch.downRight.startFrame, heroAnims.punch.downRight.endFrame, 0);
    this.createEntityAnimation('punch_down-left', 'hero', heroAnims.punch.downLeft.startFrame, heroAnims.punch.downLeft.endFrame, 0);
    this.createEntityAnimation('punch_up-left', 'hero', heroAnims.punch.upLeft.startFrame, heroAnims.punch.upLeft.endFrame, 0);
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

  setWalkWithGunBehavior() {
    this.anims.remove('up-right');
    this.anims.remove('down-right');
    this.anims.remove('down-left');
    this.anims.remove('up-left');
  }

  attackEnemy(enemy: Enemy) {
    const heroPosition = this.gridEngine.getPosition('hero');
    const enemyPosition = this.gridEngine.getPosition(enemy.id);
    let currentHeroAnimation = '';
    let currentEnemyAnimation = '';
    if (heroPosition.x === enemyPosition.x) {
      if (heroPosition.y > enemyPosition.y) {
        currentHeroAnimation = 'up-right';
        currentEnemyAnimation = 'down-left';
      } else {
        currentHeroAnimation = 'down-left';
        currentEnemyAnimation = 'up-right';
      }
    } else if (heroPosition.y === enemyPosition.y) {
      if (heroPosition.x > enemyPosition.x) {
        currentHeroAnimation = 'up-left';
        currentEnemyAnimation = 'down-right';
      } else {
        currentHeroAnimation = 'down-right';
        currentEnemyAnimation = 'up-left';
      }
    }
    if (currentHeroAnimation === '') {
      return;
    }
    this.anims.play(`punch_${currentHeroAnimation}`);
    enemy.play(`damage_${currentEnemyAnimation}`);
    const lostPoints = lostActionPointsForHero[this.weapon];
    const damage = damageFromHero[this.weapon];
    this.updateActionPoints(lostPoints);
    enemy.updateHealthPoints(damage);
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