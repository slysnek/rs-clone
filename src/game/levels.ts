import {
  heroAnimsWithoutArmor,
  scorpionAnims,
  deathClawAnims,
  ghoulAnims,
  startPositionsForScorpions,
  startPositionsForGhouls,
  startPositionsForDeathClaw,
  offsetCoordForDeathClaw,
  offsetCoordForGhouls,
  offsetCoordForScorpions,
  startPositionsForHeroMap1,
  startPositionsForHeroMap2,
  startPositionsForHeroMap3
} from "./constants";
import { DialogueKey } from './dialogue';
import { inventoryInfo, thingsForRandom } from "./inventory";
import { Animations, thingsContainerItemsType } from './types';
import { damageFromGhoul, damageFromScorpion, damageFromDeathClaw, ghoulHealthPoints, scorpionHealthPoints, deathClawHealthPoints } from './battlePoints';

const defaultInventory = {
  pistol: {
    src: inventoryInfo.pistol.src,
    quantity: 1,
    description: 'Ordinary pistol.',
  },
  bullets: {
    src: inventoryInfo.bullets.src,
    quantity: 3,
    description: 'Bullets for your pistol. If you haven`t enough bullets you cannot shoot.',
  },
}

const defaultHeroAnims = heroAnimsWithoutArmor;

const defaultHeroHealthPoints = 25;

const defaultIsHeroInArmor = false;

export type level = {
  enemyAnims: typeof scorpionAnims | typeof deathClawAnims | typeof ghoulAnims,
  enemyQuantity: number,
  enemyName: string,
  infoForCreateEnemies: { [key: string]: { name: string, size: string, scale: number } },
  enemySpriteSheet: string,
  enemyStartPositions: { [key: string]: { x: number, y: number } },
  enemyOffsetCoords: { [key: string]: { x: number, y: number } },
  spriteSheetsSizes: { frameWidth: number, frameHeight: number },
  damageFromEnemy: { [attackType: string]: number },
  enemyHealthPoints: number,
  map: string,
  tiles: string,
  heroStartCoords: { x: number, y: number },
  enemySounds: {
    heroDamageFromEnemy: {
      volume: number;
      src: string;
    };
    enemyPunch: {
      volume: number;
      src: string;
    },
    enemyDamage: {
      volume: number;
      src: string;
    },
    enemyDeath: {
      volume: number;
      src: string;
    },
  },
  thingsInStorage: { [key: string]: { src: string, quantity: number, description: string } },
  storage: { key: string, src: string, position: { x: number, y: number } },
  heroInventory: { [key: string]: { src: string, quantity: number, description: string } },
  heroAnims: Animations,
  heroHealthPoints: number,
  isHeroInArmor: boolean
}

export const level1 = {
  enemyAnims: ghoulAnims,
  enemyName: 'ghoul',
  infoForCreateEnemies: {
    ghoul1: { name: 'ghoul1', size: 'big', scale: 1.5 },
    ghoul2: { name: 'ghoul2', size: 'big', scale: 1.5 },
    ghoul3: { name: 'ghoul3', size: 'big', scale: 1.5 },
  },
  enemyQuantity: 3,
  enemySpriteSheet: 'ghoul_01',
  enemyStartPositions: startPositionsForGhouls,
  enemyOffsetCoords: offsetCoordForGhouls,
  spriteSheetsSizes: { frameWidth: 50, frameHeight: 100 },
  damageFromEnemy: damageFromGhoul,
  enemyHealthPoints: ghoulHealthPoints,
  map: 'currentMap',
  tiles: 'tiles-02',
  heroStartCoords: startPositionsForHeroMap1,
  enemySounds: {
    heroDamageFromEnemy: {
      src: 'assets/sounds/heroSounds/heroDamageFromGhoul.wav',
      volume: 1,
    },
    enemyPunch: {
      src: 'assets/sounds/ghoulSounds/ghoulPunch.wav',
      volume: 1,
    },
    enemyDamage: {
      src: 'assets/sounds/ghoulSounds/ghoulDamage.wav',
      volume: 1,
    },
    enemyDeath: {
      src: 'assets/sounds/ghoulSounds/ghoulDeath.wav',
      volume: 1,
    }
  },
  thingsInStorage: {},
  storage: {
    key: 'barrel',
    src: 'assets/maps/barrel.png',
    position: { x: 72, y: 48 }
  },
  heroInventory: defaultInventory,
  heroAnims: defaultHeroAnims,
  heroHealthPoints: defaultHeroHealthPoints,
  isHeroInArmor: defaultIsHeroInArmor
};

