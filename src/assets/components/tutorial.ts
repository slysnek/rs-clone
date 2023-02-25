export const tutorial = document.createElement('div');
tutorial.classList.add('tutorial-wrapper');

const greeting = document.createElement('p');
const finalMessage = document.createElement('p');
const mainList = document.createElement('ol');

mainList.classList.add('main-list')

greeting.textContent =
  'Welcome to Fallout clone! Here are some basic things that you should know before starting playing:';
finalMessage.textContent =
  'That is pretty much all basic stuff you need to know in order to successfully complete the game. Good luck and have fun!';

const mainListItems = ['Main menu', 'Dialogues', 'Combat System'];
const secondaryListItems = [
  [
    'New Game – launch a full game which consists of 3 levels with dialogues between them.',
    'Level 1, 2, 3 – launch a separate level without dialogues. Go straight to fight!',
  ],
  [
    'While answering, you can choose between different options in the dialogue menu. Some answer variants will provide you with more information before starting the mission. Don’t worry, you cannot fail the dialogue as it was in the original series, so if you want to choose rude options to answer – be evil :^)',
  ],
  [
    'When you arrive at the mission you can walk around in real time. Turn-based combat begins after you come up to the enemy close.',
    'You can walk either by clicking the tile you want to go to or by clicking your keyboard arrows.',
    'In turn-based system you have 10 action points(AP). You spend them by walking, shooting and punching your enemies. Some actions require more AP than others.',
    'To punch the enemy you should stand near him and click the TILE on which the enemy stands. Warning: you can punch only in 4 directions.',
    'To shoot the enemy they should be in your line of sight in one of 4 directions and they shouldn’t be farther than your weapon’s max shoot distance. To shoot click the TILE on which the enemy stands. Warning: you can shoot only in 4 directions.',
    'After you defeat all enemies you return to the real time walking. You can spend some time exploring the map or/and click on “Next Level” button to proceed to the dialogue if you chose the ‘New game’ or return to the main menu if you chose one of the levels.',
  ],
];

for (let i = 0; i < mainListItems.length; i++) {
  const mainListItem = document.createElement('li');
  mainListItem.textContent = mainListItems[i];
  mainListItem.classList.add('main-list-item')
  const secondaryList = document.createElement('ul');
  for (let j = 0; j < secondaryListItems[i].length; j++) {
    const secondaryListItem = document.createElement('li');
    secondaryListItem.textContent = secondaryListItems[i][j];
    secondaryList.appendChild(secondaryListItem);
  }
  mainList.appendChild(mainListItem);
  mainList.appendChild(secondaryList);
}

tutorial.appendChild(greeting);
tutorial.appendChild(mainList);
tutorial.appendChild(finalMessage);
