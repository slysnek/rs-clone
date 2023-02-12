import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { Direction, GridEngine } from 'grid-engine';
import MeleeWeapon from './meleeweapon'

class Hero extends Entity {

    gridEngine: GridEngine;
    map: Tilemaps.Tilemap;
    cursor: Phaser.Types.Input.Keyboard.CursorKeys;
    secondaryWeapon: MeleeWeapon;
    currentWeapon: MeleeWeapon;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, gridEngine: GridEngine, map: Tilemaps.Tilemap, cursor: Phaser.Types.Input.Keyboard.CursorKeys) {
        super(scene, x, y, texture)
        this.scene = scene;
        this.gridEngine = gridEngine;
        this.map = map;
        this.cursor = cursor;
        this.mainWeapon = new MeleeWeapon('Fists', './assets/weapons/fist.png', 5, 0.8)
        this.secondaryWeapon = new MeleeWeapon('Blade', './assets/weapons/blade.png', 12, 0.6)
        this.currentWeapon = this.mainWeapon;
    }

    changeWeapon() {
        if (this.currentWeapon.name === this.mainWeapon.name) this.currentWeapon = this.secondaryWeapon
        else this.currentWeapon = this.mainWeapon
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