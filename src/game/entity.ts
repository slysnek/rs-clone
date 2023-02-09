import Phaser from "phaser";

class Entity extends Phaser.GameObjects.Sprite {
    key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture)
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.key = '';
    }

    setFramesForEntitiesAnimations(direction: string, entityName: string, startFrame: number, endFrame: number) {
        this.createEntityAnimation.call(this, direction, entityName, startFrame, endFrame);
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

    getStopFrame(direction: string): number {
        switch (direction) {
            case "up-right":
                return 0;
            case "down-right":
                return 16;
            case "down-left":
                return 24;
            case "up-left":
                return 40;
            default:
                return -1;
        }
    }

}

export default Entity;