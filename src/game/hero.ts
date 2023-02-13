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
        this.actionPoints = 10;
    }

    changeWeapon() {
        if (this.currentWeapon.name === this.mainWeapon.name) this.currentWeapon = this.secondaryWeapon
        else this.currentWeapon = this.mainWeapon
    }

    updateAP(distance: number) {
        this.actionPoints -= distance;
        while (this.actionPoints < 0) this.actionPoints += 10
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