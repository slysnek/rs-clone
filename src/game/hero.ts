import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import Enemy from "./enemy";

class Hero extends Entity {

    gridEngine: GridEngine;
    map: Tilemaps.Tilemap;
    cursor: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, gridEngine: GridEngine, map: Tilemaps.Tilemap, cursor: Phaser.Types.Input.Keyboard.CursorKeys) {
        super(scene, x, y, texture)
        this.scene = scene;
        this.gridEngine = gridEngine;
        this.map = map;
        this.cursor = cursor;
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

            // MoveTo provides "player" move to grid coords
            this.gridEngine.moveTo("hero", { x: gridMouseCoords.x, y: gridMouseCoords.y });
        }, this);
    }

    setPointerOnEnemyListener(gameObject: Enemy){
        gameObject.setInteractive().on('pointerdown', () => {
           console.log(gameObject.id)
        }, this);
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