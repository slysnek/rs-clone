import { scorpionAnims,
  deathClawAnims,
  ghoulAnims,
  startPositionsForScorpions,
  startPositionsForGhouls,
  startPositionsForDeathClaw,
  offsetCoordForDeathClaw,
  offsetCoordForGhouls,
  offsetCoordForScorpions } from "./constants"

export type level = {
  enemyAnims: typeof scorpionAnims | typeof deathClawAnims | typeof ghoulAnims,
  enemyQuantity: number,
  enemyName: string,
  infoForCreateEnemies: { [key: string]: {name: string, size: string, scale: number} },
  enemySpriteSheet: string,
  enemyStartPositions: { [key: string]: { x: number, y: number } },
  enemyOffsetCoords: { [key: string]: { x: number, y: number } },
  spriteSheetsSizes: { frameWidth: number, frameHeight: number },
  map: string,
  tiles: string,
  heroStartCoords: string
}

export const level1 = {
  enemyAnims: ghoulAnims,
  enemyName: 'ghoul',
  infoForCreateEnemies: {
    ghoul1: {name: 'ghoul1', size: 'big', scale: 1.5},
    ghoul2: {name: 'ghoul2', size: 'big', scale: 1.5},
    ghoul3: {name: 'ghoul3', size: 'big', scale: 1.5},
  },
  enemyQuantity: 3,
  enemySpriteSheet: 'ghoul_01',
  enemyStartPositions: startPositionsForGhouls,
  enemyOffsetCoords: offsetCoordForGhouls,
  spriteSheetsSizes: { frameWidth: 50, frameHeight: 100 },
  map: 'currentMap',
  tiles: 'tiles-02',
  heroStartCoords: ''
};

export const level2 = {
  enemyAnims: scorpionAnims,
  enemyName: 'scorpion',
  infoForCreateEnemies: {
    scorpion1: {name: 'scorpion1', size: 'big', scale: 1},
    scorpion2: {name: 'scorpion2', size: 'small', scale: 0.75},
    scorpion3: {name: 'scorpion3', size: 'small', scale: 0.75},
  },
  enemyQuantity: 3,
  enemySpriteSheet: 'scorpion-02',
  enemyStartPositions: startPositionsForScorpions,
  enemyOffsetCoords: offsetCoordForScorpions,
  spriteSheetsSizes: { frameWidth: 120, frameHeight: 118 },
  map: 'map1',
  tiles: 'maptiles2-01-01',
  heroStartCoords: ''
};

export const level3 = {
  enemyAnims: deathClawAnims,
  enemyName: 'deathClaw',
  infoForCreateEnemies: {
    deathClaw1: {name: 'deathClaw1', size: 'big', scale: 1},
    deathClaw2: {name: 'deathClaw2', size: 'small', scale: 0.75},
    deathClaw3: {name: 'deathClaw3', size: 'small', scale: 0.75},
  },
  enemyQuantity: 2,
  enemySpriteSheet: 'deathclaw-spritesheet',
  enemyStartPositions: startPositionsForDeathClaw,
  enemyOffsetCoords: offsetCoordForDeathClaw,
  spriteSheetsSizes: { frameWidth: 75, frameHeight: 133 },
  map: 'map3',
  tiles: 'tiles-03',
  heroStartCoords: ''  
}

export function setCurrentLevel(level: level){
  currentLevel = level;
}

export let currentLevel: level;
