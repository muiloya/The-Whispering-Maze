import * as THREE from 'three';
import { MathUtil } from '../Util/MathUtil.js';
import { MapGraph } from './MapGraph.js';
import { MapNode } from './MapNode.js';
import { MapRenderer } from './MapRenderer.js';
import { MazeGenerator } from './MazeGenerator.js';


export class GameMap {

  // Constructor for our GameMap class
  constructor() {
  
    // Initialize bounds in here!
    this.bounds = new THREE.Box3(
      new THREE.Vector3(-100,0,-100), // scene min
      new THREE.Vector3(100,0,100) // scene max
    );

    // worldSize is a Vector3 with 
    // the dimensions of our bounds
    this.worldSize = new THREE.Vector3();
    this.bounds.getSize(this.worldSize);

    // Let's define a tile size
    // for our tile-based map
    this.tileSize = 10;

    // Columns and rows of our tile world
    let cols = this.worldSize.x/this.tileSize;
    let rows = this.worldSize.z/this.tileSize;


    // Create our graph!
    this.mapGraph = new MapGraph(cols, rows);
     
    // Generate our maze here!
    this.mazeGenerator = new MazeGenerator(this.mapGraph);
    // this.mazeGenerator.dfsMaze(this.mapGraph.get(0));
    this.mazeGenerator.braidedMaze(this.mapGraph.get(0), 1);


    // Create our map renderer
    this.mapRenderer = new MapRenderer(this);

    // Create our game object
    this.gameObject = this.mapRenderer.createRendering();

    // TODO: this section might need a refactor
    // Create a random goal node
    this.goal = this.createRandomGoal();

    // create our costmap using dijkstra
    this.costMap = this.mapGraph.singleGoalDijkstra(this.goal);

    // create a random start node
    this.start = this.createRandomStart(this.goal, this.costMap, 20);

    // create our vector flow field for npc pathfinding
    this.vectorField = this.setupVectorField(this.goal);
  }

  

  // Method to get from node to world location
  localize(node) {
    let x = this.bounds.min.x + (node.i * this.tileSize) + this.tileSize/2;
    let y = this.tileSize;
    let z = this.bounds.min.z + (node.j * this.tileSize) + this.tileSize/2;
    return new THREE.Vector3(x, y, z);
  }

  // Method to get from world location to node
  quantize(location) {
    let nodeI = Math.floor((location.x - this.bounds.min.x)/this.tileSize);
    let nodeJ = Math.floor((location.z - this.bounds.min.z)/this.tileSize);

    return this.mapGraph.getAt(nodeI, nodeJ);
  }

  createRandomGoal() {
    let goalNode = this.mapGraph.getRandomGroundNode();
    this.gameObject.add(this.mapRenderer.highlight(goalNode, 'green'));
    return goalNode;
  }

  createRandomStart(goal, costMap, minDistance) {
    let startNode = null;

    // Keep trying until we find a valid start node
    while (!startNode) {
        let randomNode = this.mapGraph.getRandomGroundNode();

        // Ensure the node is far enough from the goal
        if (costMap.get(randomNode) >= minDistance) {
            startNode = randomNode;

            // Highlight the start node in blue
            this.gameObject.add(this.mapRenderer.highlight(startNode, 'red'));
        }
    }
    return startNode;
  }

  setupVectorField(goal) {
    let vectorField = new Map();

    // Compute movement vectors for each node
    for (let node of this.mapGraph.nodes) {

      // Skip obstacles and goal
      if (!node.isTraversable() || node.id == goal.id) {
        continue;
      }
  
      let bestNeighbor = null;
      let bestCost = Infinity;
  
      // Check all neighboring nodes to find the neighbor with the best cost
      for (let edge of node.edges) {
        let neighbor = edge.node;
        let cost = this.costMap.get(neighbor);
  
        if (cost < bestCost) {
          bestCost = cost;
          bestNeighbor = neighbor;
        }
      }
  
      // Compute movement vector pointing to best neighbor, if no valid neighbour set zero vector.
      if (bestNeighbor != null) {
        let from = this.localize(node);
        let to = this.localize(bestNeighbor);
        let direction = new THREE.Vector3().subVectors(to, from).normalize();
        vectorField.set(node, direction);
      } else {
        vectorField.set(node, new THREE.Vector3(0, 0, 0));
      }
    }    
    
    return vectorField;
  }

}