export const level2 = {
  enemyAnims: scorpionAnims,
  enemyName: 'scorpion',
  infoForCreateEnemies: {
    scorpion1: { name: 'scorpion1', size: 'big', scale: 1 },
    scorpion2: { name: 'scorpion2', size: 'small', scale: 0.75 },
    scorpion3: { name: 'scorpion3', size: 'small', scale: 0.75 },
  },
  enemyQuantity: 3,
  enemySpriteSheet: 'scorpion-02',
  enemyStartPositions: startPositionsForScorpions,
  enemyOffsetCoords: offsetCoordForScorpions,
  spriteSheetsSizes: { frameWidth: 106, frameHeight: 135 },
  damageFromEnemy: damageFromScorpion,
  enemyHealthPoints: scorpionHealthPoints,
  map: 'map1',
  tiles: 'maptiles2-01-01',
  heroStartCoords: startPositionsForHeroMap2,
  enemySounds: {
    heroDamageFromEnemy: {
      src: 'assets/sounds/heroSounds/heroDamageFromRadScorpion.wav',
      volume: 1,
    },
    enemyPunch: {
      src: 'assets/sounds/radScorpionSounds/radScorpionPunch.wav',
      volume: 1,
    },
    enemyDamage: {
      src: 'assets/sounds/radScorpionSounds/radScorpionDamage.wav',
      volume: 1,
    },
    enemyDeath: {
      src: 'assets/sounds/radScorpionSounds/radScorpionDeath.wav',
      volume: 1,
    }
  },
  thingsInStorage: {},
  storage: {
    key: 'fridge',
    src: 'assets/maps/fridge.png',
    position: { x: 58, y: 90 }
  },
  heroInventory: defaultInventory,
  heroAnims: defaultHeroAnims,
  heroHealthPoints: defaultHeroHealthPoints,
  isHeroInArmor: defaultIsHeroInArmor
};

export const level3 = {
  enemyAnims: deathClawAnims,
  enemyName: 'deathClaw',
  infoForCreateEnemies: {
    deathClaw1: { name: 'deathClaw1', size: 'big', scale: 1 },
    deathClaw2: { name: 'deathClaw2', size: 'small', scale: 0.75 },
    deathClaw3: { name: 'deathClaw3', size: 'small', scale: 0.75 },
  },
  enemyQuantity: 2,
  enemySpriteSheet: 'deathclaw-spritesheet',
  enemyStartPositions: startPositionsForDeathClaw,
  enemyOffsetCoords: offsetCoordForDeathClaw,
  spriteSheetsSizes: { frameWidth: 120, frameHeight: 118 },
  damageFromEnemy: damageFromDeathClaw,
  enemyHealthPoints: deathClawHealthPoints,
  map: 'map3',
  tiles: 'gas-spritesheet',
  heroStartCoords: startPositionsForHeroMap3,
  enemySounds: {
    heroDamageFromEnemy: {
      src: 'assets/sounds/heroSounds/heroDamageFromDeathClaw.wav',
      volume: 1,
    },
    enemyPunch: {
      src: 'assets/sounds/deathClawSounds/deathClawPunch.wav',
      volume: 1,
    },
    enemyDamage: {
      src: 'assets/sounds/deathClawSounds/deathClawDamage.wav',
      volume: 1,
    },
    enemyDeath: {
      src: 'assets/sounds/deathClawSounds/deathClawDeath.wav',
      volume: 1,
    }
  },
  thingsInStorage: {},
  storage: {
    key: 'wash-machine',
    src: 'assets/maps/wash-machine.png',
    position: { x: 72, y: 48 }
  },
  heroInventory: defaultInventory,
  heroAnims: defaultHeroAnims,
  heroHealthPoints: defaultHeroHealthPoints,
  isHeroInArmor: defaultIsHeroInArmor
}

