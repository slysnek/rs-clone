// import { Tilemaps } from "phaser";
import {
  heroAnimsWithoutArmor,
  heroAnimsInArmor,
  windowSize,
  healsHealthPoints
} from "./constants";
import Game from "./game";
import Hero from "./hero";
import { Animations, thingsContainerItemsType } from './types';
import { inventoryInfo } from './inventory';
import dialogueConfig from '../game/dialogue-config';
import {
  currentMode,
  levelMode,
  gameMode,
  setNewLevelForGame,
  currentLevel,
  saveHeroInventory,
  setHeroHealthPoints,
  setArmorState,
  setCurrentHeroAnims,
  setDefaultValuesForHero,
  clearStorages
} from '../game/levels';
import appView from "..";


const pistolImageSrc = '../assets/weapons/pistol-03.png';
const womanInVaultSuitGifSrc = 'assets/ui-elements/gifs/in-vault-suit.gif';
const womanInArmorGifSrc = 'assets/ui-elements/gifs/in-armor.gif'

export default class UI {
  scene: Phaser.Scene;
  inventoryPanel: HTMLElement | null;
  deathPanel: HTMLImageElement | null;
  exchangePanel: HTMLElement | null;
  heroThingsBlock: HTMLElement | null;
  inventoryContainerThingsBlock: HTMLElement | null;
  takeAllButton: HTMLElement | null;
  closeExchangePanelButton: HTMLElement | null;
  closeInventoryPanelButton: HTMLElement | null;
  addItemToInventory: (itemName: string, item: { src: string; quantity: number, description: string }) => void;
  heroInventory: thingsContainerItemsType;
  deleteItemFromInventory: (itemName: string) => void;
  inventoryThingContainer: HTMLElement | null;
  armorFieldContainer: HTMLElement | null;
  armorImage: HTMLImageElement | null;
  putOnArmor: () => void;
  takeOffArmor: () => void;
  inventoryGif: HTMLImageElement | null;
  exchangeGif: HTMLImageElement | null;
  nextLevelButton: HTMLButtonElement | null;
  pistolImg: HTMLImageElement | null;
  description: HTMLElement | null;
  storageItemsImageSrc: string;
  changeArmorAnimations: (currentAnims: Animations) => void;
  getHeroHealthPoints: () => number;
  getHeroArmorState: () => boolean;
  getHeroAnims: () => Animations;
  addArmorHealthPoints: () => void;
  deleteArmorHealthPoints: () => void;
  addHealthPointsFromHeals: (healthPointsFromHeal: number) => void;
  sounds: { [soundName: string]: Phaser.Sound.BaseSound };
  restoredActionPoints: () => boolean;
  throwAwayPistol: () => void
  loadMenuButton: HTMLButtonElement | null;


  constructor(scene: Phaser.Scene,
    addItemToInventory: (itemName: string, item: { src: string; quantity: number, description: string }) => void,
    heroInventory: thingsContainerItemsType,
    deleteItemFromInventory: (itemName: string) => void,
    putOnArmor: () => void,
    takeOffArmor: () => void,
    changeArmorAnimations: (currentAnims: Animations) => void,
    getHeroHealthPoints: () => number,
    getHeroArmorState: () => boolean,
    getHeroAnims: () => Animations,
    addArmorHealthPoints: () => void,
    deleteArmorHealthPoints: () => void,
    addHealthPointsFromHeals: (healthPointsFromHeal: number) => void,
    sounds: { [soundName: string]: Phaser.Sound.BaseSound },
    restoredActionPoints: () => boolean,
    throwAwayPistol: () => void) {
    this.scene = scene;
    this.addItemToInventory = addItemToInventory;
    this.heroInventory = heroInventory;
    this.putOnArmor = putOnArmor;
    this.takeOffArmor = takeOffArmor;
    this.changeArmorAnimations = changeArmorAnimations;
    this.inventoryPanel = null;
    this.deathPanel = null;
    this.exchangePanel = null;
    this.heroThingsBlock = null;
    this.inventoryContainerThingsBlock = null;
    this.takeAllButton = null;
    this.closeExchangePanelButton = null;
    this.closeInventoryPanelButton = null;
    this.deleteItemFromInventory = deleteItemFromInventory;
    this.inventoryThingContainer = null;
    this.description = null;
    this.addListenerToThingContainerInExchangePanel = this.addListenerToThingContainerInExchangePanel.bind(this);
    this.addListenerToThingContainerInInventory = this.addListenerToThingContainerInInventory.bind(this);
    this.armorFieldContainer = null;
    this.armorImage = null;
    this.inventoryGif = null;
    this.exchangeGif = null;
    this.nextLevelButton = null;
    this.loadMenuButton = null;
    this.pistolImg = null;
    this.storageItemsImageSrc = currentLevel.storage.src;
    this.getHeroHealthPoints = getHeroHealthPoints;
    this.getHeroArmorState = getHeroArmorState;
    this.getHeroAnims = getHeroAnims;
    this.addArmorHealthPoints = addArmorHealthPoints;
    this.deleteArmorHealthPoints = deleteArmorHealthPoints;
    this.addHealthPointsFromHeals = addHealthPointsFromHeals;
    this.sounds = sounds;
    this.restoredActionPoints = restoredActionPoints;
    this.throwAwayPistol = throwAwayPistol;
  }

