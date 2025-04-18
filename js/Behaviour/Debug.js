import * as THREE from 'three';

/**
 * Creates a sphere for debugging
 * Set the scene in here for cleanliness
 * of in class examples
 **/
export class DebugSphere {

  constructor(scene, color = 0xffffff, position = new THREE.Vector3()) {

    // Create the sphere geometry and material
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({color: color});

    // Create the mesh and set its position
    this.gameObject = new THREE.Mesh(geometry, material);
    this.gameObject.position.copy(position);

    // Add the sphere to the scene
    scene.add(this.gameObject);
  }

  // sets the position of the sphere
  setPosition(newPosition) {
    this.gameObject.position.copy(newPosition);
  }

  // sets the color of the sphere
  setColor(newColor) {
    this.gameObject.material.color.set(newColor);
  }

  // show
  show() {
    this.gameObject.visible = true;
  }

  // hide
  hide() {
    this.gameObject.visible = false;
  }
  
}

/**
  * Creates a line for debugging
  * Set the scene in here for cleanliness
  * of in class examples
  **/
export class DebugLine {

  constructor(scene, start = new THREE.Vector3(), end = new THREE.Vector3()) {

    // Setting up our three.js object
    let geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    let material = new THREE.LineBasicMaterial({color: 0x000000});

    this.gameObject = new THREE.Line(geometry, material);

    // Add the sphere to the scene
    scene.add(this.gameObject);
  }

  // sets the position of the line
  setPoints(start, end) {
    this.gameObject.geometry.setFromPoints([start, end]);
    this.gameObject.geometry.attributes.position.needsUpdate = true;
  }

  // sets the color of the line
  setColor(newColor) {
    this.gameObject.material.color.set(newColor);
  }

}