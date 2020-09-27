import Simulation from "./Simulation";

document.addEventListener("DOMContentLoaded", function () {
  let canvas = document.querySelector("#game-canvas");

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
});
