import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './World/GameMap.js';
import { Player } from './Behaviour/Player/Player.js';
import { Controller } from './Behaviour/Player/Controller.js';
import { Oracle } from './Behaviour/NPC/Oracle.js';
import { Resources } from './Util/Resources.js';
import { TextManager } from './Util/TextManager.js';
import { StartScreen } from './GUI/page.js';
import { EndScreen } from './GUI/page.js';


// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();


// Declare our GameMap
let gameMap;

// Declare player and controller
let controller;
let oracle;
const player = new Player();

let finishTimer = null;
let gameFinished = false;

let animationId;

// Load in our resources
let files = [{name:"robot",url:"/models/robot.glb"},
  {name:"oracle",url:"/models/Ghost_model.glb"}];
const resources = new Resources(files);
await resources.loadAll();

player.setModel(resources.get("robot"));


// Camera follow parameters
const cameraOffset = new THREE.Vector3(0, 25, 0);

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
  player.location.copy(gameMap.localize(gameMap.start));
  scene.add(player.gameObject);
  player.gameMap = gameMap;

  oracle = new Oracle(gameMap, player);
  oracle.setModel(resources.get("oracle"));
  oracle.location.copy(gameMap.localize(gameMap.start))
          .add(new THREE.Vector3(20, 0, 20)); // Offset from player
  const textMgr = new TextManager();
  oracle.textMgr = textMgr;
  scene.add(oracle.gameObject);

  // Camera positioning
  camera.position.copy(player.location).add(cameraOffset);
  camera.lookAt(player.location);

  // First animate call
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
  animationId = requestAnimationFrame(animate);

  if(player) {
    player.update(deltaTime, gameMap.bounds, controller); // Pass controller
  }

  if (!gameFinished) {
    if (oracle && player) {
      oracle.update(deltaTime, player, gameMap.bounds);
    }
  
    // Check if player is on the goal
    const pNode = gameMap.quantize(player.location);
    if (pNode && pNode.id === gameMap.goal.id) {
      if (finishTimer === null) {
        finishTimer = clock.getElapsedTime();
      } else if (clock.getElapsedTime() - finishTimer > 0.25) {
        finishGame();
      }
    } else {
      finishTimer = null;
    }
  }

  updateCameraPosition()
  renderer.render(scene, camera);
}


function startGame() {
  init();
}
new StartScreen(startGame());

function finishGame() {
  cancelAnimationFrame(animationId);
  new EndScreen(() => {
    window.location.reload();
  });
}