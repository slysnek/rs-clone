export default class Weapon {
  name: string;
  image: string;
  attack: number;
  accuracy: number
  maxRange: number;
  constructor(name: string, image: string, attack: number, accuracy: number, maxRange: number) {
    this.name = name;
    this.image = image;
    this.attack = attack;
    this.accuracy = accuracy;
    this.maxRange = maxRange;
  }
}