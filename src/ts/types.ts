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
