export const windowSize = {
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight
}

export type Animations = {
  walk: {
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

export const heroAnims = {
  walk: {
    upRight: {
      startFrame: 0,
      endFrame: 7,
      stopFrame: 10,
    },
    downRight: {
      startFrame: 11,
      endFrame: 18,
      stopFrame: 21,
    },
    downLeft: {
      startFrame: 22,
      endFrame: 29,
      stopFrame: 32,
    },
    upLeft: {
      startFrame: 33,
      endFrame: 40,
      stopFrame: 43,
    },
  },
  punch: {
    upRight: {
        startFrame: 88,
        endFrame: 96,
        stopFrame: 10,
    },
    downRight: {
        startFrame: 99,
            endFrame: 107,
            stopFrame: 21,
        },
        downLeft: {
            startFrame: 110,
            endFrame: 118,
            stopFrame: 32,
        },
        upLeft: {
            startFrame: 121,
            endFrame: 129,
            stopFrame: 43,
        },
    }
};

export const scorpionAnims = {
    walk: {
        upRight: {
            startFrame: 0,
            endFrame: 7,
            stopFrame: 0,
        },
        downRight: {
            startFrame: 11,
            endFrame: 18,
            stopFrame: 11,
        },
        downLeft: {
            startFrame: 22,
            endFrame: 29,
            stopFrame: 22,
        },
        upLeft: {
            startFrame: 33,
            endFrame: 40,
            stopFrame: 33,
        },
    },
    hit: {
        upRight: {
            startFrame: 44,
            endFrame: 49,
            stopFrame: 44,
        },
        downRight: {
            startFrame: 55,
            endFrame: 60,
            stopFrame: 55,
        },
        downLeft: {
            startFrame: 66,
            endFrame: 71,
            stopFrame: 66,
        },
        upLeft: {
            startFrame: 77,
            endFrame: 82,
            stopFrame: 77,
        },
    },
    punch: {
        upRight: {
            startFrame: 83,
            endFrame: 93,
            stopFrame: 83,
        },
        downRight: {
            startFrame: 94,
            endFrame: 104,
            stopFrame: 94,
        },
        downLeft: {
            startFrame: 105,
            endFrame: 115,
            stopFrame: 105,
        },
        upLeft: {
            startFrame: 116,
            endFrame: 126,
            stopFrame: 116,
        },
    },
    death: {
        startFrame: 127,
        endFrame: 130,
        stopFrame: 120,
    },
    damage: {
        upRight: {
            startFrame: 138,
            endFrame: 139,
            stopFrame: 138,
        },
        downRight: {
            startFrame: 149,
            endFrame: 151,
            stopFrame: 149,
        },
        downLeft: {
            startFrame: 160,
            endFrame: 162,
            stopFrame: 160,
        },
        upLeft: {
            startFrame: 171,
            endFrame: 173,
            stopFrame: 171,
        },
    }
};

export const startPositionsForScorpionsMap1: { [key: string]: { x: number, y: number } } = {
  scorpion1: { x: 70, y: 70 },
  scorpion2: { x: 73, y: 74 },
  scorpion3: { x: 60, y: 60 },
  };
