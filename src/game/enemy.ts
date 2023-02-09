import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { startPositionsForScorpions, scorpionAnims } from './constants';

function getRandomXYDelta(){
    const deltaValue = () => Math.ceil(Math.random() * 10 / 3);
    return {xDelta: deltaValue(), yDelta: deltaValue()};
}
  
const timeModifier = 5;
  
function getRandomTimeInterval(){
    return (Math.ceil(Math.random() * timeModifier) * 1000);
}

class Enemy extends Entity {

    gridEngine: GridEngine;
    map: Tilemaps.Tilemap
    movesTimerId: NodeJS.Timer | null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, gridEngine: GridEngine, map: Tilemaps.Tilemap){
        super(scene, x, y, texture)
        this.gridEngine = gridEngine;
        this.movesTimerId = null;
        this.map = map;
    }

    setAnimsFrames(enemyKey: string){
        this.setFramesForEntitiesAnimations('up-right', enemyKey, scorpionAnims.walk.upRight.startFrame, scorpionAnims.walk.upRight.endFrame);
        this.setFramesForEntitiesAnimations('down-right', enemyKey, scorpionAnims.walk.downRight.startFrame, scorpionAnims.walk.downRight.endFrame);
        this.setFramesForEntitiesAnimations('down-left', enemyKey, scorpionAnims.walk.downLeft.startFrame, scorpionAnims.walk.downRight.endFrame);
        this.setFramesForEntitiesAnimations('up-left', enemyKey, scorpionAnims.walk.upLeft.startFrame, scorpionAnims.walk.downRight.endFrame);
    }

      // позже надо удалить из аргументов карту и функцию покраски тайлов

    setEnemyWalkBehavior(charId: string, map: Tilemaps.Tilemap){
        this.movesTimerId = setInterval(() => {
        const deltaXY = getRandomXYDelta();
        this.gridEngine.moveTo(`${charId}`, { x: startPositionsForScorpions[charId].x + deltaXY.xDelta, y: startPositionsForScorpions[charId].y + deltaXY.yDelta } );
        this.tintTile(map, startPositionsForScorpions[charId].x + deltaXY.xDelta, startPositionsForScorpions[charId].y + deltaXY.yDelta, 0xff7a4a);
        }, getRandomTimeInterval())
     }

    //повтор функции, удалить
    tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
        for (const element of tilemap.layers) {
        element.tilemapLayer.layer.data[row][col].tint = color;
        }
    }

}

export default Enemy;