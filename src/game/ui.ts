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
}

export default class UI {
  scene: Phaser.Scene;
  inventoryPanel: HTMLElement | null;
  exchangePanel: HTMLElement | null;
  heroThingsBlock: HTMLElement | null;
  inventoryContainerThingsBlock: HTMLElement | null;
  takeAllButton: HTMLElement | null;
  closeButton: HTMLElement | null;
  addItemToInventory: (itemName: string, item: { src: string; quantity: number }) => void;
  heroInventory: thingsContainerItemsType;
  deleteItemFromInventory: (itemName: string) => void;

  constructor(scene: Phaser.Scene, 
    addItemToInventory: (itemName: string, item: { src: string; quantity: number }) => void,
    heroInventory: thingsContainerItemsType,
    deleteItemFromInventory: (itemName: string) => void){
    this.scene = scene;
    this.addItemToInventory = addItemToInventory;
    this.heroInventory = heroInventory;
    this.inventoryPanel = null;
    this.exchangePanel = null;
    this.heroThingsBlock = null;
    this.inventoryContainerThingsBlock = null;
    this.takeAllButton = null;
    this.closeButton = null;
    this.deleteItemFromInventory = deleteItemFromInventory;
  }

  findElementsForInventoryLogic(){
    this.inventoryPanel = document.querySelector('.inventory-panel') as HTMLElement;
    this.exchangePanel = document.querySelector('.exchange-items-panel') as HTMLElement;
    this.heroThingsBlock = document.querySelector('.hero-things') as HTMLElement;
    this.inventoryContainerThingsBlock = document.querySelector('.inventory-container-things') as HTMLElement;
    this.takeAllButton = document.querySelector('.take-all-button') as HTMLElement;
    this.closeButton = document.querySelector('.close-button') as HTMLElement;
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

  setInvButtonListener(){
    const invButton = document.querySelector('.inv-button') as HTMLElement;
    invButton.addEventListener('click', () => {
      (this.inventoryPanel as HTMLElement).classList.toggle('hide');
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

  showExchangePanel(){
    (this.exchangePanel as HTMLElement).classList.remove('hide');
    this.addThingsToInventoryContainer();
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

  drawThingsInExchangePanel(thingsStorage: thingsContainerItemsType, containerHTMLElement: HTMLElement){
    for(const item in thingsStorage){
      const thingContainer = document.createElement('div');
      const thingImg = document.createElement('img');
      const thingQuantity = document.createElement('div');
      thingContainer.classList.add('thing-container');
      thingImg.classList.add('thing-img');
      thingQuantity.classList.add('thing-quantity');
      thingQuantity.innerText = `x${thingsStorage[item].quantity}`;
      thingImg.src = thingsStorage[item].src;
      thingContainer.append(thingImg);
      thingContainer.append(thingQuantity);
      containerHTMLElement.append(thingContainer);
      this.addListenerToThingContainer(thingContainer, item);
    }
  }

  addListenerToThingContainer(thingContainer: HTMLElement, itemName: string){
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
      this.drawThingsInExchangePanel(this.heroInventory, this.heroThingsBlock as HTMLElement);
      this.drawThingsInExchangePanel(storageItems, this.inventoryContainerThingsBlock as HTMLElement);
    });
  }

  addThingsToInventoryContainer(){
    this.drawThingsInExchangePanel(this.heroInventory, this.heroThingsBlock as HTMLElement);
    this.drawThingsInExchangePanel(storageItems, this.inventoryContainerThingsBlock as HTMLElement);
  }

  setTakeAllButtonListener(){
    this.takeAllButton?.addEventListener('click', () => {
      for(const item in storageItems){
        this.addItemToInventory(item, storageItems[item]);
        this.deleteItemsFromStorage(item);
      }
      this.cleanExchangeWindowFields();
      this.drawThingsInExchangePanel(this.heroInventory, this.heroThingsBlock as HTMLElement);
      this.drawThingsInExchangePanel(storageItems, this.inventoryContainerThingsBlock as HTMLElement);
    }) 
  }

  setCloseButtonListener(){
    this.closeButton?.addEventListener('click', () => {
      this.exchangePanel?.classList.add('hide');
      this.cleanExchangeWindowFields();
    })
  }
}