/**
 * class World
 * Keeps track of all entities in the world and their interactions
 */
import Entity from "./entities/Entity";
import QuadTree from "./QuadTree";
import GLOBAL from "./Global";
import {Bounds, hasCollision, UserInput} from "./util";
import Projectile from "./entities/Projectile";
import Starship from "./entities/Starship";
import Particle from "./entities/Particle";
import Asteroid from "./entities/Asteroid";

export default class World {
  levelOver: boolean = false;
  playerDead: boolean = false;

  entities: Entity[] = [];

  private canvasView: Bounds;
  private player: Entity = null;
  private quadtree: QuadTree = null;

  private lastFire: number = GLOBAL.starshipFireDelay;

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

    if (this.player) {
      this.usePlayerInput(input, dt);
    }

    this.entities.forEach((entity) => {
      entity.computeNextPosition(input, dt, this.quadtree.searchAdjacent(entity));
      if (entity.shouldDelete) {
        this.removeEntity(entity)
      }
      entity.wrapAround();
    });

    if (this.entities.length === 1) {
      this.levelOver = true;
    }
  }

  // Set up the world for a new level
  initLevel(numAsteroids: number) {
    this.levelOver = false;
    let qt = new QuadTree(this.canvasView);
    for (let i = 0; i < numAsteroids; i++) {
      let asteroid = new Asteroid(Math.random() * GLOBAL.worldWidth, Math.random() * GLOBAL.worldHeight, GLOBAL.asteroidMaxSize, GLOBAL.asteroidMaxSize, GLOBAL.asteroidMaxHitPoints);
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
    this.playerDead = false;

    // Wait a second to create the new starship
    setTimeout(this.initPlayer.bind(this), 1000);
  }

  // Sets up the player's entity and ensures there are no collisions between asteroids
  initPlayer() {
    this.player = new Starship(GLOBAL.worldWidth / 2, GLOBAL.worldHeight / 2);
    this.player.isPlayer = true;
    this.addEntity(this.player);

    let qt = new QuadTree(this.canvasView);
    qt.addEntity(...this.entities);
    qt.searchAdjacent(this.player).forEach((entity) => {
      while (this.player !== entity && hasCollision(this.player, entity)) {
        this.player.x += entity.width / 2;
        this.player.y += entity.height / 2;
      }
    });
  }

  private usePlayerInput(input: UserInput, dt: number) {
    let now = Date.now();

    if (input.fire && now - this.lastFire > GLOBAL.starshipFireDelay && !this.playerDead) {
      this.lastFire = now;
      let dx = (Math.sin(this.player.rotation) * GLOBAL.projectileSpeedMultiplier) + this.player.speedX;
      let dy = (Math.cos(this.player.rotation) * -GLOBAL.projectileSpeedMultiplier) + this.player.speedY;
      this.addEntity(new Projectile(
        (this.player.x + this.player.width / 2) - 5 + 2.5,
        (this.player.y + this.player.height / 2) + 2.5,
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
  }

  private removeEntity(entity: Entity) {
    if (entity.type === "Asteroid") {
      if (entity.width * entity.height > GLOBAL.asteroidMinArea) {
        this.addEntities(spawnAsteroid(entity), spawnAsteroid(entity), spawnAsteroid(entity));
      }
      this.addEntities(...generateParticles(entity));
    } else if (entity === this.player) {
      this.playerDead = true;
      this.player = undefined;
      this.addEntities(...generateParticles(entity));
    }
    // TODO optimize
    this.entities = this.entities.filter(e => entity !== e);
  }

  private initQuadTree(): QuadTree {
    let qt = new QuadTree(this.canvasView);
    qt.addEntity(...this.entities);
    return qt;
  }
}

// Create a new asteroid from an existing entity
const spawnAsteroid = (entity: Entity): Entity => {
  let asteroid = new Asteroid(entity.x, entity.y, entity.width / 2, entity.height / 2, entity.hitPoints / 2)
  asteroid.speedX += entity.speedX + entity.destructSpeedX;
  asteroid.speedY += entity.speedY + entity.destructSpeedY;
  return asteroid;
};

// Create a new particle from an entity
const spawnParticle = (entity: Entity): Entity => {
  let center = entity.center();
  return new Particle(
    center.x + (Math.random() * entity.width) - entity.width / 2,
    center.y + (Math.random() * entity.height) - entity.height / 2,
    entity.speedX + (Math.random() * entity.destructSpeedX * 2),
    entity.speedY + (Math.random() * entity.destructSpeedY * 2)
  );
};

// Create 20 new particles
const generateParticles = (entity: Entity): Entity[] => {
  return [
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity),
    spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity), spawnParticle(entity)
  ];
};
