import Phaser from "phaser";
import { scorpionAnims, deathClawAnims, ghoulAnims } from "./constants";
import { currentLevel } from "./levels";
import { Animations, StopAnimations } from "./types";
import Weapon from './weapon'

const defaultBehavior = 'walk';

class Entity extends Phaser.GameObjects.Sprite {
  key: string;
  healthPoints: number;
  _fightMode: boolean;
  currentActionPoints: number;
  totalActionPoints: number;
  mainWeapon: Weapon;
  behavior: string;
  currentAnims: Animations;
  constructor(scene: Phaser.Scene, texture: string, healthPoints: number, totalActionPoints: number) {
    super(scene, 0, 0, texture);
    this.scene = scene;
    this.key = '';
    this.healthPoints = healthPoints;
    this._fightMode = false;
    this.totalActionPoints = totalActionPoints;
    this.currentActionPoints = totalActionPoints;
    this.mainWeapon = new Weapon('nothing', '', 0, 0, 0, 0);
    this.behavior = defaultBehavior;
    this.currentAnims = currentLevel.heroAnims;
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
    this._fightMode = true;
  }

  updateAnims(newAnims: Animations) {
    this.currentAnims = newAnims;
  }

  getHeroAnims() {
    return this.currentAnims;
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

  setFramesForEntityAnimations(entityValue: Phaser.GameObjects.Sprite, entityKey: string, entityAnims: Animations, behavior: string) {
    this.createEntityAnimation.call(entityValue, "up-right", entityKey, entityAnims[behavior].upRight.startFrame, entityAnims[behavior].upRight.endFrame, -1);
    this.createEntityAnimation.call(entityValue, "down-right", entityKey, entityAnims[behavior].downRight.startFrame, entityAnims[behavior].downRight.endFrame, -1);
    this.createEntityAnimation.call(entityValue, "down-left", entityKey, entityAnims[behavior].downLeft.startFrame, entityAnims[behavior].downLeft.endFrame, -1);
    this.createEntityAnimation.call(entityValue, "up-left", entityKey, entityAnims[behavior].upLeft.startFrame, entityAnims[behavior].upLeft.endFrame, -1);
  }

  getStopFrame(direction: string, entityKey: string): number {
    let entityAnims: StopAnimations = {
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
    const ghoulRegex = /^ghoul/i;

    if (entityKey.match(heroRegex)) {
      entityAnims = (this.currentAnims as Animations);
    }
    if (entityKey.match(scorpionRegex)) {
      entityAnims = scorpionAnims;
    }
    if (entityKey.match(deathClawRegex)) {
      entityAnims = deathClawAnims;
    }
    if (entityKey.match(ghoulRegex)) {
      entityAnims = ghoulAnims;
    }

    switch (direction) {
      case "up-right":
        return entityAnims[this.behavior].upRight.stopFrame;
      case "down-right":
        return entityAnims[this.behavior].downRight.stopFrame;
      case "down-left":
        return entityAnims[this.behavior].downLeft.stopFrame;
      case "up-left":
        return entityAnims[this.behavior].upLeft.stopFrame;
      default:
        return -1;
    }
  }
}

export default Entity;