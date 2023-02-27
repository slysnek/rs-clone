export const inventoryInfo: { [key: string]: { src: string, quantity: number, description: string } } = {
  armor: {
    src: '../assets/ui-elements/inventory/armor.png',
    quantity: 1,
    description: 'Add 15 health points.',
  },
  bullets: {
    src: '../assets/ui-elements/inventory/bullets.png',
    quantity: 10,
    description: 'Ammo for your pistol. If you don`t have enough ammo you cannot shoot.',
  },
  beer: {
    src: '../assets/ui-elements/inventory/beer.png',
    quantity: 4,
    description: 'Add 3 health points.',
  },
  healPowder: {
    src: '../assets/ui-elements/inventory/healpwdr.png',
    quantity: 3,
    description: 'Add 7 health points.',
  },
  stimulant: {
    src: '../assets/ui-elements/inventory/stimx.png',
    quantity: 2,
    description: 'Add 15 health points.',
  },
  pistol: {
    src: '../assets/ui-elements/inventory/pistol-03.png',
    quantity: 1,
    description: 'Ordinary pistol.',
  },
  pups: {
    src: '../assets/ui-elements/inventory/pups-02.png',
    quantity: 1,
    description: 'Just good luck to survive!',
  },
  dice: {
    src: '../assets/ui-elements/inventory/dice-03.png',
    quantity: 1,
    description: 'It`s seems like you are lucky guy! Click on that thing and your action points will be restored.',
  },
  time: {
    src: '../assets/ui-elements/inventory/time.png',
    quantity: 1,
    description: 'One more week for RS-Clone task)',
  },
  elvis: {
    src: '../assets/ui-elements/inventory/elvis.png',
    quantity: 1,
    description: 'Just Elvis portrait.',
  },
};

export const thingsForRandom = ['armor', 'bullets', 'beer', 'healPowder', 'stimulant', 'pups', 'dice', 'time', 'elvis'];