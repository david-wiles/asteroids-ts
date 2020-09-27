import World from "./World";
import {Bounds, UserInput} from "./types";
import {Asteroid, Starship} from "./Entities";
import Graphics from "./Graphics";
import GLOBAL from "./Global";

enum GameState {
  Initializing,
  Running,
  Calculating,
  Finished
}

export default class Simulation {
  state: GameState;

  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private userInput: UserInput;

  private world: World;

  private dt: number;
  private canvasView: Bounds;

  constructor(canvas: HTMLCanvasElement) {
    this.state = GameState.Initializing;
    this.userInput = new UserInput();
    this.canvas = canvas;
    this.canvasView = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height
    }
    this.ctx = this.canvas.getContext("2d");

    GLOBAL.worldWidth = canvas.width;
    GLOBAL.worldHeight = canvas.height;

    // Initialize the world using width and height from the canvas
    this.world = new World();
  }

  setUp() {
    this.world.addEntity(new Starship(500, 500));

    this.world.addEntity(new Asteroid(250, 250, 100, 100, 10));
    this.world.addEntity(new Asteroid(750, 250, 100, 100, 10));
    this.world.addEntity(new Asteroid(150, 150, 100, 100, 10));
    this.world.addEntity(new Asteroid(900, 50, 100, 100, 10));
    this.world.addEntity(new Asteroid(700, 50, 100, 100, 10));

  }

  start() {
    this.state = GameState.Running;
    this.dt = Date.now();
    this.gameLoop();
  }

  registerListeners() {
    // Flip bit when user presses a key
    document.onkeydown = (event: KeyboardEvent) => {
      if (event.code === "ArrowUp") {
        this.userInput.forward = true;
      } else if (event.code === "ArrowDown") {
        this.userInput.backward = true;
      } else if (event.code === "ArrowLeft") {
        this.userInput.rotateLeft = true;
      } else if (event.code === "ArrowRight") {
        this.userInput.rotateRight = true;
      } else if (event.code === "KeyF") {
        this.userInput.fire = true;
      } else if (event.code === "KeyS") {
        this.userInput.shield = true;
      }
    };
    // Flip bit on key up, key presses may last for multiple cycles
    document.onkeyup = (event: KeyboardEvent) => {
      if (event.code === "ArrowUp") {
        this.userInput.forward = false;
      } else if (event.code === "ArrowDown") {
        this.userInput.backward = false;
      } else if (event.code === "ArrowLeft") {
        this.userInput.rotateLeft = false;
      } else if (event.code === "ArrowRight") {
        this.userInput.rotateRight = false;
      } else if (event.code === "KeyF") {
        this.userInput.fire = false;
      } else if (event.code === "KeyS") {
        this.userInput.shield = false;
      }
    };
  }

  private gameLoop() {
    if (this.state !== GameState.Finished) {
      let now = Date.now();
      let dt = now - this.dt;
      this.dt = now;

      this.ctx.clearRect(0, 0, GLOBAL.worldWidth, GLOBAL.worldHeight);

      // Draw all entities. Since all entities are always in view, there is no need to search the quadtree
      this.world.entities
        .forEach(entity => entity.draw(this.ctx));

      // Calculate next position
      this.state = GameState.Calculating;
      this.world.nextStep(this.userInput, dt);
      this.state = GameState.Running;

      if (this.world.gameOver) {
        this.state = GameState.Finished;
      }
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
}
