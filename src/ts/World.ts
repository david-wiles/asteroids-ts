/**
 * class World
 * Keeps track of all entities in the world and their interactions
 */
import {Entity} from "./Entities";
import {Bounds, UserInput} from "./common/types";
import QuadTree from "./common/QuadTree";

export default class World {
  gameOver: boolean;

  private player: Entity;
  private quadtree: QuadTree;
  private entities: Entity[] = [];

  constructor(width: number, height: number) {
    this.quadtree = new QuadTree({
      x: 0,
      y: 0,
      width: width,
      height: height
    });
  }

  // Adds an entity to the quadTree
  addEntity(entity: Entity) {
    if (entity.isPlayer) {
      this.player = entity;
    }

    this.entities.push(entity);
    this.quadtree.addEntity(entity);
  }

  // Returns a list of all entities currently in view
  entitiesInView(bounds: Bounds): Entity[] {
    return this.quadtree.searchAdjacent(bounds);
  }

  nextStep(input: UserInput, dt: number) {
    this.entities.forEach((entity) => {
      entity.computeNextPosition(input, dt, this.quadtree.searchAdjacent(entity));
    });
  }
}
