import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { startPositionsForScorpionsMap1 } from './constants';

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

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, gridEngine: GridEngine, map: Tilemaps.Tilemap, id: string) {
        super(scene, x, y, texture)
        this.gridEngine = gridEngine;
        this.movesTimerId = null;
        this.map = map;
        this.id = id;
    }

    clearTimer(){
        clearInterval(this.movesTimerId as NodeJS.Timer);
        this.movesTimerId = null;
    }

    // позже надо удалить из аргументов карту и функцию покраски тайлов

    setEnemyWalkBehavior(charId: string, map: Tilemaps.Tilemap) {
        this.movesTimerId = setInterval(() => {
            const deltaXY = getRandomXYDelta();
            this.gridEngine.moveTo(`${charId}`, { x: startPositionsForScorpionsMap1[charId].x + deltaXY.xDelta, y: startPositionsForScorpionsMap1[charId].y + deltaXY.yDelta });
            this.tintTile(map, startPositionsForScorpionsMap1[charId].x + deltaXY.xDelta, startPositionsForScorpionsMap1[charId].y + deltaXY.yDelta, 0xff7a4a);
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