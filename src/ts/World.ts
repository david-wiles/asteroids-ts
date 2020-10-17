/**
 * class World
 * Keeps track of all entities in the world and their interactions
 */
import {Asteroid, Entity, Particle, Projectile, Starship} from "./Entities";
import {Bounds, UserInput} from "./types";
import QuadTree from "./QuadTree";
import GLOBAL from "./Global";
import {hasCollision} from "./util";

export default class World {
  levelOver: boolean = false;
  playerDead: boolean = false;

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

  // Adds a list of entities to the world. This list can't contain the player
  addEntities(...entities: Entity[]) {
    this.entities.push(...entities);
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
        (this.player.x + this.player.width / 2) - 5,
        (this.player.y + this.player.height / 2),
        dx,
        dy,
        this.player.rotation
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
        if (entity.type === "Asteroid") {
          if (entity.width * entity.height > 1000) {
            this.addEntities(
              spawnAsteroid(entity),
              spawnAsteroid(entity),
              spawnAsteroid(entity)
            );
          } else {
            this.addEntities(...generateParticles(entity));
          }
        } else if (entity === this.player) {
          this.playerDead = true;
          this.addEntities(...generateParticles(entity));
        }
        // TODO optimize
        this.entities = this.entities.filter(e => entity !== e);
      }
      entity.wrapAround();
    });

    // Check if the player has destroyed all asteroids in a level
    if (this.entities.length === 1) {
      this.levelOver = true;
    }
  }

  initLevel(numAsteroids: number) {
    this.levelOver = false;
    let qt = new QuadTree(this.canvasView);
    for (let i = 0; i < numAsteroids; i++) {
      let asteroid = new Asteroid(Math.random() * GLOBAL.worldWidth, Math.random() * GLOBAL.worldHeight, 100, 100, 10);
      this.addEntity(asteroid);
      qt.addEntity(asteroid);
    }

    qt.searchAdjacent(this.player).forEach((entity) => {
      while (hasCollision(this.player, entity)) {
        entity.x += entity.width / 2;
        entity.y += entity.height / 2;
      }
    });
  }

  resetPlayer() {
    this.player = new Starship(GLOBAL.worldWidth / 2, GLOBAL.worldHeight / 2);
    this.addEntity(this.player);

    let qt = new QuadTree(this.canvasView);
    qt.addEntity(...this.entities);
    qt.searchAdjacent(this.player).forEach((entity) => {
      while (this.player !== entity && hasCollision(this.player, entity)) {
        this.player.x += entity.width / 2;
        this.player.y += entity.height / 2;
      }
    });

    this.playerDead = false;
  }

  private initQuadTree(): QuadTree {
    let qt = new QuadTree(this.canvasView);
    qt.addEntity(...this.entities);
    return qt;
  }
}

const spawnAsteroid = (entity: Entity): Entity => {
  let asteroid = new Asteroid(entity.x, entity.y, entity.width / 2, entity.height / 2, entity.hitPoints / 2)
  asteroid.speedX += entity.speedX + entity.destructSpeedX;
  asteroid.speedY += entity.speedY + entity.destructSpeedY;
  return asteroid;
};

const spawnParticle = (entity: Entity): Entity => {
  let center = entity.center();
  return new Particle(
    center.x + (Math.random() * entity.width) - entity.width / 2,
    center.y + (Math.random() * entity.height) - entity.height / 2,
    entity.speedX + (Math.random() * entity.destructSpeedX),
    entity.speedY + (Math.random() * entity.destructSpeedY)
  );
};

const generateParticles = (entity: Entity): Entity[] => {
  return [
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity)
  ];
};
