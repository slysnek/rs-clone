import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { startPositionsForScorpionsMap1 } from './constants';
import { scorpionAnims, oppositeDirections } from "./constants";
import Hero from "./hero";
import attack from "./utilsForAttackAnimations";

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
  deleteEnemyFromEntitiesMap: (entityKey: string) => void;
  constructor(scene: Phaser.Scene,
    texture: string,
    gridEngine: GridEngine,
    map: Tilemaps.Tilemap,
    id: string,
    healthPoints: number,
    battleRadius: number,
    size: string,
    totalActionPoints: number,
    deleteEnemyFromEntitiesMap: (entityKey: string) => void) {
    super(scene, texture, healthPoints, totalActionPoints);
    this.gridEngine = gridEngine;
    this.movesTimerId = null;
    this.map = map;
    this.id = id;
    this.battleRadius = battleRadius;
    this.size = size;
    this.attackBehavior = 'punch';
    this.maxRange = 1;
    this.deleteEnemyFromEntitiesMap = deleteEnemyFromEntitiesMap;
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
      this.gridEngine.moveTo(`${charId}`, { x: startPositionsForScorpionsMap1[charId].x + deltaXY.xDelta, y: startPositionsForScorpionsMap1[charId].y + deltaXY.yDelta });
      this.tintTile(map, startPositionsForScorpionsMap1[charId].x + deltaXY.xDelta, startPositionsForScorpionsMap1[charId].y + deltaXY.yDelta, 0xff7a4a);
    }, getRandomTimeInterval())
  }

  setAttackAnimation() {
    this.createEntityAnimation('punch_up-right', this.id, scorpionAnims.punch.upRight.startFrame, scorpionAnims.punch.upRight.endFrame, 0);
    this.createEntityAnimation('punch_down-right', this.id, scorpionAnims.punch.downRight.startFrame, scorpionAnims.punch.downRight.endFrame, 0);
    this.createEntityAnimation('punch_down-left', this.id, scorpionAnims.punch.downLeft.startFrame, scorpionAnims.punch.downLeft.endFrame, 0);
    this.createEntityAnimation('punch_up-left', this.id, scorpionAnims.punch.upLeft.startFrame, scorpionAnims.punch.upLeft.endFrame, 0);
  }

  setDamageAnimation() {
    this.createEntityAnimation('damage_up-right', this.id, scorpionAnims.damage.upRight.startFrame, scorpionAnims.damage.upRight.endFrame, 0);
    this.createEntityAnimation('damage_down-right', this.id, scorpionAnims.damage.downRight.startFrame, scorpionAnims.damage.downRight.endFrame, 0);
    this.createEntityAnimation('damage_down-left', this.id, scorpionAnims.damage.downLeft.startFrame, scorpionAnims.damage.downLeft.endFrame, 0);
    this.createEntityAnimation('damage_up-left', this.id, scorpionAnims.damage.upLeft.startFrame, scorpionAnims.damage.upLeft.endFrame, 0);
    this.createEntityAnimation('death', this.id, scorpionAnims.death.upRight.startFrame, scorpionAnims.death.upRight.endFrame, 0);
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
  }

  //повтор функции, удалить
  tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
    }
  }
}

export default Enemy;