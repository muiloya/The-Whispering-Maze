import { Character } from './Character.js';
import { State } from './State';


export class Player extends Character {

  constructor(color) {
    super(color);
  
    this.maxForce = 50;

    this.state = new IdleState();
    this.state.enterState(this);
  }

  switchState(state) {
    this.state = state;
    this.state.enterState(this);
  }

  update(deltaTime, bounds, controller) {
    this.state.updateState(this, controller);
    super.update(deltaTime, bounds);
  }
  
}

// Idle state for when our
// player character is not moving
export class IdleState extends State {

  enterState(player) {
    console.log("Idle");
    // If you want to abruptly
    // stop, use this!
    // player.stop();
  }

  updateState(player, controller) {
    if (controller.moving()) {
      player.switchState(new MovingState());
    } else {
      // If you want to slow 
      // down to a stop, use this
      player.applyForce(player.applyBrakes());
    }
  }

}

// Moving state for when our
// player character is in motion
export class MovingState extends State {
  
  enterState(player) {
    console.log("Moving");
  }

  updateState(player, controller) {
    if (!controller.moving()) {
      player.switchState(new IdleState());
    } else {
      let steer = controller.direction();
      steer.setLength(player.maxForce);
      player.applyForce(steer);
    }
  }

}







