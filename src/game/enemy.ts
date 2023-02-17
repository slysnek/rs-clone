import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { startPositionsForScorpions } from './constants';
import { scorpionAnims, oppositeDirections } from "./constants";
import Hero from "./hero";
import attack from "./utilsForAttackAnimations";
import { currentLevel } from "./levels";
function getRandomXYDelta() {
  const deltaValue = () => Math.ceil(Math.random() * 10 / 3);
  return { xDelta: deltaValue(), yDelta: deltaValue() };
}

const timeModifier = 5;

function getRandomTimeInterval() {
  return (Math.ceil(Math.random() * timeModifier) * 1000);
}

class Enemy extends Entity {
  gridEngine: GridEngine;
  map: Tilemaps.Tilemap
  movesTimerId: NodeJS.Timer | null;
  id: string;
  battleRadius: number;
  size: string;
  attackBehavior: string;
  maxRange: number;
  deleteEntityFromEntitiesMap: (entityKey: string) => void;
  sounds: {[soundName: string]: Phaser.Sound.BaseSound};

  constructor(scene: Phaser.Scene,
    texture: string,
    gridEngine: GridEngine,
    map: Tilemaps.Tilemap,
    id: string,
    healthPoints: number,
    battleRadius: number,
    size: string,
    totalActionPoints: number,
    deleteEntityFromEntitiesMap: (entityKey: string) => void,
    sounds: {[soundName: string]: Phaser.Sound.BaseSound}) {
    super(scene, texture, healthPoints, totalActionPoints);
    this.gridEngine = gridEngine;
    this.movesTimerId = null;
    this.map = map;
    this.id = id;
    this.battleRadius = battleRadius;
    this.size = size;
    this.attackBehavior = 'punch';
    this.maxRange = 1;
    this.deleteEntityFromEntitiesMap = deleteEntityFromEntitiesMap;
    this.sounds = sounds;
  }

  clearTimer() {
    clearInterval(this.movesTimerId as NodeJS.Timer);
    this.movesTimerId = null;
  }
  
  makeStep() {
    if (this.fightMode) {
      this.currentActionPoints -= 1;
    }
  }

  // ? заглушка
  attackHero(hero: Hero) {
    console.log(`${this} Attacking hero ${hero}!`);
    this.currentActionPoints = 0;
  }

  // позже надо удалить из аргументов карту и функцию покраски тайлов
  setEnemyWalkBehavior(charId: string, map: Tilemaps.Tilemap) {
    this.movesTimerId = setInterval(() => {
      const deltaXY = getRandomXYDelta();
      this.gridEngine.moveTo(`${charId}`, { x: currentLevel.enemyStartPositions[charId].x + deltaXY.xDelta, y: currentLevel.enemyStartPositions[charId].y + deltaXY.yDelta });
      this.tintTile(map, currentLevel.enemyStartPositions[charId].x + deltaXY.xDelta, currentLevel.enemyStartPositions[charId].y + deltaXY.yDelta, 0xff7a4a);
    }, getRandomTimeInterval())
  }

  setAttackAnimation() {
    this.createEntityAnimation('punch_up-right', this.id, currentLevel.enemyAnims.punch.upRight.startFrame, currentLevel.enemyAnims.punch.upRight.endFrame, 0);
    this.createEntityAnimation('punch_down-right', this.id, currentLevel.enemyAnims.punch.downRight.startFrame, currentLevel.enemyAnims.punch.downRight.endFrame, 0);
    this.createEntityAnimation('punch_down-left', this.id, currentLevel.enemyAnims.punch.downLeft.startFrame, currentLevel.enemyAnims.punch.downLeft.endFrame, 0);
    this.createEntityAnimation('punch_up-left', this.id, currentLevel.enemyAnims.punch.upLeft.startFrame, currentLevel.enemyAnims.punch.upLeft.endFrame, 0);
  }

  setDamageAnimation() {
    this.createEntityAnimation('damage_up-right', this.id, currentLevel.enemyAnims.damage.upRight.startFrame, currentLevel.enemyAnims.damage.upRight.endFrame, 0);
    this.createEntityAnimation('damage_down-right', this.id, currentLevel.enemyAnims.damage.downRight.startFrame, currentLevel.enemyAnims.damage.downRight.endFrame, 0);
    this.createEntityAnimation('damage_down-left', this.id, currentLevel.enemyAnims.damage.downLeft.startFrame, currentLevel.enemyAnims.damage.downLeft.endFrame, 0);
    this.createEntityAnimation('damage_up-left', this.id, currentLevel.enemyAnims.damage.upLeft.startFrame, currentLevel.enemyAnims.damage.upLeft.endFrame, 0);
    this.createEntityAnimation('death', this.id, currentLevel.enemyAnims.death.upRight.startFrame, currentLevel.enemyAnims.death.upRight.endFrame, 0);
  }

  playAttackHeroAnimation(hero: Hero) {
    const heroCoords = this.gridEngine.getPosition(hero.id);
    const enemyCoords = this.gridEngine.getPosition(this.id);
    const enemyAnimationDirection = attack(enemyCoords, heroCoords, this.maxRange);
    if(!enemyAnimationDirection){
      return;
    } else {
      this.anims.play(`${this.attackBehavior}_${enemyAnimationDirection}`);
      hero.play(`damage-${hero.currentWeapon.name}_${oppositeDirections.get(enemyAnimationDirection)}`);
    }
  }

  playDeathAnimation(){
    this.anims.play('death');
    this.deleteEntityFromEntitiesMap(this.id)
  }

  //повтор функции, удалить
  tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
    }
  }
}

export default Enemy;