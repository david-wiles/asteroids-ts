/**
 * class QuadTree
 *
 * Adapted from kontra: https://github.com/straker/kontra/blob/main/src/quadtree.js
 *
 * QuadTree data structure to minimize work for object collision
 */
import {Entity} from "./Entities";
import {Bounds} from "./types";

// TODO make this configurable
const MAXOBJECTS = 10;
const MAXDEPTH = 10;

export default class QuadTree {
  isLeaf: boolean = true;
  depth: number = 0;

  bounds: { x: number, y: number, width: number, height: number };
  objects: Array<Entity> = [];
  subNodes: Array<QuadTree> = [];
  parent?: QuadTree = null;

  constructor(bounds: { x: number, y: number, width: number, height: number }) {
    this.bounds = bounds;
  }

  clear() {
    this.subNodes.map((node: QuadTree) => {
      node.clear();
    });

    this.isLeaf = true;
    this.objects.length = 0;
  }

  addEntity(...entities: Entity[]) {
    entities.map((entity) => {
      if (this.isLeaf) {
        this.objects.push(entity);

        if (this.objects.length > MAXOBJECTS && this.depth < MAXDEPTH) {
          this.split();
          this.objects.map((object) => this.addEntityToSubTrees(object));
        }

      } else {
        this.addEntityToSubTrees(entity);
      }
    });
  }

  // Returns all objects in quadTrees intersecting the entity, including the entity
  searchAdjacent(entity: Bounds): Entity[] {
    let adjacent = new Set<Entity>();

    // If the root quadtree is a leaf node, then this represents the entire world
    if (this.isLeaf) {
      return this.objects;
    }

    this.getIntersectingNodes(entity).map((qt) => {
      qt.searchAdjacent(entity).map((object) => adjacent.add(object));
    });

    return Array.from(adjacent);
  }

  private split() {
    if (this.subNodes.length === 0) {
      this.isLeaf = false;

      let width = this.bounds.width / 2;
      let height = this.bounds.height / 2;

      for (let i = 0; i < 4; i++) {
        this.subNodes[i] = new QuadTree({
          x: this.bounds.x + (i % 2 === 1 ? width : 0),  // nodes 1 and 3
          y: this.bounds.y + (i >= 2 ? height : 0),      // nodes 2 and 3
          width: width,
          height: height
        });
        this.subNodes[i].depth = this.depth + 1;
        this.subNodes[i].parent = this;
      }
    }
  }

  private addEntityToSubTrees(entity: Entity) {
    this.getIntersectingNodes(entity).map((qt) => qt.addEntity(entity));
  }

  // Finds all nodes intersecting with an object
  private getIntersectingNodes(entity: Bounds): QuadTree[] {
    let nodes = new Array<QuadTree>();
    let verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    let horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
    let intersectsTop = entity.y < horizontalMidpoint;
    let intersectsBottom = entity.y + entity.height >= horizontalMidpoint;

    if (entity.x < verticalMidpoint) {
      // Left Top
      if (intersectsTop) {
        nodes.push(this.subNodes[0]);
      }
      // Left Bottom
      if (intersectsBottom) {
        nodes.push(this.subNodes[2]);
      }
    }
    if (entity.x + entity.width >= verticalMidpoint) {
      // Right Top
      if (intersectsTop) {
        nodes.push(this.subNodes[1]);
      }
      // Right Bottom
      if (intersectsBottom) {
        nodes.push(this.subNodes[3]);
      }
    }

    return nodes;
  }
}
