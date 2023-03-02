
import Hero from './hero';
import Enemy from './enemy';

export type gridEngineType = {
  characters: {
    id: string;
    sprite: Hero | Enemy | Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
    startPosition?: {
      x: number;
      y: number;
    };
    offsetX?: number;
    offsetY?: number;
    walkingAnimationEnabled?: boolean;
    speed?: number;
    charLayer?: string;
  }[];
  numberOfDirections: number;
}

export type Animations = {
  [behavior: string]: {
    upRight: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    },
    downRight: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    },
    downLeft: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    },
    upLeft: {
      startFrame: number;
      endFrame: number;
      stopFrame: number;
    }
  }
}

export type StopAnimations = {
  [behavior: string]: {
    upRight: {
      stopFrame: number;
    },
    downRight: {
      stopFrame: number;
    },
    downLeft: {
      stopFrame: number;
    },
    upLeft: {
      stopFrame: number;
    }
  }
}

export type thingsContainerItemsType = {
  [item: string]: {
    src: string;
    quantity: number,
    description: string
  }
}