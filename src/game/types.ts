
import Hero from './hero';
import Enemy from './enemy';

export type gridEngineType = {
    characters: {
        id: string;
        sprite: Hero | Enemy;
        startPosition: {
            x: number;
            y: number;
        };
        offsetX: number;
        offsetY: number;
        walkingAnimationEnabled: boolean;
        speed: number;
        charLayer?: string;
    }[];
    numberOfDirections: number;
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