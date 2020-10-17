import GLOBAL from "../Global";
import {UserInput} from "../util";

/**
 * class Entity contains the basic functionality needed for an entity. Most functions shouldn't be overwritten,
 * except for render and computeNextPosition. render() is called every time draw is called, after the canvas has
 * already been rotated and translated. computeNextPosition() contains a basic implementation of movement, but
 * an entity may have unique needs for each tick.
 */
export default abstract class Entity {
  type: string;

  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  rotation: number = 0;

  rotationRate: number = 0;
  speedX: number = 0;
  speedY: number = 0;

  isPlayer: boolean = false;
  shouldDelete: boolean = false;
  destructSpeedX: number = 0;
  destructSpeedY: number = 0;

  hitPoints: number = 0;

  shieldPoints: number = 0;
  shield: boolean = false;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    let cx = this.x + 0.5 * this.width;
    let cy = this.y + 0.5 * this.height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.translate(-cx, -cy);

    this.render(ctx);

    ctx.restore();
  }

  center(): { x: number, y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    dt *= GLOBAL.worldSpeedMultiplier;
    this.y += this.speedY * dt;
    this.x += this.speedX * dt;
    this.rotation += this.rotationRate;
  }

  render(ctx: CanvasRenderingContext2D) {
    // Draws a white square
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  shieldOn(dt: number) {
    if (this.shieldPoints > 0) {
      this.shield = true;
      this.shieldPoints -= dt;
    } else {
      this.shieldPoints = 0;
    }
  }

  endShield() {
    this.shield = false;
  }

  // Computes position after 'wrapping' the player to the other side of the screen.
  // Also recalculates rotation to keep the angle between 0 and 2pi
  wrapAround() {
    this.x = ((GLOBAL.worldWidth + (2 * GLOBAL.asteroidMaxSize)) + this.x) % (GLOBAL.worldWidth + GLOBAL.asteroidMaxSize) - GLOBAL.asteroidMaxSize;
    this.y = ((GLOBAL.worldHeight + (2 * GLOBAL.asteroidMaxSize)) + this.y) % (GLOBAL.worldHeight + GLOBAL.asteroidMaxSize) - GLOBAL.asteroidMaxSize;
    this.rotation %= (Math.PI) * 2;
  }

  hit(damage: number, destX = 0, destY = 0) {
    this.hitPoints -= damage;
    if (this.hitPoints <= 0) {
      this.shouldDelete = true;
      this.destructSpeedX = destX;
      this.destructSpeedY = destY;
    }
  }
}
