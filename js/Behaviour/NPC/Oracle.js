import { NPC } from './NPC.js';
import { State } from '../State.js';
import * as THREE from 'three';

// State Implementations
class WanderState extends State {
  enterState(oracle, player) {
    oracle.location = oracle.randomSpawn(player);
    
    // Set a fallback timeout: if player doesn't get close in 20s, respawn
    oracle.fallbackTimeout = setTimeout(() => {
      oracle.switchState(new WanderState());
    }, 10000);
  }

  updateState(oracle, player) {
    const now = performance.now() / 1000;
    // Trigger hinting/solving when player is close
    const dist = oracle.location.distanceTo(player.location);
    if (dist < oracle.hintDistance) {
      // coin toss: 50% Solving, else Hinting
      function coinToss(prob = 0.50) {
        return Math.random() < prob;
      }
      if (coinToss()) {
        oracle.switchState(new SolvingState());
      } else {
        oracle.switchState(new HintingState());
      }
      return;
    }
    let steer = oracle.avoidMultipleCollisions();
    if (steer.length() === 0) steer = oracle.wander();
    oracle.applyForce(steer);
    
  }
}

class SolvingState extends State {
  enterState(oracle) {
    this.oracle = oracle;
    this.startTime = performance.now() / 1000;

    // keep track of old speeds
    this.oldTopSpeed  = oracle.topSpeed;
    this.oldMaxForce = oracle.maxForce;

    //  faster speed
    oracle.topSpeed  = 20;  
    oracle.maxForce = 50; 

    // zero out any residual motion
    oracle.velocity.set(0, 0, 0);
    // “Follow me” message for 3s
    if (oracle.textMgr) {
      oracle.textMgr.removeText('oracleHint');
      oracle.textMgr.createText('oracleHint', 'Follow me!', {}, 3000);
    }
  }

  updateState(oracle) {
    const now = performance.now() / 1000;
    if (now - this.startTime < 5) {
      // Find which node the oracle is on
      const node = oracle.gameMap.quantize(oracle.location);
      // Grab the unit‐vector from the flow field
      const flowDir = oracle.gameMap.vectorField.get(node);
      // Scale it up to a force, and apply
      const steer = flowDir.clone().multiplyScalar(oracle.maxForce);
      oracle.applyForce(steer);

    } else {

      // restore original speeds
      oracle.topSpeed  = this.oldTopSpeed;
      oracle.maxForce = this.oldMaxForce;

      // resume wandering
      oracle.switchState(new WanderState());
    }
  }
}

// Hinting: compute 5-step hint, show it, teleport, resume wandering
class HintingState extends State {
  enterState(oracle, player) {
    this.startTime = performance.now() / 1000;
    this.hinted = false;
    // freeze
    oracle.velocity.set(0, 0, 0);
  }

  updateState(oracle, player) {
    const now = performance.now() / 1000;
    if (!this.hinted && now - this.startTime > 1) {
      // compute flow-field path from player node
      const startNode = oracle.gameMap.quantize(player.location);
      const fullPath  = oracle.computePathNodes(startNode);
      const nextFive  = fullPath.slice(0, 5);

      const dirs = [];
      for (let i = 0; i < nextFive.length; i++) {
        let prev;
        if (i === 0) {
          prev = startNode;
        } else {
          prev = nextFive[i - 1];
        }

        const vec = oracle.gameMap.vectorField.get(prev);
        dirs.push(oracle.vectorToCompass(vec));
      }
      const message = `Next moves: ${dirs.join(', ')}`;

      // show hint
      if (oracle.textMgr) {
        oracle.textMgr.removeText('oracleHint');
        oracle.textMgr.createText('oracleHint', message, {}, 5000);
      }

      this.hinted = true;
      // back to wander
      oracle.switchState(new WanderState());
    }
  }
}


export class Oracle extends NPC {
  constructor(gameMap, player) {
    super(new THREE.Color(0x00ff00));
    this.gameMap = gameMap;
    this.player = player;

    this.hintDistance = 8;
    this.topSpeed = 5; 
    this.maxForce = 5; 
    this.fallbackTimeout = null;

    this.currentState = new WanderState();
    this.currentState.enterState(this, player);

  }

  switchState(newState) {
    // clear any pending respawn
    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }
    this.currentState = newState;
    this.currentState.enterState(this, this.player);
  }

  update(deltaTime, player, bounds) {
    this.player = player;
    super.update(deltaTime, bounds);

    this.currentState.updateState(this, player);
    this.gameObject.position.copy(this.location);
  }

  // get a random spawn point somewhere (hopefully) near the player.
  randomSpawn(player){
    const offset = 5;

    const playerNode = this.gameMap.quantize(player.location);  
    const playerDist = this.gameMap.costMap.get(playerNode);

    const minDist = playerDist - offset;
    const maxDist = playerDist + offset;
    let spawnNode = null;

    while (!spawnNode){
      const randomNode = this.gameMap.getRandomDistantNode(minDist);
      const randomDist = this.gameMap.costMap.get(randomNode);

      if (randomDist > minDist && randomDist < maxDist) {
        spawnNode = randomNode;
      }
    }
    
    return this.gameMap.localize(spawnNode);
  }

  computePathNodes(startNode) {
    const nodes = [];
    let node = startNode;
    while (node && node.id !== this.gameMap.goal.id) {
      let bestEdge = null;
      let bestCost = Infinity;
      for (const e of node.edges) {
        const c = this.gameMap.costMap.get(e.node);
        if (c < bestCost) {
          bestCost = c;
          bestEdge = e;
        }
      }
      if (!bestEdge) break;
      node = bestEdge.node;
      nodes.push(node);
    }
    return nodes;
  }
  
  //using the dot product method
  vectorToCompass(vector) {
    const directions = {
      'north': new THREE.Vector3(0, 0, -1),
      'south': new THREE.Vector3(0, 0, 1),
      'east': new THREE.Vector3(1, 0, 0),
      'west': new THREE.Vector3(-1, 0, 0)
    };

    //using the dot product method
    let closestDir = 'north';
    let maxDot = -Infinity;
    
    for (const [dir, dirVector] of Object.entries(directions)) {
      const dot = vector.clone().normalize().dot(dirVector);
      // compares directions of the vector and picks the highest one
      if (dot > maxDot) {
        maxDot = dot;
        closestDir = dir;
      }
    }
    
    return closestDir;
  }
}