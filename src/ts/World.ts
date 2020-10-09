/**
 * class World
 * Keeps track of all entities in the world and their interactions
 */
import {Asteroid, Entity, Projectile} from "./Entities";
import {Bounds, UserInput} from "./types";
import QuadTree from "./QuadTree";
import GLOBAL from "./Global";

export default class World {
  gameOver: boolean = false;
  entities: Entity[] = [];

  private canvasView: Bounds;
  private player: Entity = null;
  private quadtree: QuadTree = null;

  private lastFire: number = 100;

  constructor() {
    this.canvasView = {
      x: 0,
      y: 0,
      width: GLOBAL.worldWidth,
      height: GLOBAL.worldHeight
    };
  }

  // Adds an entity to the quadTree
  addEntity(entity: Entity) {
    if (entity.isPlayer) {
      this.player = entity;
    }

    this.entities.push(entity);
  }

  // Returns a list of all entities currently in view
  entitiesInView(bounds: Bounds): Entity[] {
    return this.quadtree.searchAdjacent(bounds);
  }

  nextStep(input: UserInput, dt: number) {
    // Create projectiles if user pressed fire
    this.quadtree = this.initQuadTree();
    let now = Date.now();

    if (input.fire && now - this.lastFire > 100) {
      // TODO include player's velocity in calculation
      this.lastFire = now;
      let dx = (Math.sin(this.player.rotation) * 15) + this.player.speedX;
      let dy = (Math.cos(this.player.rotation) * -15) + this.player.speedY;
      this.addEntity(new Projectile(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        dx,
        dy
      ));
    }

    if (input.shield) {
      this.player.shieldOn(dt);
    } else if (this.player.shield) {
      this.player.endShield();
    }

    this.entities.forEach((entity) => {
      entity.computeNextPosition(input, dt, this.quadtree.searchAdjacent(entity));
      if (entity.shouldDelete) {
        if (entity.type === "Asteroid" && entity.width * entity.height > 1000) {
          this.addEntity(spawnAsteroid(entity));
          this.addEntity(spawnAsteroid(entity));
          this.addEntity(spawnAsteroid(entity));
        }
        // TODO optimize
        this.entities = this.entities.filter(e => entity !== e);
      }
      entity.wrapAround();
    });
  }

  private initQuadTree(): QuadTree {
    let qt = new QuadTree(this.canvasView);
    qt.addEntity(...this.entities);
    return qt;
  }
}

const spawnAsteroid = (entity: Entity): Entity => {
  return new Asteroid(entity.x, entity.y, entity.width / 2, entity.height / 2, entity.hitPoints / 2)
}
