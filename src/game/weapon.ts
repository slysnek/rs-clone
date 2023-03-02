import { randomIntFromInterval } from "./utils";

export default class Weapon {
  name: string;
  image: string;
  attack: number;
  _minAccuracy: number; // percents
  _maxAccuracy: number; // percents
  private _accuracy: number; // percents
  maxRange: number;

  constructor(name: string, image: string, attack: number, _minAccuracy: number, _maxAccuracy: number, maxRange: number) {
    this.name = name;
    this.image = image;
    this.attack = attack;
    this._minAccuracy = _minAccuracy;
    this._maxAccuracy = _maxAccuracy;
    this._accuracy = this.getRandomAccuracy;
    this.maxRange = maxRange;
  }

  public get accuracy(): number {
    return this._accuracy;
  }
  public get getRandomAccuracy(): number {
    this._accuracy = randomIntFromInterval(this._minAccuracy, this._maxAccuracy);
    return this._accuracy;
  }

}