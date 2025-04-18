import { NPC } from './NPC.js';
import { State } from '../State.js';
import * as THREE from 'three';

// State Implementations
class WanderState extends State {
  enterState(oracle, player) {
    oracle.location = oracle.randomSpawn(oracle.player);
  }

  updateState(oracle, player) {
    if (player.location.distanceTo(oracle.location) < 5){
      console.log(" This is where I should hint but yousef has to do that!");
      // potential turn to player here too
    }
    // have another else here to switch to wanderstate after a timeout
    // in case player never finds oracle
    else {
      let steer = oracle.avoidMultipleCollisions();
      if (steer.length() === 0){
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

  }

  switchState(newState) {
    this.currentState = newState;
    this.currentState.enterState(this);
  }

  update(deltaTime, player, bounds) {
    super.update(deltaTime, bounds);

    this.currentState.updateState(this, player);
    this.gameObject.position.copy(this.location);
  }

  // get a random spawn point somewhere near the player.
  randomSpawn(player){
    const playerNode = this.gameMap.quantize(player.location);  
    const distance = this.gameMap.costMap.get(playerNode);
    const spawnNode = this.gameMap.getRandomDistantNode(distance);
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