import Entity from "./Entity";
import {UserInput} from "../util";
import GLOBAL from "../Global";

export default class Projectile extends Entity {
  type = "Projectile";

  // Determines when the projectile should be deleted
  private expirationTime: number;
  private lastPosition: { x: number, y: number };

  private damage = GLOBAL.projectileDamage;

  constructor(x: number, y: number, speedX: number, speedY: number, angle: number) {
    super(x, y, 5, 5);
    this.speedX = speedX;
    this.speedY = speedY;
    this.rotation = angle;
    this.expirationTime = Date.now() + GLOBAL.projectileTTL;
  }

  computeNextPosition(input: UserInput, dt: number, adjacent: Entity[]) {
    this.lastPosition = {
      x: this.x,
      y: this.y
    };

    super.computeNextPosition(input, dt, adjacent);

    if (Date.now() > this.expirationTime) this.shouldDelete = true;

    adjacent.forEach((entity) => {
      if (entity.type === "Asteroid" && this.intersectsObject(entity)) {
        this.shouldDelete = true;
        entity.hit(this.damage, this.speedX * GLOBAL.asteroidDamageSpeedMultiplier, this.speedY * GLOBAL.asteroidDamageSpeedMultiplier);
      }
    });
  }

  // Creates a line between the last position and current position to determine if the projectile
  // intersected the object. This assumes the velocity of the projectile is much greater than that of
  // the object. https://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter
  private intersectsObject(entity: Entity): boolean {
    let radius = entity.width / 2;
    let center = entity.center();
    let ax = this.x - center.x;
    let ay = this.y - center.y;
    let bx = this.lastPosition.x - center.x;
    let by = this.lastPosition.y - center.y;

    let a = Math.pow(bx - ax, 2) + Math.pow(by - ay, 2);
    let b = 2 * (ax * (bx - ax) + ay * (by - ay));
    let c = Math.pow(ax, 2) + Math.pow(ay, 2) - Math.pow(radius, 2);
    let disc = Math.pow(b, 2) - 4 * a * c;

    if (disc <= 0) return false;

    let sqrtDisc = Math.sqrt(disc);
    let t1 = (-b + sqrtDisc) / (2 * a);
    let t2 = (-b - sqrtDisc) / (2 * a);

    return (0 < t1 && t1 < 1) || (0 < t2 && t2 < 1);
  }
}
