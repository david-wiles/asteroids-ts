import World from "./World";
import GLOBAL from "./Global";
import {Bounds, UserInput} from "./util";

/**
 * class Simulation mainly serves as an entry point for the game loop and tracking of the state of the game
 */
export default class Simulation {

  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private userInput: UserInput;

  // Game state variables
  private world: World;
  private level = 1;
  private lives = 3;
  private gameOver = false;

  // dt is the amount of time passed between ticks
  private dt: number;
  private canvasView: Bounds;

  constructor(canvas: HTMLCanvasElement) {
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
    this.world.initPlayer();
    this.world.initLevel(2);
  }

  start() {
    this.dt = Date.now();
    this.gameLoop();
  }

  registerListeners() {
    // Flip bit when user presses a key
    document.onkeydown = (event: KeyboardEvent) => {
      if (event.code === GLOBAL.arrowUp) {
        this.userInput.forward = true;
      } else if (event.code === GLOBAL.arrowDown) {
        this.userInput.backward = true;
      } else if (event.code === GLOBAL.arrowLeft) {
        this.userInput.rotateLeft = true;
      } else if (event.code === GLOBAL.arrowRight) {
        this.userInput.rotateRight = true;
      } else if (event.code === GLOBAL.keyZ) {
        this.userInput.fire = true;
      } else if (event.shiftKey) {
        this.userInput.shield = true;
      }
    };
    // Flip bit on key up, key presses may last for multiple cycles
    document.onkeyup = (event: KeyboardEvent) => {
      if (event.code === GLOBAL.arrowUp) {
        this.userInput.forward = false;
      } else if (event.code === GLOBAL.arrowDown) {
        this.userInput.backward = false;
      } else if (event.code === GLOBAL.arrowLeft) {
        this.userInput.rotateLeft = false;
      } else if (event.code === GLOBAL.arrowRight) {
        this.userInput.rotateRight = false;
      } else if (event.code === GLOBAL.keyZ) {
        this.userInput.fire = false;
      } else {
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

    // Calculate time passed since last frame
    let now = Date.now();
    let dt = now - this.dt;
    this.dt = now;

    // Clear canvas for rewrite
    this.ctx.clearRect(0, 0, GLOBAL.worldWidth, GLOBAL.worldHeight);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, GLOBAL.worldWidth, GLOBAL.worldHeight);

    // Draw all entities. Since all entities are always in view, there is no need to search the quadtree
    this.world.entities.forEach(entity => entity.draw(this.ctx));

    // Calculate next position
    this.world.nextStep(this.userInput, dt);

    if (this.world.levelOver) {

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
