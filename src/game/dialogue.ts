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
    this.load.image('background', '../assets/dialogue_assets/1.png')
  }

  create() {
    this.add.image(400,300, 'background')
    const dialog = this.rexUI.add.dialog({
      x: 0,
      y: 0,
      width: windowSize.windowWidth,
      height: windowSize.windowHeight,

      background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 0, 0x282828),
      title: this.createLabel(this, 'Dialogue')/* setDraggable() */,
      content: this.createLabel(this, 'This is some question to our main character'),
      choices: [
        this.createLabel(this, 'Hello'),
        this.createLabel(this, 'Bye'),
        this.createLabel(this, 'Start Game')
      ],

      space: {
        left: 20,
        right: 20,
        top: -20,
        bottom: -20,

        title: 25,
        titleLeft: 30,
        description: 25,
        descriptionLeft: 20,
        descriptionRight: 20,
        choices: 125,

        choice: 15,
        action: 15,
      },

      expand: {
        title: false,
        // content: false,
        // description: false,
        // choices: false,
        // actions: true,
      },

      align: {
        title: 'center',
        // content: 'left',
        // description: 'left',
        choices: 'center',
        actions: 'right', // 'center'|'left'|'right'
      },

      click: {
        mode: 'release'
      }
    })
      .setDraggable('background')   // Draggable-background
      .layout()
      .popUp(1000);

    const textLabel = this.add.text(0, 0, '');
    dialog
      .on('button.click', (button: { text: string; }, groupName: string, index: string) => {
        textLabel.text += groupName + '-' + index + ': ' + button.text + '\n';
        console.log(button.text);
        if (button.text === 'Start Game') {
          this.sys.game.destroy(true)
          new Phaser.Game(config)
        }
      }, this)
      .on('button.over', function (button) {
        button.getElement('background').setStrokeStyle(1, 0xffffff);
      })
      .on('button.out', function (button) {
        button.getElement('background').setStrokeStyle();
      });
  }

  /* update() { } */

  createLabel = function (dialogueScene: Dialogue, text: string) {
    return dialogueScene.rexUI.add.label({
      width: 40,
      height: 40,

      background: dialogueScene.rexUI.add.roundRectangle(0, 0, 100, 40, 0, 0x383838),

      text: dialogueScene.add.text(0, 0, text, {
        fontSize: '24px',
        color: '#3cf800'
      }),

      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    });
  }

}

export default Dialogue;
