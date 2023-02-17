import { windowSize } from './constants';
import GridEngine from 'grid-engine';
import Game from './game';
import Dialogue from './dialogue';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const dialogueConfig = {
    type: Phaser.WEBGL,
    width: windowSize.windowWidth,
    height: windowSize.windowHeight,
    dom: {
      createContainer: true,
    },
    backgroundColor: '#ababab',
    parent: 'phaser-example',
    scene: [Dialogue],
    physics: {
      default: 'arcade'
    },
    arcade: {
      debug: true
    },
    plugins: {
      scene: [{
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI'
    },
    ]
    },
};

export default dialogueConfig;