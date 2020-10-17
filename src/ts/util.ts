import {Bounds} from "./types";

export function hasCollision(e1: Bounds, e2: Bounds): boolean {
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
