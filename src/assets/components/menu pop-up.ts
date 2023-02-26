import { tutorial } from './tutorial'
import { settings } from './settings';

export const popUp = document.createElement('div');
const cross = document.createElement('div');
popUp.appendChild(cross);
popUp.classList.add('pop-up')
cross.classList.add('cross')
cross.addEventListener('click', () => {
  if (tutorial) {
    tutorial.remove()
  }
  if (settings) {
    settings.remove()
  }
  popUp.remove()
})