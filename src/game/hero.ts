import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import Enemy from "./enemy";
import { lostActionPointsForHero, damageFromHero } from './battlePoints';
import { heroAnims } from "./constants";
import Weapon from './weapon'

class Hero extends Entity {
  gridEngine: GridEngine;
  map: Tilemaps.Tilemap;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  getEntitiesMap: () => Map<string, Hero | Enemy>;
  secondaryWeapon: Weapon;
  currentWeapon: Weapon;

  constructor(scene: Phaser.Scene,
    texture: string,
    gridEngine: GridEngine,
    map: Tilemaps.Tilemap,
    cursor: Phaser.Types.Input.Keyboard.CursorKeys,
    healthPoints: number,
    totalActionPoints: number,
    getEntitiesMap: () => Map<string, Hero | Enemy>) {
    super(scene, texture, healthPoints, totalActionPoints);
    this.scene = scene;
    this.gridEngine = gridEngine;
    this.map = map;
    this.cursor = cursor;
    this.getEntitiesMap = getEntitiesMap;

    this.mainWeapon = new Weapon('Fists', './assets/weapons/fist.png', 5, 0.8)
    this.secondaryWeapon = new Weapon('Pistol', './assets/weapons/blade.png', 12, 0.6)
    this.currentWeapon = this.mainWeapon;
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

      this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });
    }, this);
  }

  changeWeapon() {
    if (this.currentWeapon.name === this.mainWeapon.name) this.currentWeapon = this.secondaryWeapon;
    else this.currentWeapon = this.mainWeapon;
  }

  // ?
  updateAP(distance: number) {
    this.currentActionPoints -= distance;
    while (this.currentActionPoints < 0) this.currentActionPoints += 10;
  }

  setPunchAnimation() {
    this.createEntityAnimation('punch__up-right', 'hero', heroAnims.punch.upRight.startFrame, heroAnims.punch.upRight.endFrame, 0);
    this.createEntityAnimation('punch__down-right', 'hero', heroAnims.punch.downRight.startFrame, heroAnims.punch.downRight.endFrame, 0);
    this.createEntityAnimation('punch__down-left', 'hero', heroAnims.punch.downLeft.startFrame, heroAnims.punch.downLeft.endFrame, 0);
    this.createEntityAnimation('punch__up-left', 'hero', heroAnims.punch.upLeft.startFrame, heroAnims.punch.upLeft.endFrame, 0);
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

    this.anims.play(`punch__${currentHeroAnimation}`);
    enemy.play(`damage__${currentEnemyAnimation}`);

    const lostPoints = lostActionPointsForHero[this.currentWeapon.name];
    this.updateActionPoints(lostPoints);

    const damage = damageFromHero[this.currentWeapon.name];
    enemy.updateHealthPoints(damage);

    console.log("Hero Weapon:", this.currentWeapon.name);
    console.log("Hero AP:", this.currentActionPoints, ", Enemy HP:", enemy.healthPoints);
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