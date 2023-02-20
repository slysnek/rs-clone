// import { Tilemaps } from "phaser";
import { windowSize } from "./constants";
import Game from "./game";
import Hero from "./hero";

export default class UI {
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene){
    this.scene = scene;
  }

  createUI(scene: Game) {
    const testUI = scene.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight - 45).createFromCache('ui')
    testUI.scrollFactorX = 0;
    testUI.scrollFactorY = 0;
    const exchangePanel = document.querySelector('.exchange-items-panel') as HTMLElement;
    const top = -(((windowSize.windowHeight - 45) / 2) + 377 / 2);
    const left = testUI.width / 2 - 264;
    exchangePanel.style.top = `${top}px`;
    exchangePanel.style.left = `${left}px`;
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
      const exchanhePanel = document.querySelector('.exchange-items-panel') as HTMLElement;
      exchanhePanel.classList.toggle('hide');
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
}