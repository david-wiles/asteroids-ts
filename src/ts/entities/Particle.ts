import Entity from "./Entity";
import {UserInput} from "../util";
import GLOBAL from "../Global";

export default class Particle extends Entity {

  private expirationTime: number;

  constructor(x: number, y: number, speedX: number, speedY: number) {
    super(x, y, 2, 2);
    this.speedX = speedX;
    this.speedY = speedY;
    this.expirationTime = Date.now() + GLOBAL.particleMaxTTL * Math.random();
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    super.computeNextPosition(input, dt, adjacent);
    if (Date.now() > this.expirationTime) this.shouldDelete = true;
  }
}
