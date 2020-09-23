import Simulation from "./Simulation";

document.addEventListener("DOMContentLoaded", function () {
  let canvas = document.querySelector("#game-canvas");
  if (canvas instanceof HTMLCanvasElement) {
    initializeCanvas(canvas);
    let simulation = new Simulation(canvas);
    simulation.registerListeners();
    simulation.setUp();
    simulation.start();
  } else {
    console.error("Could not find canvas element.");
  }
});


function initializeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.screen.width;
  canvas.height = window.screen.height;
}
