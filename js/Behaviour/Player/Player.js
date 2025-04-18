import { Character } from '../Character';
import { State } from '../State';


export class Player extends Character {

  constructor(color) {
    super(color);
  
    this.topSpeed = 40;  
    this.maxForce = 100;   

    this.state = new IdleState();
    this.state.enterState(this);
  }

  switchState(state) {
    this.state = state;
    this.state.enterState(this);
  }

  update(deltaTime, bounds, controller) {
    this.state.updateState(this, controller);

    // Remember where we started
    const oldLoc = this.location.clone();

    super.update(deltaTime, bounds);

    // ensure character cannot cross walls
    const oldNode = this.gameMap.quantize(oldLoc);
    const newNode = this.gameMap.quantize(this.location);
    if (
      oldNode &&
      newNode &&
      oldNode.id !== newNode.id &&
      !oldNode.hasEdgeTo(newNode.i, newNode.j)
    ) {
      this.location.copy(oldLoc);
      this.velocity.set(0, 0, 0);
    }
  }
  
}

// Idle state for when our
// player character is not moving
export class IdleState extends State {

  enterState(player) {
    player.applyForce(player.applyBrakes());
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







