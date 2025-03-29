import * as THREE from 'three';
import { VectorUtil } from '../Util/VectorUtil.js';

export class Controller {

  // Controller Constructor
  constructor(doc, camera) {
    this.doc = doc;
    this.camera = camera;

    this.left = false;
    this.right = false;
    this.forward = false;
    this.backward = false;

    this.doc.addEventListener('keydown', this);
    this.doc.addEventListener('keyup', this);
  }

  // Handling our key events
  handleEvent(event) {
    if (event.type === 'keydown') {
      if (event.code === 'ArrowUp') { this.forward = true; }
      else if (event.code === 'ArrowDown') { this.backward = true; }
      else if (event.code === 'ArrowLeft') { this.left = true; }
      else if (event.code === 'ArrowRight') { this.right = true; }
    }
    
    else if (event.type === 'keyup') {
      if (event.code === 'ArrowUp') { this.forward = false; }
      else if (event.code === 'ArrowDown') { this.backward = false; }
      else if (event.code === 'ArrowLeft') { this.left = false; }
      else if (event.code === 'ArrowRight') { this.right = false; }      
    }
  }

  // Get input angle
  // See "Final Project" 
  // controller slides for reference!
  getInputAngle() {
    let angle = 0;

    // If we are moving backward
    // i.e. toward us, arrow down
    if (this.backward) {
      // left is offset by -PI/4
      if (this.left) { angle -= Math.PI/4; }
      // right is offset by +PI/4
      if (this.right) { angle += Math.PI/4; }
    }
 
    // If we are moving forward
    // i.e. away from us, arrow up
    else if (this.forward) {
      // angle is PI or 180 degrees
      angle = Math.PI;
      // left is offset by +PI/4
      if (this.left) { angle += Math.PI/4; }
      // right is offset by -PI/4
      if (this.right) { angle -= Math.PI/4; }
    }

    // Otherwise, if just moving left or right
    else if (this.left) { angle = -Math.PI/2; }
    else if (this.right) { angle = Math.PI/2; }

    return angle;
  }

  // direction
  direction() {
    
    // To get the direction of movement
    // relative to the camera
    let worldDirection = new THREE.Vector3();
    this.camera.getWorldDirection(worldDirection);

    // Convert to an angle
    let directionAngle = Math.atan2(worldDirection.x, worldDirection.z);
    directionAngle += Math.PI;
    directionAngle += this.getInputAngle();
    
    // Convert back to a vector
    let x = Math.sin(directionAngle);
    let z = Math.cos(directionAngle);

    return new THREE.Vector3(x, 0, z);

  }

  // Checks whether our controller is moving!
  moving() {
    if (this.left || this.right || this.forward || this.backward) 
      return true;
    return false;
  }


}
