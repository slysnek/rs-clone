import AppController from "./appController";
import AppModel from "./appModel";
import Phaser from 'phaser';
import config from '../game/game';

class AppView{
    controller: AppController;
    view: AppModel;
    startGameButton: HTMLButtonElement;
    body: HTMLElement;

    constructor(){
        this.controller = new AppController();
        this.view = new AppModel();
        this.body = document.querySelector('.body') as HTMLElement;
        this.startGameButton = document.createElement('button');
    }

    addStartGameButton(){
        this.startGameButton.innerText = 'Start game';
        this.body.append(this.startGameButton);
    }

    setStartGameButtonListener(){
        this.startGameButton.addEventListener('click', () => {
            new Phaser.Game(config);
        })
    }

    run(){
        this.addStartGameButton();
        this.setStartGameButtonListener();
    }
}

export default AppView;