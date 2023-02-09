export const windowSize = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
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
};

export const scorpionAnims = {
    walk: {
        upRight: {
            startFrame: 0,
            endFrame: 7,
            stopFrame: 0,
        },
        downRight: {
            startFrame: 16,
            endFrame: 23,
            stopFrame: 16,
        },
        downLeft: {
            startFrame: 24,
            endFrame: 31,
            stopFrame: 24,
        },
        upLeft: {
            startFrame: 40,
            endFrame: 47,
            stopFrame: 40,
        },
    },
};

export const startPositionsForScorpions: { [key: string]: { x: number, y: number } } = {
    scorpion1: { x: 20, y: 34 },
    scorpion2: { x: 23, y: 36 }
};
