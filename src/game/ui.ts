// import { Tilemaps } from "phaser";
import { windowSize } from "./constants";
import Game from "./game";
import Hero from "./hero";
import { thingsContainerItemsType } from './types'

const storageItems: thingsContainerItemsType = {
  armor: {
    src: '../assets/ui-elements/inventory/armor.png',
    quantity: 1
  },
  bullets: {
    src: '../assets/ui-elements/inventory/bullets.png',
    quantity: 10
  },
};

const storageItemsImageSrc = 'assets/maps/dump.png';
const womanInVaultSuitGifSrc = 'assets/ui-elements/gifs/in-vault-suit.gif';
const womanInArmorGifSrc = 'assets/ui-elements/gifs/in-armor.gif'

export default class UI {
  scene: Phaser.Scene;
  inventoryPanel: HTMLElement | null;
  exchangePanel: HTMLElement | null;
  heroThingsBlock: HTMLElement | null;
  inventoryContainerThingsBlock: HTMLElement | null;
  takeAllButton: HTMLElement | null;
  closeExchangePanelButton: HTMLElement | null;
  closeInventoryPanelButton: HTMLElement | null;
  addItemToInventory: (itemName: string, item: { src: string; quantity: number }) => void;
  heroInventory: thingsContainerItemsType;
  deleteItemFromInventory: (itemName: string) => void;
  inventoryThingContainer: HTMLElement | null;
  armorFieldContainer: HTMLElement | null;
  putOnArmor: () => void;
  takeOffArmor: () => void;
  isHeroInArmor: boolean;
  inventoryGif: HTMLImageElement | null;
  exchangeGif: HTMLImageElement | null;

  constructor(scene: Phaser.Scene, 
    addItemToInventory: (itemName: string, item: { src: string; quantity: number }) => void,
    heroInventory: thingsContainerItemsType,
    deleteItemFromInventory: (itemName: string) => void,
    putOnArmor: () => void,
    takeOffArmor: () => void,
    isHeroInArmor: boolean){
    this.scene = scene;
    this.addItemToInventory = addItemToInventory;
    this.heroInventory = heroInventory;
    this.putOnArmor = putOnArmor;
    this.takeOffArmor = takeOffArmor;
    this.isHeroInArmor = isHeroInArmor;
    this.inventoryPanel = null;
    this.exchangePanel = null;
    this.heroThingsBlock = null;
    this.inventoryContainerThingsBlock = null;
    this.takeAllButton = null;
    this.closeExchangePanelButton = null;
    this.closeInventoryPanelButton = null;
    this.deleteItemFromInventory = deleteItemFromInventory;
    this.inventoryThingContainer = null;
    this.addListenerToThingContainerInExchangePanel = this.addListenerToThingContainerInExchangePanel.bind(this);
    this.addListenerToThingContainerInInventory = this.addListenerToThingContainerInInventory.bind(this);
    this.armorFieldContainer = null;
    this.inventoryGif = null;
    this.exchangeGif = null;
  }

