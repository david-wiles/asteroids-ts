import Simulation from "./Simulation";

document.addEventListener("DOMContentLoaded", function () {
  let startMenu = document.querySelector(".start-menu-container");
  let canvas = document.querySelector("#game-canvas");

  function startFn() {
    document.removeEventListener("keydown", startFn);
    startMenu.remove();
    if (canvas instanceof HTMLCanvasElement) {

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let simulation = new Simulation(canvas);
      simulation.registerListeners();
      simulation.setUp();
      simulation.start();

    } else {
      console.error("Could not find canvas element.");
    }
  }

  // Once the user clicks the start menu, start the game
  document.addEventListener("keydown", startFn);
});
