import { NPC } from './NPC.js';
import { State } from '../State.js';
import * as THREE from 'three';

// State Implementations
class FollowingState extends State {
    enterState(oracle) {
      oracle.lastHintTime = performance.now() / 1000;
    }
  
    updateState(oracle, player) {
      const currentTime = performance.now() / 1000;
      
      if (currentTime - oracle.lastHintTime > oracle.hintCooldown) {
        oracle.switchState(new HintingState());
      }
    }
}

class HintingState extends State {
    enterState(oracle) {
      oracle.lastHintTime = performance.now() / 1000;
    }
  
    updateState(oracle, player) {
      oracle.provideHint(player);
      oracle.switchState(new FollowingState());
    }
}

export class Oracle extends NPC {
  constructor(gameMap) {
    super(new THREE.Color(0x00ff00));
    this.gameMap = gameMap;
    this.player = null;

    this.currentState = new FollowingState();
    this.currentState.enterState(this);
    
    //I tried others but 3 seconds seems the best
    this.hintCooldown = 3;
    this.lastHintTime = 0;
    
    this.slowRadius = 2;
    this.followDistance = 7;
  }

  switchState(newState) {
    this.currentState = newState;
    this.currentState.enterState(this);
  }

  update(deltaTime, player, bounds) {
    super.update(deltaTime, bounds);
    this.player = player;
    this.currentState.updateState(this, player);
    
    // Maintain following behavior
    this.followPlayer(player);
    this.gameObject.position.copy(this.location);
  }

  followPlayer(player) {
    const playerDirection = new THREE.Vector3()
      .copy(player.velocity)
      .normalize();
    
    const targetPosition = new THREE.Vector3()
      .copy(player.location)
      .sub(playerDirection.multiplyScalar(this.followDistance));

    const steering = this.arrive(targetPosition, this.followDistance);
    this.applyForce(steering);
  }

  provideHint(player) {
    const playerNode = this.gameMap.quantize(player.location);
    const goalNode = this.gameMap.goal;
    
    if (!playerNode || !goalNode) return;
  
    // First check if player is exactly at goal
    if (playerNode.id === goalNode.id) {
      console.log("Oracle shouts: \"We've arrived!\"");
      return;
    }
  
    const distance = this.gameMap.costMap.get(playerNode);
    const direction = this.gameMap.vectorField.get(playerNode);
    
    if (!direction || distance === Infinity) {
      console.log("Oracle whispers: \"I do not think this is the right way...\"");
      return;
    }
  
    const compassDir = this.vectorToCompass(direction);
    
    let hint = "";
    if (distance > 15) {
      hint = "I do not think this is the right way";
    } else if (distance < 5) {
      hint = `Almost there! Follow ${compassDir}`;
    } else if (distance < 10) {
      hint = `Warmer... Continue ${compassDir}`;
    } else {
      hint = `The path lies ${compassDir}ward`;
    }
    
    console.log(`Oracle whispers: "${hint}"`);
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