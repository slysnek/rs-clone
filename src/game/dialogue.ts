import Phaser, { Tilemaps } from 'phaser';
import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { windowSize } from './constants'
import config from './config'
import Button from 'phaser3-rex-plugins/plugins/button';
import Buttons from 'phaser3-rex-plugins/templates/ui/buttons/Buttons';
import { GameObject } from 'grid-engine/dist/GridCharacter/GridCharacter';
import {options} from './dialogue-options'

class Dialogue extends Phaser.Scene {
  rexUI: RexUIPlugin;

  constructor(rexUI: RexUIPlugin) {
    super('dialogue')
    this.rexUI = rexUI;
  }

  preload() {
    this.load.image('background', '../assets/dialogue_assets/dialogue-background.png')
    this.load.html('dialogue', '/assets/html/dialogue.html');
  }

  create(){
    this.createDialogueTemplate(this)
    this.setDialogueState(options['dialogue-1']['state-1'])
  }

  createDialogueTemplate(scene: Dialogue) {
    const dialogue = scene.add.dom(windowSize.windowWidth / 2, windowSize.windowHeight / 2).createFromCache('dialogue')
    dialogue.scrollFactorX = 0;
    dialogue.scrollFactorY = 0;
  }

  setDialogueState(state: { text: string; answers: string[][] }){
    this.clearDialogueTexts();
    const text = document.querySelector('.text-container') as HTMLElement;
    const answerContainer = document.querySelector('.answers-list') as HTMLElement;
    text.textContent = state.text!;

    state.answers.forEach((el: string[]) => {
      console.log(el, 'answer');
      const answer = document.createElement('li');
      type ObjectKey = keyof typeof options['dialogue-1'];
      const objKey = el[1] as ObjectKey;
      console.log(objKey);
      answer.classList.add('answer')
      answer.textContent = el[0];
      answer.addEventListener('click', () =>{
        this.setDialogueState(options['dialogue-1'][objKey])
      })
      answerContainer.appendChild(answer)
    })
  }

  clearDialogueTexts(){
    const text = document.querySelector('.text-container') as HTMLElement;
    const answerContainer = document.querySelector('.answers-list') as HTMLElement;

    text.innerHTML = '';
    answerContainer.innerHTML = '';
  }


}

export default Dialogue;
