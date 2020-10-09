import {Bounds, UserInput} from "./types";
import GLOBAL from "./Global";

export abstract class Entity {
  type: string;

  x: number
  y: number
  width: number
  height: number
  rotation: number = 0;

  rotationRate: number;
  speedX: number;
  speedY: number;

  isPlayer: boolean;
  shouldDelete: boolean = false;

  hitPoints: number;

  shieldPoints: number;
  shield: boolean;

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

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {}
  render(ctx: CanvasRenderingContext2D) {}
  shieldOn(dt: number) {}
  endShield() {}

  // Computes position after 'wrapping' the player to the other side of the screen.
  // Also recalculates rotation to keep the angle between 0 and 2pi
  wrapAround() {
    this.x = (GLOBAL.worldWidth + this.x) % GLOBAL.worldWidth;
    this.y = (GLOBAL.worldHeight + this.y) % GLOBAL.worldHeight;
    this.rotation %= (Math.PI) * 2;
  }

  hit(damage: number) {
    this.hitPoints -= damage;
    if (this.hitPoints <= 0) {
      this.shouldDelete = true;
    }
  }
}

export class Starship extends Entity {
  type = "Starship";

  height: number;
  width: number;
  x: number;
  y: number;
  rotation: number;

  rotationRate: number = 0;
  speedX: number = 0;
  speedY: number = 0;

  isPlayer: boolean;
  shouldDelete: boolean = false;

  hitPoints = 20;

  shieldPoints = 5000;
  shield = false;

  constructor(x: number, y: number) {
    super(x, y, 30, 50);
    this.isPlayer = true;
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    // DEBUG
    dt *= 0.1;

    if (input.forward) this.increaseSpeed(dt);
    if (input.backward) this.decreaseSpeed(dt);
    if (input.rotateRight) this.rotation += dt * 0.05;
    if (input.rotateLeft) this.rotation -= dt * 0.05;

    this.x += this.speedX;
    this.y += this.speedY;

    adjacent.forEach((entity) => {
      let bounds = this.shield ? { x: this.x - 35, y: this.y - 25, width: 100, height: 100 } : this;
      if (entity.type === "Asteroid" && hasCollision(bounds, entity)) {
        entity.shouldDelete = true;
        this.hit(10);
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
      ctx.strokeStyle = "blue";
      ctx.stroke();
    }
  }

  hit(damage: number) {
    if (!this.shield) {
      super.hit(damage);
      document.querySelector(".hp > .value").textContent = this.hitPoints.toString();
    }
  }

  shieldOn(dt: number) {
    if (this.shieldPoints > 0) {
      this.shield = true;
      this.shieldPoints -= dt;
    } else {
      this.shieldPoints = 0;
    }
    document.querySelector(".shield > .value").textContent = this.shieldPoints.toString();
  }

  endShield() {
    this.shield = false;
  }

  private increaseSpeed(dt: number) {
    dt *= 0.1;
    this.speedX += Math.sin(this.rotation) * dt;
    this.speedY -= Math.cos(this.rotation) * dt;
  }

  private decreaseSpeed(dt: number) {
    dt *= 0.1;
    this.speedX -= Math.sin(this.rotation) * dt;
    this.speedY += Math.cos(this.rotation) * dt;
  }
}

export class Asteroid extends Entity {
  type = "Asteroid";

  height: number;
  width: number;
  x: number;
  y: number;
  rotation: number = 0.05;

  rotationRate = 0.05;
  speedX: number;
  speedY: number;

  isPlayer: boolean = false;
  shouldDelete: boolean = false;

  hitPoints: number;

  constructor(x: number, y: number, width: number, height: number, hitPoints: number) {
    super(x, y, width, height);
    this.isPlayer = false;
    this.hitPoints = hitPoints;

    // Create a random speed based on the size of the asteroid
    this.generateRandomSpeed(5 / Math.log10(height * width));
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    dt *= 0.1;
    this.y += this.speedY * dt;
    this.x += this.speedX * dt;
    this.rotation += this.rotationRate;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  private generateRandomSpeed(range: number) {
    this.speedX = Math.random() * range * 2 - range;
    this.speedY = Math.random() * range * 2 - range;
  }
}

export class Projectile extends Entity {
  type = "Projectile";

  height: number;
  width: number;
  x: number;
  y: number;
  rotation: number;

  rotationRate: number;
  speedX: number;
  speedY: number;

  isPlayer: boolean = false;
  shouldDelete: boolean = false;

  hitPoints = 1;

  // Determines when the projectile should be deleted
  private expirationTime: number;

  private damage = 5;

  constructor(x: number, y: number, speedX: number, speedY: number) {
    super(x, y, 5, 5);
    this.speedX = speedX;
    this.speedY = speedY;
    this.expirationTime = Date.now() + 500;
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    this.x += this.speedX * dt * 0.1;
    this.y += this.speedY * dt * 0.1;
    if (Date.now() > this.expirationTime) this.shouldDelete = true;

    adjacent.forEach((entity) => {
      if (entity.type === "Asteroid" && hasCollision(this, entity)) {
        this.shouldDelete = true;
        entity.hit(this.damage);
      }
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height);
  }
}

const hasCollision = (e1: Bounds, e2: Bounds): boolean => {
  // TODO real collision detection. This just finds the center and 'radius' for both objects and compares
  let centerX1 = e1.x + e1.width / 2;
  let centerY1 = e1.y + e1.height / 2;
  let radius1 = e1.width > e1.height ? e1.width / 2 : e1.height / 2;

  let centerX2 = e2.x + e2.width / 2;
  let centerY2 = e2.y + e2.height / 2;
  let radius2 = e2.width > e2.height ? e2.width / 2 : e2.height / 2;

  let distance = Math.sqrt(Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2));

  return distance <= (radius1 + radius2);
}
