import { NPC } from './NPC.js';
import { State } from '../State.js';
import * as THREE from 'three';

// State Implementations
class WanderState extends State {
  enterState(oracle, player) {
    oracle.location = oracle.randomSpawn(player);
    
    // Set a fallback timeout: if player doesn't get close in 3s, switch back
    oracle.wanderTimeout = setTimeout(() => {
      oracle.switchState(new WanderState());
      oracle.wanderTimeout = null;
    }, 10000);
  }

  updateState(oracle, player) {
    const distance = player.location.distanceTo(oracle.location);

    if (distance < 5) {
      console.log("This is where I should hint but yousef has to do that!");

      // Player got close — cancel timeout 
      if (oracle.wanderTimeout) {
        clearTimeout(oracle.wanderTimeout);
        oracle.wanderTimeout = null;
      }
    } else {
      let steer = oracle.avoidMultipleCollisions();
      if (steer.length() === 0) {
        steer = oracle.wander();
      }
      oracle.applyForce(steer);
    }
  }
}

class HintingState extends State {
    enterState(oracle, player) {
      oracle.lastHintTime = performance.now() / 1000;
    }
  
    updateState(oracle, player) {
      oracle.provideHint(player);
      oracle.switchState(new WanderState());
    }
}

export class Oracle extends NPC {
  constructor(gameMap, player) {
    super(new THREE.Color(0x00ff00));
    this.gameMap = gameMap;
    this.player = player;

    this.currentState = new WanderState();
    this.currentState.enterState(this, player);
    
    //I tried others but 3 seconds seems the best
    this.hintCooldown = 3;
    this.lastHintTime = 3;
    
    this.topSpeed = 5; 
    this.maxForce = 5; 

    this.wanderTimeout = null;
  }

  switchState(newState) {
    this.currentState = newState;
    this.currentState.enterState(this, this.player);
  }

  update(deltaTime, player, bounds) {
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

  provideHint(player) {
    const playerNode = this.gameMap.quantize(player.location);
    const goalNode = this.gameMap.goal;
    
    if (!playerNode || !goalNode) return;

    let message;
  
    // First check if player is exactly at goal
    if (playerNode.id === goalNode.id) {
      message = "Oracle shouts: \"We've arrived!\"";
    }else{
      const distance = this.gameMap.costMap.get(playerNode);
      const direction = this.gameMap.vectorField.get(playerNode);
      if (!direction || distance === Infinity) {
      message = "Oracle whispers: \"I do not think this is the right way...\"";
    }else{
      const compassDir = this.vectorToCompass(direction);
      if (distance > 15) {
        message = "I do not think this is the right way";
      } else if (distance < 5) {
        message = `Almost there! Follow ${compassDir}`;
      } else if (distance < 10) {
        message = `Warmer... Continue ${compassDir}`;
      } else {
        message = `The path lies ${compassDir}ward`;
      }
    }

    this.textMgr.removeText('oracleHint');
    this.textMgr.createText(
      'oracleHint',
      message,
      null,                   // default (bottom-center)
      { color: 'white', background: 'rgba(0,0,0,0.5)', padding: '8px' }
    );

    // auto‑clear after 3 seconds
    setTimeout(() => this.textMgr.removeText('oracleHint'), 3000);
    }
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