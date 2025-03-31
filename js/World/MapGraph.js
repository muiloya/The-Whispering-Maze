import * as THREE from 'three';
import { MapNode } from './MapNode.js';
import { MinHeap } from '../Util/MinHeap.js';


export class MapGraph {
  
  // Constructor for our MapGraph class
  constructor(cols, rows) {

    // node array for our Graph class
    this.nodes = [];

    // Columns and rows
    // as instance variables
    this.cols = cols;
    this.rows = rows;

    // Create nodes
    this.createNodes();
  
  }

  // Get a node at a particular index
  get(index) {
    return this.nodes[index];
  }

  // Get a node at i and j indices
  getAt(i, j) {
    return this.get(j * this.cols + i);
  }

  // The number of nodes in our graph
  length() {
    return this.nodes.length;
  }

  // Method to get a random ground node
  getRandomGroundNode() {
    // Filter for ground nodes
    let groundNodes = this.nodes.filter(node => node.type === MapNode.Type.Ground);
    
    if (groundNodes.length === 0) {
      console.log("No ground nodes available.");
      return null;
    }
    // Random index from the list of ground nodes
    let randomIndex = Math.floor(Math.random() * groundNodes.length);
    return groundNodes[randomIndex];
  }

  singleGoalDijkstra(goal) {
    let costMap = new Map();
    let priorityQueue = new MinHeap();
  
    // Initialize the cost map with Infinity for all nodes
    for (let node of this.nodes) {
      costMap.set(node, Infinity);
    }
  
    // Set cost to 0 for the goal node and enqueue it
    costMap.set(goal, 0);
    priorityQueue.enqueue(goal, 0);
  
    // Dijkstra's Algorithm:
    while (!priorityQueue.isEmpty()) {
      
      // Get node with the lowest cost and retrieve its cost
      let current = priorityQueue.dequeue();
      let currentCost = costMap.get(current);
  
      // Calculate cost of neighboring nodes
      for (let edge of current.edges) {
        let neighbor = edge.node;
        let newCost = currentCost + edge.cost;
  
        // Update cost if a shorter path is found and enqueue the node
        if (newCost < costMap.get(neighbor)) {
          costMap.set(neighbor, newCost);
          priorityQueue.enqueue(neighbor, newCost);
        }
      }
    }
    return costMap;
  }

  // Create tile-based nodes
  createNodes() {
    // Loop over all rows and columns
    // to create all of our nodes
    // and add them to our node array
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {

        let type = MapNode.Type.Ground;

        let node = new MapNode(this.length(), i, j, type);
        this.nodes.push(node);

      }
    }
  }

}