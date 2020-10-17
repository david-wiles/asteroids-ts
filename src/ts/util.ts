export function hasCollision(e1: Bounds, e2: Bounds): boolean {
  let centerX1 = e1.x + e1.width / 2;
  let centerY1 = e1.y + e1.height / 2;
  let radius1 = e1.width > e1.height ? e1.width / 2 : e1.height / 2;

  let centerX2 = e2.x + e2.width / 2;
  let centerY2 = e2.y + e2.height / 2;
  let radius2 = e2.width > e2.height ? e2.width / 2 : e2.height / 2;

  let distance = Math.sqrt(Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2));

  return distance <= (radius1 + radius2);
}

export function generateRandomSpeed(range: number): { x: number, y: number } {
  return {
    x: Math.random() * range * 2 - range,
    y: Math.random() * range * 2 - range
  };
}

export class UserInput {
  forward: boolean = false;
  backward: boolean = false;
  rotateLeft: boolean = false;
  rotateRight: boolean = false;
  fire: boolean = false;
  shield: boolean = false;

  // Sets all button press flags to false
  reset() {
    this.forward = false;
    this.backward = false;
    this.rotateLeft = false;
    this.rotateRight = false;
    this.fire = false;
    this.shield = false;
  }
}

export type Bounds = { x: number, y: number, width: number, height: number };
