import World from "./World";
import {Bounds, UserInput} from "./types";
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
  private level = 1;
  private lives = 3;

  private dt: number;
  private canvasView: Bounds;
  private gameOver = false;

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
    Simulation.displayLevel(1);
  }

  setUp() {
    this.world.resetPlayer();
    this.world.initLevel(2);
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

  private resetPlayer() {
    this.lives -= 1;

    if (this.lives <= 0) {
      this.gameOver = true;
    } else {
      this.world.resetPlayer();
    }
  }

  private static displayLevel(level: number) {
    let levelText = document.querySelector(".level")
    levelText.innerHTML = "Level " + level;
    levelText.classList.toggle("hidden");

    setTimeout(() => {
      levelText.classList.toggle("hidden");
    }, 1000);
  }

  private gameLoop() {
    if (this.gameOver) {
      let gameMessage = document.querySelector(".game-over");
      if (gameMessage.classList.contains("hidden")) {
        gameMessage.classList.remove("hidden");
      }
    }

    let now = Date.now();
    let dt = now - this.dt;
    this.dt = now;

    this.ctx.clearRect(0, 0, GLOBAL.worldWidth, GLOBAL.worldHeight);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, GLOBAL.worldWidth, GLOBAL.worldHeight);

    // Draw all entities. Since all entities are always in view, there is no need to search the quadtree
    this.world.entities.forEach(entity => entity.draw(this.ctx));

    // Calculate next position
    this.state = GameState.Calculating;
    this.world.nextStep(this.userInput, dt);
    this.state = GameState.Running;

    if (this.gameOver) {

      this.state = GameState.Finished;

    } else if (this.world.levelOver) {

      this.level += 1;
      this.world.initLevel(this.level);
      Simulation.displayLevel(this.level);

    } else if (this.world.playerDead && !this.gameOver) {
      this.resetPlayer();
      document.querySelector(".lives .value").innerHTML = String(this.lives);
      document.querySelector(".shield .value").innerHTML = "1000";
    }

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
