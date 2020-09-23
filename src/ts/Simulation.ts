import World from "./World";
import {Bounds, UserInput} from "./common/types";
import {Starship} from "./Entities";
import Graphics from "./Graphics";

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

    // Initialize the world using width and height from the canvas
    this.world = new World(canvas.width, canvas.height);
    // this.graphics = new Graphics(canvas.getContext("2d"));
  }

  setUp() {
    this.world.addEntity(new Starship(500, 500, true));
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

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw all entities
      this.world.entitiesInView(this.canvasView)
        .forEach(entity => entity.draw(this.ctx, dt));

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