  findElementsForInventoryLogic(){
    this.inventoryPanel = document.querySelector('.inventory-panel') as HTMLElement;
    this.exchangePanel = document.querySelector('.exchange-items-panel') as HTMLElement;
    this.heroThingsBlock = document.querySelector('.hero-things') as HTMLElement;
    this.inventoryContainerThingsBlock = document.querySelector('.inventory-container-things') as HTMLElement;
    this.takeAllButton = document.querySelector('.take-all-button') as HTMLElement;
    this.closeExchangePanelButton = document.querySelector('.close-exchange-panel-button') as HTMLElement;
    this.closeInventoryPanelButton = document.querySelector('.close-inventory-button') as HTMLElement;
    this.inventoryThingContainer = document.querySelector('.inventory-things') as HTMLElement;
    this.armorFieldContainer = document.querySelector('.armor-container') as HTMLElement;
    this.inventoryGif = document.querySelector('.inventory-gif') as HTMLImageElement;
    this.exchangeGif = document.querySelector('.exchange-gif') as HTMLImageElement;
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
    const storageItemsImageContainer = document.querySelector('.storage-img-container');
    const storageItemsImage = document.createElement('img');
    storageItemsImage.src = storageItemsImageSrc;
    storageItemsImage.classList.add('storage-img');
    storageItemsImageContainer?.append(storageItemsImage);
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

  updateWeapon(hero: Hero) {
    const weapon = document.querySelector('.weapon') as HTMLElement;
    const weaponName = document.querySelector('.weapon-name') as HTMLElement;
    weapon.style.background = `url(${hero.currentWeapon.image}) no-repeat`;
    weaponName.textContent = hero.currentWeapon.name;
  }

  setChangeWeaponListener(hero: Hero) {
    const changeWeaponButton = document.querySelector('.cycle-weapons') as HTMLElement;
    changeWeaponButton.addEventListener('click', () => {
      hero.changeWeapon();
      this.updateWeapon(hero);
      this.putMessageToConsole(`Your current weapon: ${hero.currentWeapon.name}`);
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
    //delete messages if > 20
    const allMessages = document.querySelectorAll('.console-message');
    if (allMessages.length > 20) {
      const lastMessage = allMessages[allMessages.length - 1];
      lastMessage.remove();
    }
  }

  addGif(gifElement: HTMLImageElement){
    if(this.isHeroInArmor){
      gifElement.src = womanInArmorGifSrc;
    } else {
      gifElement.src = womanInVaultSuitGifSrc;
    }
  }

  deleteGif(gifElement: HTMLImageElement){
    gifElement.src = '';
  }

  showExchangePanel(){
    if(!(this.exchangePanel?.classList.contains('hide'))){
      return;
    } else {
      (this.exchangePanel as HTMLElement).classList.remove('hide');
      this.addGif(this.exchangeGif as HTMLImageElement);
      this.addThingsToInventoryContainer();
    }
  }

  addItemsToStorage(itemName: string, item: { src: string; quantity: number }){
    storageItems[itemName] = item;
  }

  deleteItemsFromStorage(itemName: string){
    delete storageItems[itemName];
  }

  cleanExchangeWindowFields(){
    (this.heroThingsBlock as HTMLElement).innerHTML = '';
    (this.inventoryContainerThingsBlock as HTMLElement).innerHTML = '';
  }
  
  cleanInventoryPanelFields(){
    (this.inventoryThingContainer as HTMLElement).innerHTML = '';
  }

  setInvButtonListener(){
    const invButton = document.querySelector('.inv-button') as HTMLElement;
    invButton.addEventListener('click', () => {
      if(!(this.inventoryPanel?.classList.contains('hide'))){
        return;
      } else {
        (this.inventoryPanel as HTMLElement).classList.remove('hide');
        this.addGif(this.inventoryGif as HTMLImageElement);
        this.drawThings(this.heroInventory, this.inventoryThingContainer as HTMLElement, this.addListenerToThingContainerInInventory);
      }
    })
  }

  addListenerToThingContainerInInventory(thingContainer: HTMLElement, itemName: string){
    thingContainer.addEventListener('click', () => {
      if(itemName === 'armor'){
        const armorThingContainer = document.querySelector(`.${itemName}`) as HTMLElement;
        const quantityContainer = armorThingContainer.querySelector('.thing-quantity') as HTMLElement;
        armorThingContainer.removeChild(quantityContainer);
        this.armorFieldContainer?.append(armorThingContainer);
        this.putOnArmor();
        this.deleteGif(this.inventoryGif as HTMLImageElement);
        this.addGif(this.inventoryGif as HTMLImageElement);
        this.deleteItemFromInventory('armor');
      }
    })
  }

  drawThings(thingsStorage: thingsContainerItemsType, containerHTMLElement: HTMLElement, listener: (thingContainer: HTMLElement, itemName: string) => void){
    for(const item in thingsStorage){
      const thingContainer = document.createElement('div');
      const thingImg = document.createElement('img');
      const thingQuantity = document.createElement('div');
      thingContainer.classList.add('thing-container');
      thingContainer.classList.add(`${item}`);
      thingImg.classList.add('thing-img');
      thingQuantity.classList.add('thing-quantity');
      thingQuantity.innerText = `x${thingsStorage[item].quantity}`;
      thingImg.src = thingsStorage[item].src;
      thingContainer.append(thingImg);
      thingContainer.append(thingQuantity);
      containerHTMLElement.append(thingContainer);
      listener(thingContainer, item);
    }
  }

  addListenerToThingContainerInExchangePanel(thingContainer: HTMLElement, itemName: string){
    thingContainer.addEventListener('click', () => {
      const thingContainerParent = thingContainer.parentElement;
      console.log(thingContainerParent)
      if(thingContainerParent?.classList.contains('inventory-container-things')){
        this.addItemToInventory(itemName, storageItems[itemName]);
        this.deleteItemsFromStorage(itemName);
      } else if(thingContainerParent?.classList.contains('hero-things')) {
        this.addItemsToStorage(itemName, this.heroInventory[itemName]);
        this.deleteItemFromInventory(itemName);
      }
      this.cleanExchangeWindowFields();
      this.drawThings(this.heroInventory, this.heroThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
      this.drawThings(storageItems, this.inventoryContainerThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
    });
  }

  addThingsToInventoryContainer(){
    this.drawThings(this.heroInventory, this.heroThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
    this.drawThings(storageItems, this.inventoryContainerThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
  }

  setTakeAllButtonListener(){
    this.takeAllButton?.addEventListener('click', () => {
      for(const item in storageItems){
        this.addItemToInventory(item, storageItems[item]);
        this.deleteItemsFromStorage(item);
      }
      this.cleanExchangeWindowFields();
      this.drawThings(this.heroInventory, this.heroThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
      this.drawThings(storageItems, this.inventoryContainerThingsBlock as HTMLElement, this.addListenerToThingContainerInExchangePanel);
    }) 
  }

  setCloseExchangePanelButtonListener(){
    this.closeExchangePanelButton?.addEventListener('click', () => {
      this.exchangePanel?.classList.add('hide');
      this.deleteGif(this.exchangeGif as HTMLImageElement);
      this.cleanExchangeWindowFields();
    })
  }

  setCloseInventoryPanelButtonListener(){
    this.closeInventoryPanelButton?.addEventListener('click', () => {
      this.inventoryPanel?.classList.add('hide');
      this.deleteGif(this.inventoryGif as HTMLImageElement);
      this.cleanInventoryPanelFields();
    })
  }
}