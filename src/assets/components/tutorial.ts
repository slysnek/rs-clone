export const tutorial = document.createElement('div');
tutorial.classList.add('tutorial-wrapper');

const greeting = document.createElement('p');
const finalMessage = document.createElement('p');
const mainList = document.createElement('ol');

mainList.classList.add('main-list')

greeting.textContent =
  'Welcome to Fallout clone! Here are some things that you should know before starting playing:';
finalMessage.textContent =
  'That is pretty much all stuff you need to know in order to successfully complete the game. Good luck and have fun!';

const mainListItems = ['Main menu', 'Dialogues', 'Combat System', 'Weapons', 'Inventory and Items'];
const secondaryListItems = [
  [
    'New Game – launch a full game which consists of 3 levels with dialogues between them.',
    'Level 1, 2, 3 – launch a separate level without dialogues. Go straight to fight!',
    'Settings – turn on/off the music and change the volume.',
    'How to play - the tutorial you reading right now.'
  ],
  [
    'While answering, you can choose between different options in the dialogue menu. Don’t worry, you cannot fail the dialogue as it was in the original series, so if you want to be evil – you can :^)',
    'Some answer variants will provide you with more information before starting the mission so won’t hesitate to ask questions.'
  ],
  [
    'When you arrive at the mission you can walk around in real time. Turn-based combat begins after you come up close to the enemy.',
    'You can walk either by clicking the tile you want to go to or by pressing your keyboard arrows.',
    'In turn-based system you have 10 action points(AP). You can see them at the bottom UI panel (green lamps). You spend them by walking, shooting and punching your enemies. Some actions require more AP than others. After you use all your AP the enemies’ turn begins.',
    'The console at the bottom UI panel will display useful messages describing particular moments during the battle, for example how much damage you inflicted to the enemy.',
    'You can see your health points (HP) at the bottom UI panel. Be careful, when you take enough damage – you will die! You can replenish your health by consuming special items described below.',
    'After you defeat all enemies you return to the real time walking. You can spend some time exploring the map or/and click at the UI panel on “Next Level” button to proceed to the next dialogue before a mission if you chose the ‘New game’ or return to the main menu if you chose one of the levels.',
  ],
  [
    'To punch the enemy you should stand near him and click the TILE on which the enemy stands. Warning: you can punch only in 4 directions.',
    'To change the weapon, you can click on green icon near your weapon at the bottom UI panel.',
    'To shoot the enemy they should be in your line of sight in one of 4 directions and they shouldn’t be farther than your weapon’s max shoot distance. To shoot click the TILE on which the enemy stands. Warning: you can shoot only in 4 directions.',
    'To shoot your weapons you need ammo. In this apocalyptic world ammo is scarce so shoot carefully. On the other side, punching the enemy is always free but they can kill you easier.',
    'Weapons have different stats(damage, accuracy, etc.). Consider this when you approach the enemy.'
  ],
  [
    'When you arrive at the mission at the bottom UI panel you can find INV button. Click on it to open your inventory. Click ‘Done’ to close it.',
    'Your inventory can keep different useful items such as healing powder, stimulants, ammo, etc. Use them to your advantage.',
    'On levels you can find some hidden containers that have valuable loot. You can try to find them before the battle to increase your chances of survivability or after the battle when everything is settled down. The items that you find are saved in your inventory between levels in full game.',
  ]

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
