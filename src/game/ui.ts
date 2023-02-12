import { Tilemaps } from "phaser";
import { windowSize } from "./constants";
import Game from "./game";

export default class UI {
  createUI(scene: Game) {
    const testUI = scene.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight - 45).createFromCache('ui')
    testUI.scrollFactorX = 0;
    testUI.scrollFactorY = 0;
  }

  putMessageToConsole(scene: Game, message = 'debug message') {
    scene.input.on('pointerdown', () => {
      const coordMessage = document.createElement('li')
      coordMessage.classList.add('console-message')
      coordMessage.textContent = message;
      const consoleList = document.querySelector('.console-messages-list') as HTMLElement;
      consoleList.prepend(coordMessage)
    })
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