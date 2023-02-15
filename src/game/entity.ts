import Phaser from "phaser";
import { heroAnims, scorpionAnims } from "./constants";
import { Animations } from "./types";
import Weapon from './weapon'

class Entity extends Phaser.GameObjects.Sprite {
  key: string;
  healthPoints: number;
  fightMode: boolean;
  currentActionPoints: number;
  totalActionPoints: number;
  mainWeapon: Weapon;
  constructor(scene: Phaser.Scene, texture: string, healthPoints: number, totalActionPoints: number) {
    super(scene, 0, 0, texture);
    this.scene = scene;
    this.key = '';
    this.healthPoints = healthPoints;
    // fight mode
    this.fightMode = true;
    this.totalActionPoints = totalActionPoints;
    this.currentActionPoints = totalActionPoints;
    this.mainWeapon = new Weapon('nothing', '', 0, 0);
  }

  updateHealthPoints(damage: number) {
    this.healthPoints -= damage;
  }

  updateActionPoints(lostPoints: number) {
    this.currentActionPoints -= lostPoints;
  }

  refreshActionPoints() {
    this.currentActionPoints = this.totalActionPoints;
  }

  turnOnFightMode() {
    this.fightMode = true;
  }

  createEntityAnimation(direction: string, entityName: string, startFrame: number, endFrame: number, repeat: number) {
    this.anims.create({
      key: direction,
      frames: this.anims.generateFrameNumbers(`${entityName}`, {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 9,
      repeat: repeat,
      yoyo: false,
    });
  }

  setFramesForEntityAnimations(entityValue: Phaser.GameObjects.Sprite, entityKey: string, entityAnims: Animations) {
    this.createEntityAnimation.call(entityValue, "up-right", entityKey, entityAnims.walk.upRight.startFrame, entityAnims.walk.upRight.endFrame, -1);
    this.createEntityAnimation.call(entityValue, "down-right", entityKey, entityAnims.walk.downRight.startFrame, entityAnims.walk.downRight.endFrame, -1);
    this.createEntityAnimation.call(entityValue, "down-left", entityKey, entityAnims.walk.downLeft.startFrame, entityAnims.walk.downLeft.endFrame, -1);
    this.createEntityAnimation.call(entityValue, "up-left", entityKey, entityAnims.walk.upLeft.startFrame, entityAnims.walk.upLeft.endFrame, -1);
  }

  getStopFrame(direction: string, entityKey: string): number {
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

    const heroRegex = /^hero/i;
    const scorpionRegex = /^scorpion/i;
    const deathClawRegex = /^deathClaw/i;

    if (entityKey.match(heroRegex)) {
      entityAnims = heroAnims;
    }
    if (entityKey.match(scorpionRegex)) {
      entityAnims = scorpionAnims;
    }
    if (entityKey.match(deathClawRegex)) {
      // deathclaw anims
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