import { tutorial } from '../components/tutorial'

export const popUp = document.createElement('div');
const cross = document.createElement('div');
popUp.appendChild(cross);
popUp.classList.add('pop-up')
cross.classList.add('cross')
cross.addEventListener('click', () => {
  if(tutorial){
    tutorial.remove()
  }
  popUp.remove()
})