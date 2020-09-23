import {UserInput} from "./common/types";

export interface Entity {
  x: number
  y: number
  width: number
  height: number
  rotation: number;

  isPlayer: boolean

  draw(ctx: CanvasRenderingContext2D, dt: number)
  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[])
}

export class Starship implements Entity {
  height: number = 10;
  width: number = 10;
  x: number;
  y: number;
  rotation: number;

  isPlayer: boolean;

  constructor(x: number, y: number, isPlayer = false) {
    this.x = x;
    this.y = y;
    this.isPlayer = isPlayer;
  }

  draw(ctx: CanvasRenderingContext2D, dt: number) {
    ctx.save();
    ctx.rotate(this.rotation);
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    // DEBUG
    if (input.forward) this.y -= dt;
    if (input.backward) this.y += dt;
    if (input.rotateRight) this.x += dt;
    if (input.rotateLeft) this.x -= dt;
  }
}

export class Asteroid implements Entity {
  height: number;
  width: number;
  x: number;
  y: number;
  rotation: number;

  isPlayer: boolean = false;

  draw(ctx: CanvasRenderingContext2D) {

  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {}

}

export class Projectile implements Entity {
  height: number;
  width: number;
  x: number;
  y: number;
  rotation: number;

  isPlayer: boolean = false;

  draw(ctx: CanvasRenderingContext2D) {

  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {}

}
