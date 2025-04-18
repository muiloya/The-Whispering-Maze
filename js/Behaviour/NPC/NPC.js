import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil';
import { Character } from '../Character';
import { DebugLine} from '../Debug';

/**
 * 
 * The NPC class stores information and
 * behaviour only for non-player characters 
 * 
 */
export class NPC extends Character {

  constructor(color) {
  
    super(color);
    this.wanderAngle = Math.random() * (Math.PI*2);   
    // whisker spread angle (30°)
    this.whiskerAngle  = Math.PI/6;  
    // length of the side whiskers
    this.whiskerLength = 8;          
  }

  // Seek steering behaviour
  seek(target) {

    // Calculate desired velocity
    let desired = VectorUtil.sub(target, this.location);
    desired.setLength(this.topSpeed);
  
    // Calculate steering force
    let steer = VectorUtil.sub(desired, this.velocity);

    if (steer.length() > this.maxForce) {
      steer.setLength(this.maxForce);
    }

    return steer;

  }

  // Arrive steering behaviour
  arrive(target, radius) {

    let desired = new THREE.Vector3();
    desired.subVectors(target, this.location);

    let distance = desired.length();

    // If we are close enough to
    // the target, stop
    if (distance < 0.01) {
      this.velocity.setLength(0);
    
    // Slow down if we are within
    // a specified radius to the target
    } else if (distance < radius) {
      let speed = (distance/radius) * this.topSpeed;
      desired.setLength(speed);
    
    // Otherwise, proceed as seek
    } else {
      desired.setLength(this.topSpeed);
    
    }

    // Apply our steering formula
    let steer = new THREE.Vector3();
    steer.subVectors(desired, this.velocity);

    if (steer.length() > this.maxForce) {
      steer.setLength(this.maxForce);
    }

    return steer;

  }

  // Wander steering behaviour
  wander() {

    let distance = 10;
    let radius = 5;
    let angleOffset = 0.3;

    let futureLocation = this.velocity.clone();
    futureLocation.setLength(distance);
    futureLocation.add(this.location);
    
    let target = new THREE.Vector3(radius*Math.sin(this.wanderAngle), 0, radius*Math.cos(this.wanderAngle));
    target.add(futureLocation);
  
    let steer = this.seek(target);

    let change = Math.random() * (angleOffset*2) - angleOffset;
    this.wanderAngle = this.wanderAngle + change;
    
    return steer;

  }

  // Flee steering behaviour
  flee(target) {

    let desired = new THREE.Vector3();
    desired.subVectors(target, this.location);
    desired.setLength(this.topSpeed);

    // This is the only change compared
    // to our seek steering behaviour
    desired.multiplyScalar(-1);

    let steer = new THREE.Vector3();
    steer.subVectors(desired, this.velocity);     


    if (steer.length() > this.maxForce) {
      steer.setLength(this.maxForce);
    }

    return steer;

  }

  // Pursue steering behaviour
  pursue(character, lookAhead) {
    
    let prediction = new THREE.Vector3();
    prediction.addScaledVector(character.velocity, lookAhead);

    let predictedTarget = new THREE.Vector3();
    predictedTarget.addVectors(prediction, character.location); 

    return this.seek(predictedTarget);
  }


  // Evade steering behaviour
  evade(character, lookAhead) {

    let prediction = new THREE.Vector3();
    prediction.addScaledVector(character.velocity, lookAhead);

    let predictedTarget = new THREE.Vector3();
    predictedTarget.addVectors(prediction, character.location);

    return this.flee(predictedTarget);


  }

  // Sets up debug lines
  setupDebugInfo(scene) {
    this.debugCenterLine = new DebugLine(scene);
    this.debugWhisker1Line = new DebugLine(scene);
    this.debugWhisker2Line = new DebugLine(scene);
  }
  
  // debug whiskers: update line points & colors
  showDebug(center, left, right, hit) {
    const start = this.location.clone();
    const endC  = start.clone().add(center);
    const endL  = start.clone().add(left);
    const endR  = start.clone().add(right);
    const color = hit ? 0xff0000 : 0x00ff00;

    this.debugCenterLine   .setPoints(start, endC);
    this.debugWhisker1Line .setPoints(start, endL);
    this.debugWhisker2Line .setPoints(start, endR);

    this.debugCenterLine   .setColor(color);
    this.debugWhisker1Line .setColor(color);
    this.debugWhisker2Line .setColor(color);
  }

  avoidMultipleCollisions(lookAhead = this.lookAhead) {
    // grab merged wall mesh from map
    const walls = this.gameMap.gameObject.children[1];
    const origin = this.location.clone();
    const velNorm = this.velocity.clone().normalize();
    if (velNorm.lengthSq() === 0) return new THREE.Vector3();
  
    // compute whisker vectors
    const centerVec = velNorm.clone().multiplyScalar(lookAhead);
    const leftVec   = velNorm.clone()
      .applyAxisAngle(new THREE.Vector3(0,1,0),  this.whiskerAngle)
      .multiplyScalar(this.whiskerLength);
    const rightVec  = velNorm.clone()
      .applyAxisAngle(new THREE.Vector3(0,1,0), -this.whiskerAngle)
      .multiplyScalar(this.whiskerLength);
  
    let steer = new THREE.Vector3();
    let hit   = false;
  
    // helper to test one whisker
    const testWhisker = (dirVec) => {
      const ray = new THREE.Raycaster(origin, dirVec.clone().normalize(), 0, dirVec.length());
      const hits = ray.intersectObject(walls, true);
      if (hits.length > 0) {
        hit = true;
        const pt = hits[0].point;
        // normal away from wall
        const normal = this.location.clone().sub(pt).normalize();
        const avoidTarget = pt.clone().add(normal.multiplyScalar(this.size));
        // flee target
        const f = this.flee(avoidTarget);
        steer.add(f);
      }
    };
  
    // test all three whiskers
    testWhisker(centerVec);
    testWhisker(leftVec);
    testWhisker(rightVec);
  
    // draw debug whiskers
    this.showDebug(centerVec, leftVec, rightVec, hit);
  
    if (steer.length() > this.maxForce) {
      steer.setLength(this.maxForce);
    }
    return steer;
  }

  // single whisker collision test + avoidance
  avoidCollision(obstacle, toObs, ray) {
    // project vector to obstacle onto ray
    const scalarProj = VectorUtil.scalarProjectOnVector(toObs, ray);
    // detect collision
    if (!this.detectCollision(obstacle, ray, scalarProj)) return new THREE.Vector3();
    // compute collision point
    const cp = this.getCollisionPoint(obstacle, ray, scalarProj);
    // compute avoid target
    const target = this.getAvoidTarget(obstacle, cp, this.size);
    // steering: flee target
    return this.flee(target);
  }

  detectCollision(obstacle, ray, scalarProj) {
    const len = ray.length();
    const clamped = THREE.MathUtils.clamp(scalarProj, 0, len);
    const closest = ray.clone().setLength(clamped).add(this.location);
    return closest.distanceTo(obstacle.position) <= obstacle.radius;
  }

  getCollisionPoint(obstacle, ray, scalarProj) {
    const projV = ray.clone().setLength(scalarProj).add(this.location);
    const opp = projV.clone().sub(obstacle.position);
    const adj = Math.sqrt(obstacle.radius**2 - opp.lengthSq());
    const collisionLen = scalarProj - adj;
    return ray.clone().setLength(collisionLen).add(this.location);
  }

  getAvoidTarget(obstacle, collisionPoint, howFar) {
    const normal = collisionPoint.clone().sub(obstacle.position).setLength(howFar);
    return collisionPoint.clone().add(normal);
  }


}