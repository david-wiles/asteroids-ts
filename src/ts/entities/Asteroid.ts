import Entity from "./Entity";
import {generateRandomSpeed} from "../util";
import GLOBAL from "../Global";

export default class Asteroid extends Entity {
  type = "Asteroid";

  private edges: Array<{ x: number, y: number }>;

  constructor(x: number, y: number, width: number, height: number, hitPoints: number) {
    super(x, y, width, height);
    this.isPlayer = false;
    this.hitPoints = hitPoints;

    // Create a random speed based on the size of the asteroid
    let speed = generateRandomSpeed(GLOBAL.asteroidSpeedMultiplier / Math.log10(height * width));
    this.rotationRate = Math.random() * 0.1 - 0.05;
    this.speedX = speed.x;
    this.speedY = speed.y;
    this.edges = Asteroid.generateEdges(width / 2);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
    let center = this.center();

    ctx.beginPath();
    ctx.moveTo(center.x + this.edges[0].x, center.y + this.edges[0].y);
    for (let edge of this.edges.slice(1)) {
      ctx.lineTo(center.x + edge.x, center.y + edge.y);
    }

    ctx.fillStyle = "white";
    ctx.fill();
  }

  // Generates an asteroid shape by creating a new list of edges
  private static generateEdges(radius: number): Array<{ x: number, y: number }> {
    let edgeCount = Math.ceil(radius / GLOBAL.asteroidEdgeMultiplier);
    let edges = new Array<{ x: number, y: number }>(edgeCount);
    let slice = (2 * Math.PI) / edgeCount;
    for (let i = 0; i < edgeCount; i++) {
      let angle = Math.random() * (slice) + i * slice;
      edges[i] = {
        x: radius * Math.sin(angle),
        y: radius * -Math.cos(angle)
      }
    }

    return edges;
  }
}
