import AppController from "./appController";
import Phaser from 'phaser';
import config from '../game/config';
import { level1, level2, level3, setCurrentLevel } from '../game/levels';

class AppView{
    controller: AppController;
    level1Button: HTMLButtonElement;
    level2Button: HTMLButtonElement;
    level3Button: HTMLButtonElement;
    body: HTMLElement;

    constructor(){
        this.controller = new AppController();
        this.body = document.querySelector('.body') as HTMLElement;
        this.level1Button = document.createElement('button');
        this.level2Button = document.createElement('button');
        this.level3Button = document.createElement('button');
    }

    addLevelButtons(){
        this.level1Button.innerText = 'Level 1';
        this.body.append(this.level1Button);
        this.level2Button.innerText = 'Level 2';
        this.body.append(this.level2Button);
        this.level3Button.innerText = 'Level 3';
        this.body.append(this.level3Button);
    }

    setStartGameButtonListener(){
        this.level1Button.addEventListener('click', () => {
          setCurrentLevel(level1);
          new Phaser.Game(config);
        });
        this.level2Button.addEventListener('click', () => {
          setCurrentLevel(level2);
          new Phaser.Game(config);
      });
        this.level3Button.addEventListener('click', () => {
          setCurrentLevel(level3);
          new Phaser.Game(config);
    })
    }

    run(){
        this.addLevelButtons();
        this.setStartGameButtonListener();
    }
}

export default AppView;