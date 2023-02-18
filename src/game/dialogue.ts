import Phaser, { Tilemaps } from 'phaser';
import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { windowSize } from './constants'
import config from './config'
import Button from 'phaser3-rex-plugins/plugins/button';
import Buttons from 'phaser3-rex-plugins/templates/ui/buttons/Buttons';
import { GameObject } from 'grid-engine/dist/GridCharacter/GridCharacter';

class Dialogue extends Phaser.Scene {
  rexUI: RexUIPlugin;

  constructor(rexUI: RexUIPlugin) {
    super('dialogue')
    this.rexUI = rexUI;
  }

  preload() {
    this.load.image('background', '../assets/dialogue_assets/dialogue-background.png')
    this.load.html('dialogue', '/assets/html/dialogue.html');
  }

  create(){
    this.createDialogue(this)
  }

  createDialogue(scene: Dialogue) {
    const testUI = scene.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight / 2).createFromCache('dialogue')
    testUI.scrollFactorX = 0;
    testUI.scrollFactorY = 0;
  }


}

export default Dialogue;
