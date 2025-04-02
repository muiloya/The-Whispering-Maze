import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './World/GameMap.js';
import { Player } from './Behaviour/Player/Player.js';
import { Controller } from './Behaviour/Player/Controller.js';


// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();


// Declare our GameMap
let gameMap;

// Declare player and controller
let player;
let controller;

// Camera follow parameters
const cameraOffset = new THREE.Vector3(0, 50, 50);

// Setup our scene
function init() {
  
  scene.background = new THREE.Color(0xffffff);
  
  // Camera
  camera.position.y = 180;
  camera.position.z = 50;
  camera.lookAt(0,0,0);
  scene.add(camera);
  
  // Renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Directional Light
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 5, 5);
  scene.add(directionalLight);

  // Ambient Light
  let ambient = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambient);

  // Create our gameMap
  gameMap = new GameMap();
  scene.add(gameMap.gameObject);

  controller = new Controller(document, camera); // Initialize controller
  player = new Player();
  player.location.copy(gameMap.localize(gameMap.start));
  scene.add(player.gameObject);

  // Camera positioning
  camera.position.copy(player.location).add(new THREE.Vector3(0, 50, 50));
  camera.lookAt(player.location);


  // First call to animate
  animate();
}

// Having the camera follow player location
function updateCameraPosition() {
  camera.position.copy(player.location).add(cameraOffset);
  controls.target.copy(player.location);
  controls.update();
}

// animate loop
function animate() {
  const deltaTime = clock.getDelta();
  requestAnimationFrame(animate);

  player.update(deltaTime, gameMap.bounds, controller); // Pass controller
  updateCameraPosition()
  renderer.render(scene, camera);
}


init();