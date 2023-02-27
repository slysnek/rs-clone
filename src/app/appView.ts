import Phaser from 'phaser';
import config from '../game/config';
import {
  level,
  level1,
  level2,
  level3,
  setCurrentLevel,
  setCurrentDialogue,
  setCurrentMode,
  levelMode,
  gameMode,
  setRandomThingsForStorage,
  setDefaultValuesForHero,
  setThingsInStorage
} from '../game/levels';
import dialogueConfig from '../game/dialogue-config';
import { footer } from '../assets/components/footer';
import { popUp } from '../assets/components/menu pop-up';
import { tutorial } from '../assets/components/tutorial';
import { settings } from '../assets/components/settings';


class AppView {
  body: HTMLElement;
  level1Button: HTMLButtonElement;
  level2Button: HTMLButtonElement;
  level3Button: HTMLButtonElement;
  newGameButton: HTMLButtonElement;
  menu: HTMLElement;
  game: Phaser.Game | null;
  settings: HTMLButtonElement;
  howToPlay: HTMLButtonElement;
  title: HTMLElement;
  audio: HTMLAudioElement;

  constructor() {
    this.body = document.querySelector('body') as HTMLElement;
    this.menu = document.querySelector('.menu') as HTMLElement;
    this.title = document.createElement('h1');
    this.level1Button = this.createMenuButton('Level 1');
    this.level2Button = this.createMenuButton('Level 2');
    this.level3Button = this.createMenuButton('Level 3');
    this.newGameButton = this.createMenuButton('New game');
    this.settings = this.createMenuButton('Settings');
    this.howToPlay = this.createMenuButton('How to play');
    this.game = null;
    this.audio = new Audio;
  }

  addMenuElements() {
    //title and audio
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.classList.add('button-wrapper');
    this.title.textContent = 'Fallout Clone';
    this.title.classList.add('title');
    this.audio.classList.add('audio')
    //add buttons, footer and audio
    buttonsWrapper.append(this.newGameButton);
    buttonsWrapper.append(this.level1Button);
    buttonsWrapper.append(this.level2Button);
    buttonsWrapper.append(this.level3Button);
    buttonsWrapper.append(this.settings);
    buttonsWrapper.append(this.howToPlay);
    this.menu.append(this.title);
    this.menu.append(buttonsWrapper);
    this.menu.append(footer);
    this.menu.append(this.audio);
  }

  createMenuButton(text: string) {
    const button = document.createElement('button');
    button.classList.add('menu-button');
    button.textContent = text;
    return button;
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
    this.newGameButton.addEventListener('click', () => {
      this.hideMenu();
      setDefaultValuesForHero();
      setThingsInStorage();
      setCurrentLevel(level1);
      setCurrentDialogue('dialogue-1');
      setCurrentMode(gameMode);
      this.game = new Phaser.Game(dialogueConfig);
    });
    this.settings.addEventListener('click', () => {
      if (tutorial) {
        tutorial.remove()
      }
      this.menu.append(popUp)
      popUp.appendChild(settings)
    })
    this.howToPlay.addEventListener('click', () => {
      if (settings) {
        settings.remove()
      }
      this.menu.append(popUp)
      popUp.appendChild(tutorial)
    })
  }

  setLevelButtonsListener(currentLevel: level) {
    setCurrentLevel(currentLevel);
    setDefaultValuesForHero();
    setRandomThingsForStorage();
    this.hideMenu();
    setCurrentMode(levelMode);
    this.game = new Phaser.Game(config);
  }

  destroyGame() {
    this.game?.plugins.removeScenePlugin('gridEngine');
    this.game?.destroy(true);
  }

  hideMenu() {
    this.menu.classList.add('hide');
  }

  showMenu() {
    this.menu.classList.remove('hide');
  }

  run() {
    this.addMenuElements();
    this.setButtonsListeners();
  }
}

export default AppView;
