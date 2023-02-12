export default class MeleeWeapon {
  name: string;
  image: string;
  attack: number;
  accuracy: number
  constructor(name: string, image: string, attack: number, accuracy: number) {
    this.name = name
    this.image = image
    this.attack = attack
    this.accuracy = accuracy
  }
}