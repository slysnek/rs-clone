export const inventoryInfo: { [key: string]: { src: string, quantity: number, description: string } } = {
  armor: {
    src: '../assets/ui-elements/inventory/armor.png',
    quantity: 1,
    description: 'Pretty sturdy armor. Provides better defense than your standard suit. (add +15 max HP)',
  },
  bullets: {
    src: '../assets/ui-elements/inventory/bullets.png',
    quantity: 10,
    description: '10mm ammo for your pistol. Better use conservatively, it is a rare thing nowadays.',
  },
  beer: {
    src: '../assets/ui-elements/inventory/beer.png',
    quantity: 4,
    description: 'There is nothing better than a beer under the hot sun. (add +3 HP)',
  },
  healPowder: {
    src: '../assets/ui-elements/inventory/healpwdr.png',
    quantity: 3,
    description: 'A small bag with a special herbal mix from a local village. When consumed, gives strength, energy and power. If you want to feel vitalized - eat a small portion. (add +7 HP)',
  },
  stimulant: {
    src: '../assets/ui-elements/inventory/stimx.png',
    quantity: 2,
    description: 'The liquid in this syringe can bring to life even a dead man. Powerful mixture of chemical compounds and hormones heal you wounds at once (add +15 HP)',
  },
  pistol: {
    src: '../assets/ui-elements/inventory/pistol-03.png',
    quantity: 1,
    description: 'A 10mm pistol. It is old and inaccurate, but better than nothing.',
  },
  pups: {
    src: '../assets/ui-elements/inventory/pups-02.png',
    quantity: 1,
    description: 'You could find some ammo here, but instead you picked up Mister Pup. He wishes you to survive! Good luck.',
  },
  dice: {
    src: '../assets/ui-elements/inventory/dice-03.png',
    quantity: 1,
    description: 'May lady Fortune bless me today for I am to shoot evil down this day. (fully restore AP)',
  },
  time: {
    src: '../assets/ui-elements/inventory/time.png',
    quantity: 1,
    description: 'Time is a thing we all lack. Wish we had this item in real life to add some more things to RS-Clone...',
  },
  elvis: {
    src: '../assets/ui-elements/inventory/elvis.png',
    quantity: 1,
    description: 'Just Elvis portrait. Wonder if that\'s radioactive...',
  },
};

export const thingsForRandom = ['armor', 'bullets', 'beer', 'healPowder', 'stimulant', 'pups', 'dice', 'time', 'elvis'];