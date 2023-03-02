import Phaser from 'phaser';
import { windowSize } from './constants';
import config from './config';
import { options } from './dialogue-states';
import { currentDialogue } from './levels';

export type DialogueKey = keyof typeof options;
type StateKey = keyof typeof options[DialogueKey];

export class Dialogue extends Phaser.Scene {
  currentDialogue: DialogueKey;

  constructor() {
    super('dialogue');
    this.currentDialogue = currentDialogue; //need to change this to change the dialogue
  }

  preload() {
    this.load.html('dialogue', '/assets/html/dialogue.html');
  }

  create() {
    this.createDialogueTemplate(this);
    this.setDialogueState(options[this.currentDialogue]['state-1']);
  }

  createDialogueTemplate(scene: Dialogue) {
    const dialogue = scene.add
      .dom(windowSize.windowWidth / 2, windowSize.windowHeight / 2)
      .createFromCache('dialogue');
    dialogue.scrollFactorX = 0;
    dialogue.scrollFactorY = 0;
  }

  setDialogueState(state: { text: string; answers: string[][] }) {
    this.clearDialogueTexts();
    const text = document.querySelector('.text-container') as HTMLElement;
    const answerContainer = document.querySelector(
      '.answers-list'
    ) as HTMLElement;
    text.textContent = state.text;

    state.answers.forEach((el: string[]) => {
      const answer = document.createElement('li');
      const stateKey = el[1] as StateKey;

      answer.classList.add('answer');
      answer.textContent = el[0];

      if (el[1] === 'state-0') {
        answer.addEventListener('click', () => {
          this.sys.game.destroy(true);
          new Phaser.Game(config);
        });
      }

      answer.addEventListener('click', () => {
        this.setDialogueState(options[this.currentDialogue][stateKey]);
      });
      answerContainer.appendChild(answer);
    });
  }

  clearDialogueTexts() {
    const text = document.querySelector('.text-container') as HTMLElement;
    const answerContainer = document.querySelector(
      '.answers-list'
    ) as HTMLElement;

    text.innerHTML = '';
    answerContainer.innerHTML = '';
  }
}

