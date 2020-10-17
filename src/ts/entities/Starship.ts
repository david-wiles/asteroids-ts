import {hasCollision, UserInput} from "../util";
import Entity from "./Entity";
import GLOBAL from "../Global";

export default class Starship extends Entity {
  type = "Starship";

  hitPoints = 1;
  shieldPoints = GLOBAL.starshipShieldPoints;

  constructor(x: number, y: number) {
    super(x, y, 30, 50);
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    // DEBUG
    dt *= GLOBAL.worldSpeedMultiplier;

    if (input.forward) this.increaseSpeed(dt);
    if (input.backward) this.decreaseSpeed(dt);
    if (input.rotateRight) this.rotation += dt * 0.03;
    if (input.rotateLeft) this.rotation -= dt * 0.03;

    this.x += this.speedX;
    this.y += this.speedY;

    adjacent.forEach((entity) => {
      let bounds = this.shield ? {x: this.x - 35, y: this.y - 25, width: 100, height: 100} : this;
      if (entity.type === "Asteroid" && hasCollision(bounds, entity)) {
        entity.shouldDelete = true;
        entity.hit(10, this.speedX * GLOBAL.starshipDamageSpeedMultiplier, this.speedY * GLOBAL.starshipDamageSpeedMultiplier);
        this.hit(10, entity.speedX, entity.speedY);
      }
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.fill();

    if (this.shield) {
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 50, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(66, 216, 239, 1)";
      ctx.stroke();
    }
  }

  hit(damage: number, destX: number, destY: number) {
    if (!this.shield) {
      super.hit(damage, destX, destY);
    }
  }

  shieldOn(dt: number) {
    super.shieldOn(dt);
    document.querySelector(".shield > .value").textContent = this.shieldPoints.toString();
  }

  private increaseSpeed(dt: number) {
    dt *= GLOBAL.worldSpeedMultiplier;
    this.speedX += Math.sin(this.rotation) * dt;
    this.speedY -= Math.cos(this.rotation) * dt;
  }

  private decreaseSpeed(dt: number) {
    dt *= GLOBAL.worldSpeedMultiplier;
    this.speedX -= Math.sin(this.rotation) * dt;
    this.speedY += Math.cos(this.rotation) * dt;
  }
}
