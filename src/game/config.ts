import windowSize from './constants';
import GridEngine from 'grid-engine';
import Game from './game';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

const config = {
    type: Phaser.WEBGL,
    dom: {
      createContainer: true,
    },
    width: 1280,
    height: 720,
    backgroundColor: '#ababab',
    parent: 'phaser-example',
    scene: [Game],
    physics: {
      default: 'arcade'
    },
    arcade: {
      debug: true
    },
    plugins: {
      scene: [
        {
          key: "gridEngine",
          plugin: GridEngine,
          mapping: "gridEngine",
        },
        {
          key: 'rexUI',
          plugin: RexUIPlugin,
          mapping: 'rexUI'
      },
      ],
    },
};

export default config;