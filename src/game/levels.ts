import { 
  heroAnims,
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
  startPositionsForHeroMap3} from "./constants";
import { DialogueKey } from './dialogue';
import inventory from "./inventory";
import { Animations, thingsContainerItemsType } from './types';

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
  heroStartCoords: { x: number, y: number },
  thingsInStorage: { [key: string]: {src: string, quantity: number} },
  storage: { key: string, src: string, position: {x: number, y: number} },
  heroInventory: { [key: string]: {src: string, quantity: number} },
  heroAnims: Animations
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
  heroStartCoords: startPositionsForHeroMap1,
  thingsInStorage: {
    armor: {
      src: inventory.armor.src,
      quantity: 1
    },
    bullets: {
      src: inventory.bullets.src,
      quantity: 3
    },
    cookie: {
      src: inventory.cookie.src,
      quantity: 2
    },
  },
  storage: {
    key: 'barrel',
    src: 'assets/maps/barrel.png',
    position: { x: 72, y: 48 }
  },
  heroInventory: {  
    pistol: {
      src: inventory.pistol.src,
      quantity: 1
    },
    bullets: {
      src: inventory.bullets.src,
      quantity: 3
    },
  },
  heroAnims: heroAnims,
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
  spriteSheetsSizes: { frameWidth: 106, frameHeight: 135 },
  map: 'map1',
  tiles: 'maptiles2-01-01',
  heroStartCoords: startPositionsForHeroMap2,
  thingsInStorage: {
    healPowder: {
      src: inventory.healPowder.src,
      quantity: 1
    },
    bullets: {
      src: inventory.bullets.src,
      quantity: 4
    },
  },
  storage: {
    key: 'fridge',
    src: 'assets/maps/fridge.png',
    position: { x: 58, y: 90 }
  },
  heroInventory: {  
    pistol: {
      src: inventory.pistol.src,
      quantity: 1
    },
    bullets: {
      src: inventory.bullets.src,
      quantity: 3
    },
  },
  heroAnims: heroAnims,
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
  spriteSheetsSizes: { frameWidth: 120, frameHeight: 118 },
  map: 'map3',
  tiles: 'gas-spritesheet',
  heroStartCoords: startPositionsForHeroMap3,
  thingsInStorage: {
    stimulant: {
      src: inventory.stimulant.src,
      quantity: 1
    },
    bullets: {
      src: inventory.bullets.src,
      quantity: 4
    },
  },
  storage: {
    key: 'wash-machine',
    src: 'assets/maps/wash-machine.png',
    position: { x: 72, y: 48 }
  },
  heroInventory: {  
    pistol: {
      src: inventory.pistol.src,
      quantity: 1
    },
    bullets: {
      src: inventory.bullets.src,
      quantity: 3
    },
  },
  heroAnims: heroAnims,
}

export function saveHeroInventory(currentHeroInventoryState: thingsContainerItemsType){
    for (const i in currentHeroInventoryState){
      currentLevel.heroInventory[i] = currentHeroInventoryState[i];
    }
    console.log(currentLevel.heroInventory)
  }

export function setCurrentLevel(level: level){
  currentLevel = level;
}

export function setCurrentDialogue(dialogue: DialogueKey){
  currentDialogue = dialogue;
}

export function setCurrentMode(mode: string){
  currentMode = mode;
}

export function setNewLevelForGame(){
  const currentLevelIndex = levels.indexOf(currentLevel);
  const currentDialogueIndex = dialogues.indexOf(currentDialogue);
  if(currentDialogueIndex === 2 && currentLevelIndex === 2){
    return 'finish'; 
  }
  currentLevel = levels[currentLevelIndex + 1];
  currentDialogue = dialogues[currentDialogueIndex + 1];
}

const levels: level[] = [level1, level2, level3];
const dialogues: DialogueKey[] = ["dialogue-1", "dialogue-2", "dialogue-3"];

export const levelMode = 'levelMode';
export const gameMode = 'gameMode';

export let currentLevel: level;
export let currentDialogue: DialogueKey;
export let currentMode: string;