  findElementsForInventoryLogic() {
    this.inventoryPanel = document.querySelector('.inventory-panel') as HTMLElement;
    this.deathPanel = document.querySelector('.death-panel') as HTMLImageElement;
    this.exchangePanel = document.querySelector('.exchange-items-panel') as HTMLElement;
    this.heroThingsBlock = document.querySelector('.hero-things') as HTMLElement;
    this.inventoryContainerThingsBlock = document.querySelector('.inventory-container-things') as HTMLElement;
    this.takeAllButton = document.querySelector('.take-all-button') as HTMLElement;
    this.closeExchangePanelButton = document.querySelector('.close-exchange-panel-button') as HTMLElement;
    this.closeInventoryPanelButton = document.querySelector('.close-inventory-button') as HTMLElement;
    this.inventoryThingContainer = document.querySelector('.inventory-things') as HTMLElement;
    this.armorFieldContainer = document.querySelector('.armor-container') as HTMLElement;
    this.armorImage = this.armorFieldContainer?.querySelector('.armor-image') as HTMLImageElement;
    this.inventoryGif = document.querySelector('.inventory-gif') as HTMLImageElement;
    this.exchangeGif = document.querySelector('.exchange-gif') as HTMLImageElement;
    this.nextLevelButton = document.querySelector('.next-level-button') as HTMLButtonElement;
    this.loadMenuButton = document.querySelector('.load-menu-button') as HTMLButtonElement;
    this.pistolImg = document.querySelector('.pistol-img') as HTMLImageElement;
    this.description = document.querySelector('.description') as HTMLElement;
  }

