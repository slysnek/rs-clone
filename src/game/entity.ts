import Phaser from "phaser";
import { heroAnims, scorpionAnims, Animations } from "./constants";

class Entity extends Phaser.GameObjects.Sprite {
    key: string;
    healthPoints: number;
    attack: number;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture)
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.key = '';
        this.healthPoints = 1;
        this.attack = 0;
    }

    createEntityAnimation(direction: string, entityName: string, startFrame: number, endFrame: number) {
        this.anims.create({
            key: direction,
            frames: this.anims.generateFrameNumbers(`${entityName}`, {
                start: startFrame,
                end: endFrame,
            }),
            frameRate: 9,
            repeat: -1,
            yoyo: false,
        });
    }

    setFramesForEntityAnimations(entityValue: Phaser.GameObjects.Sprite, entityKey: string, entityAnims: Animations) {
        this.createEntityAnimation.call(entityValue, "up-right", entityKey, entityAnims.walk.upRight.startFrame, entityAnims.walk.upRight.endFrame);
        this.createEntityAnimation.call(entityValue, "down-right", entityKey, entityAnims.walk.downRight.startFrame, entityAnims.walk.downRight.endFrame);
        this.createEntityAnimation.call(entityValue, "down-left", entityKey, entityAnims.walk.downLeft.startFrame, entityAnims.walk.downLeft.endFrame);
        this.createEntityAnimation.call(entityValue, "up-left", entityKey, entityAnims.walk.upLeft.startFrame, entityAnims.walk.upLeft.endFrame);
    }

    getStopFrame(direction: string, entityKey: string): number {
        const heroRegex = /^player/i;
        const scorpionRegex = /^scorpion/i;

        let entityAnims = {
            walk: {
                upRight: {
                    stopFrame: -1,
                },
                downRight: {
                    stopFrame: -1,
                },
                downLeft: {
                    stopFrame: -1,
                },
                upLeft: {
                    stopFrame: -1,
                },
            },
        };
        if (entityKey.match(heroRegex)) {
            entityAnims = heroAnims;
        }
        if (entityKey.match(scorpionRegex)) {
            entityAnims = scorpionAnims;
        }

        switch (direction) {
            case "up-right":
                return entityAnims.walk.upRight.stopFrame;
            case "down-right":
                return entityAnims.walk.downRight.stopFrame;
            case "down-left":
                return entityAnims.walk.downLeft.stopFrame;
            case "up-left":
                return entityAnims.walk.upLeft.stopFrame;
            default:
                return -1;
        }
    }
}

export default Entity;