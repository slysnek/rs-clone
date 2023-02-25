import AppController from "./appController";
import Phaser from 'phaser';
import config from '../game/config';
import { level, level1, level2, level3, setCurrentLevel, setCurrentDialogue, setCurrentMode, levelMode, gameMode } from '../game/levels';
import dialogueConfig from '../game/dialogue-config';

class AppView {
  controller: AppController;
  level1Button: HTMLButtonElement;
  level2Button: HTMLButtonElement;
  level3Button: HTMLButtonElement;
  fullGameButton: HTMLButtonElement;
  menu: HTMLElement;
  game: Phaser.Game | null;

  constructor() {
    this.controller = new AppController();
    this.menu = document.querySelector('.menu') as HTMLElement;
    this.level1Button = document.createElement('button');
    this.level2Button = document.createElement('button');
    this.level3Button = document.createElement('button');
    this.fullGameButton = document.createElement('button');
    this.game = null;
  }

  addLevelButtons() {
    this.level1Button.innerText = 'Level 1';
    this.menu.append(this.level1Button);
    this.level2Button.innerText = 'Level 2';
    this.menu.append(this.level2Button);
    this.level3Button.innerText = 'Level 3';
    this.menu.append(this.level3Button);
    this.fullGameButton.innerText = 'Full game';
    this.menu.append(this.fullGameButton);
  }

  setButtonsListeners() {
    this.level1Button.addEventListener('click', () => {
      this.setLevelButtonsListener(level1);
    });
    this.level2Button.addEventListener('click', () => {
      this.setLevelButtonsListener(level2);
    });
    this.level3Button.addEventListener('click', () => {
      this.setLevelButtonsListener(level3);
    });
    this.fullGameButton.addEventListener('click', () => {
      this.hideMenu();
      setCurrentLevel(level1);
      setCurrentDialogue('dialogue-1');
      setCurrentMode(gameMode);
      this.game = new Phaser.Game(dialogueConfig);
    })
  }

  setLevelButtonsListener(currentLevel: level){
    this.hideMenu();
    setCurrentLevel(currentLevel);
    setCurrentMode(levelMode);
    this.game = new Phaser.Game(config);
  }

  destroyGame(){
    this.game?.plugins.removeScenePlugin('gridEngine');
    this.game?.destroy(true);
  }

  hideMenu(){
    this.menu.classList.add('hide');
  }

  showMenu(){
    this.menu.classList.remove('hide');
  }

  run() {
    this.addLevelButtons();
    this.setButtonsListeners();
  }
}

export default AppView;