  createUI(scene: Game) {
    const testUI = scene.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight - 45).createFromCache('ui')
    testUI.scrollFactorX = 0;
    testUI.scrollFactorY = 0;
    const top = -(((windowSize.windowHeight - 45) / 2) + 377 / 2);
    const left = testUI.width / 2 - 264;
    this.findElementsForInventoryLogic();
    (this.exchangePanel as HTMLElement).style.top = `${top}px`;
    (this.exchangePanel as HTMLElement).style.left = `${left}px`;
    (this.inventoryPanel as HTMLElement).style.top = `${top}px`;
    (this.inventoryPanel as HTMLElement).style.left = `${left}px`;
    (this.deathPanel as HTMLElement).style.top = `${top}px`;
    (this.deathPanel as HTMLElement).style.left = `${left}px`;
    const storageItemsImageContainer = document.querySelector('.storage-img-container');
    const storageItemsImage = document.createElement('img');
    storageItemsImage.src = this.storageItemsImageSrc;
    storageItemsImage.classList.add('storage-img');
    storageItemsImageContainer?.append(storageItemsImage);
    if (this.getHeroArmorState()) {
      (this.armorImage as HTMLImageElement).src = inventoryInfo.armor.src
    }
  }

  makeNextLevelButtonAvailable() {
    this.nextLevelButton?.classList.remove('unavailable');
    this.nextLevelButton?.classList.add('available');
  }

  setNextLevelButtonListener() {
    this.nextLevelButton?.addEventListener('click', () => {
      if (currentMode === levelMode) {
        this.scene.sys.plugins.removeScenePlugin('gridEngine');
        this.scene.sys.game.destroy(true);
        appView.showMenu();
      } else if (currentMode === gameMode) {
        this.scene.sys.plugins.removeScenePlugin('gridEngine');
        this.scene.sys.game.destroy(true);
        const isGameFinished = setNewLevelForGame();
        if (isGameFinished) {
          clearStorages();
          setDefaultValuesForHero();
          appView.showMenu();
        } else {
          setCurrentHeroAnims(this.getHeroAnims());
          setArmorState(this.getHeroArmorState());
          saveHeroInventory(this.heroInventory);
          setHeroHealthPoints(this.getHeroHealthPoints());
          new Phaser.Game(dialogueConfig);
        }
      }
    })
  }

  makeDeathPanelAvailable() {
    this.deathPanel?.classList.remove('hide');
  }

  setDeathPanelListener() {
    this.loadMenuButton?.addEventListener('click', () => {
      this.scene.sys.plugins.removeScenePlugin('gridEngine');
      this.scene.sys.game.destroy(true);
      appView.showMenu();
    })
  }

  updateHP(hero: Hero) {
    const HP = document.querySelector('.hp') as HTMLElement;
    if (hero.healthPoints < 0) {
      HP.textContent = '0';
      return;
    }
    if (hero.healthPoints < 10) {
      HP.textContent = '0' + hero.healthPoints.toString();
    } else {
      HP.textContent = hero.healthPoints.toString();
    }
  }

  updateAP(hero: Hero) {
    const APlights = document.querySelectorAll('.light');
    for (let i = 0; i < hero.currentActionPoints; i++) {
      APlights[i].classList.add('on');
    }
    for (let i = hero.currentActionPoints; i < 10; i++) {
      APlights[i].classList.remove('on');
    }
  }

  setEndTurnListener(hero: Hero, scene: Game) {
    const endTurnButton = document.querySelector('.end-turn') as HTMLElement;
    endTurnButton.addEventListener('click', () => {
      if (hero.fightMode && hero.healthPoints > 0) {
        hero.currentActionPoints = 0;
        hero.gridEngine.stopMovement(hero.id);
        scene.refreshAllEnemiesActionPoints();
        scene.moveEnemiesToHero(hero.gridEngine.getPosition(hero.id));

        this.updateAP(hero);
        this.sounds.buttonClick.play();
      }
    })
  }

  updateWeapon(hero: Hero) {
    const weapon = document.querySelector('.weapon') as HTMLElement;
    const weaponName = document.querySelector('.weapon-name') as HTMLElement;
    const weaponDamage = document.querySelector('.weapon-damage') as HTMLElement;
    const weaponAccuracy = document.querySelector('.weapon-accuracy') as HTMLElement;
    const weaponRange = document.querySelector('.weapon-range') as HTMLElement;
    weapon.style.background = `url(${hero.currentWeapon.image}) no-repeat`;
    weaponName.textContent = hero.currentWeapon.name;
    weaponDamage.textContent = `Damage: ${hero.currentWeapon.attack.toString()}`;
    weaponAccuracy.textContent = `Accuracy: ${hero.currentWeapon._minAccuracy.toString()}-${hero.currentWeapon._maxAccuracy.toString()}%`
    weaponRange.textContent = `Range: ${hero.currentWeapon.maxRange.toString()}`;
  }

  setChangeWeaponListener(hero: Hero) {
    const changeWeaponButton = document.querySelector('.cycle-weapons') as HTMLElement;
    changeWeaponButton.addEventListener('click', () => {
      // eslint-disable-next-line no-prototype-builtins
      if (this.heroInventory.hasOwnProperty('pistol')) {
        hero.changeWeapon();
        this.updateWeapon(hero);
        this.putMessageToConsole(`Your current weapon: ${hero.currentWeapon.name}`);
      }
    })
  }

  putMessageToConsole(message = 'debug message') {
    const coordMessage = document.createElement('li');
    coordMessage.classList.add('console-message');
    coordMessage.textContent = message;
    const consoleList = document.querySelector('.console-messages-list') as HTMLElement;
    consoleList.prepend(coordMessage);
    this.deleteLastMessage();
  }

  deleteLastMessage() {
    const allMessages = document.querySelectorAll('.console-message');
    if (allMessages.length > 20) {
      const lastMessage = allMessages[allMessages.length - 1];
      lastMessage.remove();
    }
  }

  addGif(gifElement: HTMLImageElement) {
    if (this.getHeroArmorState()) {
      gifElement.src = womanInArmorGifSrc;
    } else {
      gifElement.src = womanInVaultSuitGifSrc;
    }
  }

  deleteGif(gifElement: HTMLImageElement) {
    gifElement.src = '';
  }

  showExchangePanel() {
    if (!(this.exchangePanel?.classList.contains('hide'))) {
      return;
    } else {
      if(this.inventoryPanel?.classList.contains('hide')){
        (this.exchangePanel as HTMLElement).classList.remove('hide');
        this.addGif(this.exchangeGif as HTMLImageElement);
        this.addThingsToInventoryContainer();
      }
    }
  }

  addItemsToStorage(itemName: string, item: { src: string; quantity: number, description: string }) {
    currentLevel.thingsInStorage[itemName] = item;
  }

  deleteItemsFromStorage(itemName: string) {
    delete currentLevel.thingsInStorage[itemName];
  }

  cleanExchangeWindowFields() {
    (this.heroThingsBlock as HTMLElement).innerHTML = '';
    (this.inventoryContainerThingsBlock as HTMLElement).innerHTML = '';
  }

  cleanInventoryPanelFields() {
    (this.inventoryThingContainer as HTMLElement).innerHTML = '';
  }

  setInvButtonListener() {
    const invButton = document.querySelector('.inv-button') as HTMLElement;
    invButton.addEventListener('click', () => {
      if (!(this.inventoryPanel?.classList.contains('hide'))) {
        return;
      } else {
        if(this.exchangePanel?.classList.contains('hide')){
          this.sounds.buttonClick.play();
          (this.inventoryPanel as HTMLElement).classList.remove('hide');
          // eslint-disable-next-line no-prototype-builtins
          if (this.heroInventory.hasOwnProperty('pistol')) {
            (this.pistolImg as HTMLImageElement).src = pistolImageSrc;
          } else {
            (this.pistolImg as HTMLImageElement).src = '';
          }
          this.addGif(this.inventoryGif as HTMLImageElement);
          this.drawThings(this.heroInventory, this.inventoryThingContainer as HTMLElement, this.addListenerToThingContainerInInventory);
        }
      }
    })
  }

  addListenerToThingContainerInInventory(thingContainer: HTMLElement, itemName: string) {
    thingContainer.addEventListener('click', () => {
      (this.description as HTMLElement).innerText = inventoryInfo[itemName].description;
      if (itemName === 'armor') {
        this.sounds.itemMove.play();
        const thingContainerParent = thingContainer.parentElement;
        thingContainerParent?.removeChild(thingContainer);
        (this.armorImage as HTMLImageElement).src = inventoryInfo.armor.src;
        this.putOnArmor();
        this.addArmorHealthPoints();
        this.deleteGif(this.inventoryGif as HTMLImageElement);
        this.addGif(this.inventoryGif as HTMLImageElement);
        this.deleteItemFromInventory('armor');
        this.changeArmorAnimations(heroAnimsInArmor);
      } else if (itemName === 'bullets') {
        this.sounds.itemMove.play();
      } else if (itemName === 'dice') {
        if (this.restoredActionPoints()) {
          this.sounds.dice.play();
          this.heroInventory[itemName].quantity -= 1;
          if (this.heroInventory[itemName].quantity === 0) {
            this.deleteItemFromInventory(itemName);
          }
          (this.inventoryThingContainer as HTMLElement).innerHTML = '';
          this.drawThings(this.heroInventory, this.inventoryThingContainer as HTMLElement, this.addListenerToThingContainerInInventory);
        }
      } else if (itemName === 'beer' || itemName === 'healPowder' || itemName === 'stimulant') {
        this.sounds[itemName].play();
        this.addHealthPointsFromHeals(healsHealthPoints[itemName]);
        this.heroInventory[itemName].quantity -= 1;
        if (this.heroInventory[itemName].quantity === 0) {
          this.deleteItemFromInventory(itemName);
        }
        (this.inventoryThingContainer as HTMLElement).innerHTML = '';
        this.drawThings(this.heroInventory, this.inventoryThingContainer as HTMLElement, this.addListenerToThingContainerInInventory);
      } else if (itemName === 'elvis') {
        this.sounds.elvis.play();
      }
    })
  }

  setArmorContainerListener() {
    this.armorFieldContainer?.addEventListener('click', () => {
      if (!this.getHeroArmorState()) {
        return;
      } else {
        this.sounds.itemMove.play();
        const armorThingContainer = this.createThingContainer(this.inventoryThingContainer as HTMLElement, inventoryInfo, 'armor');
        this.addListenerToThingContainerInInventory(armorThingContainer, 'armor');
        (this.armorImage as HTMLImageElement).src = '';
        this.takeOffArmor();
        this.deleteArmorHealthPoints();
        this.deleteGif(this.inventoryGif as HTMLImageElement);
        this.addGif(this.inventoryGif as HTMLImageElement);
        this.addItemToInventory('armor', inventoryInfo.armor);
        this.changeArmorAnimations(heroAnimsWithoutArmor);
      }
    })
  }

  drawThings(thingsStorage: thingsContainerItemsType, containerHTMLElement: HTMLElement, listener: (thingContainer: HTMLElement, itemName: string) => void) {
    for (const itemName in thingsStorage) {
      const thingContainer = this.createThingContainer(containerHTMLElement, thingsStorage, itemName);
      listener(thingContainer, itemName);
    }
  }

  createThingContainer(containerHTMLElement: HTMLElement, thingsStorage: thingsContainerItemsType, itemName: string) {
    const thingContainer = document.createElement('div');
    const thingImg = document.createElement('img');
    const thingQuantity = document.createElement('div');
    thingContainer.classList.add('thing-container');
    thingContainer.classList.add(`${itemName}`);
    thingImg.classList.add('thing-img');
    thingQuantity.classList.add('thing-quantity');
    thingQuantity.innerText = `x${thingsStorage[itemName].quantity}`;
    thingImg.src = thingsStorage[itemName].src;
    thingContainer.append(thingImg);
    thingContainer.append(thingQuantity);
    containerHTMLElement.append(thingContainer);
    return thingContainer;
  }

  addListenerToThingContainerInExchangePanel(thingContainer: HTMLElement, itemName: string) {
    thingContainer.addEventListener('click', () => {
      this.sounds.itemMove.play();
      const thingContainerParent = thingContainer.parentElement;
      if (thingContainerParent?.classList.contains('inventory-container-things')) {
        this.addItemToInventory(itemName, currentLevel.thingsInStorage[itemName]);
        this.deleteItemsFromStorage(itemName);
      } else if (thingContainerParent?.classList.contains('hero-things')) {
        this.addItemsToStorage(itemName, this.heroInventory[itemName]);
        this.deleteItemFromInventory(itemName);
        if (itemName === 'pistol') {
          this.throwAwayPistol();
        }
      }
      this.cleanExchangeWindowFields();
      this.drawThings(this.heroInventory, this.heroThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
      this.drawThings(currentLevel.thingsInStorage, this.inventoryContainerThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
    });
  }

  addThingsToInventoryContainer() {
    this.drawThings(this.heroInventory, this.heroThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
    this.drawThings(currentLevel.thingsInStorage, this.inventoryContainerThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
  }

  setTakeAllButtonListener() {
    this.takeAllButton?.addEventListener('click', () => {
      this.sounds.buttonClick.play();
      for (const item in currentLevel.thingsInStorage) {
        this.addItemToInventory(item, currentLevel.thingsInStorage[item]);
        this.deleteItemsFromStorage(item);
      }
      this.cleanExchangeWindowFields();
      this.drawThings(this.heroInventory, this.heroThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
      this.drawThings(currentLevel.thingsInStorage, this.inventoryContainerThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
    })
  }

  setCloseExchangePanelButtonListener() {
    this.closeExchangePanelButton?.addEventListener('click', () => {
      this.sounds.buttonClick.play();
      this.exchangePanel?.classList.add('hide');
      this.deleteGif(this.exchangeGif as HTMLImageElement);
      this.cleanExchangeWindowFields();
    })
  }

  setCloseInventoryPanelButtonListener() {
    this.closeInventoryPanelButton?.addEventListener('click', () => {
      this.sounds.buttonClick.play();
      this.inventoryPanel?.classList.add('hide');
      this.deleteGif(this.inventoryGif as HTMLImageElement);
      this.cleanInventoryPanelFields();
    })
  }
}