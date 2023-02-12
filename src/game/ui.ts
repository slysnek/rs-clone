import { Tilemaps } from "phaser";
import { windowSize } from "./constants";
import Game from "./game";
import Hero from "./hero";

export default class UI {
  createUI(scene: Game) {
    const testUI = scene.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight - 45).createFromCache('ui')
    testUI.scrollFactorX = 0;
    testUI.scrollFactorY = 0;
  }

  updateHP(hero: Hero){
    const HP = document.querySelector('.hp') as HTMLElement
    if(hero.healthPoints < 10){
      HP.textContent = '0' + hero.healthPoints.toString();
    } else{
      HP.textContent = hero.healthPoints.toString();
    }
  }

  updateWeapon(hero: Hero){
    const weapon = document.querySelector('.weapon') as HTMLElement
    const weaponName = document.querySelector('.weapon-name') as HTMLElement
    weapon.style.background = `url(${hero.weapon.image})`
    weaponName.textContent = hero.weapon.name;
  }

  putMessageToConsole(message = 'debug message') {
      const coordMessage = document.createElement('li')
      coordMessage.classList.add('console-message')
      coordMessage.textContent = message;
      const consoleList = document.querySelector('.console-messages-list') as HTMLElement;
      consoleList.prepend(coordMessage)
      this.deleteLastMessage()
  }

  deleteLastMessage() {
    //delete messages if > 20
    const allMessages = document.querySelectorAll('.console-message');
    if (allMessages.length > 20) {
      const lastMessage = allMessages[allMessages.length - 1];
      lastMessage.remove()
    }
  }
}