export function saveHeroInventory(currentHeroInventoryState: thingsContainerItemsType) {
  for (const i in currentHeroInventoryState) {
    currentLevel.heroInventory[i] = currentHeroInventoryState[i];
  }
}

export function setCurrentLevel(level: level) {
  currentLevel = level;
}

export function setCurrentDialogue(dialogue: DialogueKey) {
  currentDialogue = dialogue;
}

export function setCurrentMode(mode: string) {
  currentMode = mode;
}

export function setNewLevelForGame() {
  const currentLevelIndex = levels.indexOf(currentLevel);
  const currentDialogueIndex = dialogues.indexOf(currentDialogue);
  if(currentDialogueIndex === 2 && currentLevelIndex === 2){
    return true;
  }
  currentLevel = levels[currentLevelIndex + 1];
  currentDialogue = dialogues[currentDialogueIndex + 1];
}

export function setHeroHealthPoints(currentHealthPoints: number) {
  currentLevel.heroHealthPoints = currentHealthPoints;
}

export function setArmorState(isHeroInArmor: boolean) {
  currentLevel.isHeroInArmor = isHeroInArmor;
}

export function setCurrentHeroAnims(currentHeroAnims: Animations) {
  currentLevel.heroAnims = currentHeroAnims;
}

export function setDefaultValuesForHero() {
  levels.forEach((level) => {
    level.heroInventory = structuredClone(defaultInventory);
    level.heroAnims = defaultHeroAnims;
    level.heroHealthPoints = defaultHeroHealthPoints;
    level.isHeroInArmor = defaultIsHeroInArmor;
  })
}

export function setRandomThingsForStorage(){
  const thingsQuantity = Math.ceil((Math.random() * 10) / 3);
  for(let i = thingsQuantity; i > 0; i--){
    let randomIndex = Math.floor(Math.random() * 10);
    if(randomIndex === 9){
      randomIndex = 8;
    }
    const thingsKey = thingsForRandom[randomIndex];
    currentLevel.thingsInStorage[thingsKey] = inventoryInfo[thingsKey];
  }
}

export function clearStorages(){
  levels.forEach((level) => {
    level.thingsInStorage = {};
  })
}

export function setThingsInStorage(){
  level1.thingsInStorage = {
    armor: {
      src: inventoryInfo.armor.src,
      quantity: 1
    },
    bullets: {
      src: inventoryInfo.bullets.src,
      quantity: 4
    },
    beer: {
      src: inventoryInfo.beer.src,
      quantity: 2
    },
  };
  level2.thingsInStorage = {
    healPowder: {
      src: inventoryInfo.healPowder.src,
      quantity: 1
    },
    bullets: {
      src: inventoryInfo.bullets.src,
      quantity: 6
    },
  };
  level3.thingsInStorage = {
    stimulant: {
      src: inventoryInfo.stimulant.src,
      quantity: 1
    },
    bullets: {
      src: inventoryInfo.bullets.src,
      quantity: 10
    },
  };
}

const levels: level[] = [level1, level2, level3];
const dialogues: DialogueKey[] = ["dialogue-1", "dialogue-2", "dialogue-3"];

export const levelMode = 'levelMode';
export const gameMode = 'gameMode';

export let currentLevel: level;
export let currentDialogue: DialogueKey;
export let currentMode: string;
