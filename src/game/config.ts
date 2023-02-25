import { windowSize } from './constants';
import GridEngine from 'grid-engine';
import Game from './game';

const config = {
    type: Phaser.WEBGL,
    width: windowSize.windowWidth,
    height: windowSize.windowHeight,
    dom: {
      createContainer: true,
    },
    backgroundColor: '#000000',
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
      ],
    },
};

export default config;