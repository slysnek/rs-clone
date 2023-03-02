import { windowSize } from './constants';
import { Dialogue } from './dialogue';

const dialogueConfig = {
  type: Phaser.WEBGL,
  width: windowSize.windowWidth,
  height: windowSize.windowHeight,
  dom: {
    createContainer: true,
  },
  backgroundColor: '#000000',
  parent: 'phaser-example',
  scene: [Dialogue],
};

export default dialogueConfig;