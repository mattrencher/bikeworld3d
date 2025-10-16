// Bike model - Low poly bicycle
import * as THREE from 'three';
import { CONFIG } from '../utils/constants.js';

export class Bike {
  constructor(scene) {
    this.scene = scene;
    this.bikeGroup = new THREE.Group();
    this.wheels = [];
  }

  /**
   * Create the bike
   */
  create() {
    // Bike frame color
    const frameColor = 0xFF3333;
    const frameMaterial = new THREE.MeshLambertMaterial({ 
      color: frameColor,
      flatShading: true 
    });

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x222222,
      flatShading: true 
    });

    // Front wheel
    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.8, 1.5);
    frontWheel.castShadow = true;
    this.wheels.push(frontWheel);
    this.bikeGroup.add(frontWheel);

    // Back wheel
    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, 0.8, -1.5);
    backWheel.castShadow = true;
    this.wheels.push(backWheel);
    this.bikeGroup.add(backWheel);

    // Frame parts
    // Main tube (horizontal)
    const mainTube = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 3),
      frameMaterial
    );
    mainTube.position.set(0, 1.5, 0);
    mainTube.castShadow = true;
    this.bikeGroup.add(mainTube);

    // Seat tube (vertical)
    const seatTube = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1, 0.15),
      frameMaterial
    );
    seatTube.position.set(0, 1.5, -.8);
    seatTube.castShadow = true;
    this.bikeGroup.add(seatTube);

    // Head tube (angled)
    const headTube = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1.2, 0.15),
      frameMaterial
    );
    headTube.position.set(0, 1.5, 1);
    headTube.rotation.x = Math.PI / 6;
    headTube.castShadow = true;
    this.bikeGroup.add(headTube);

    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.2, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true })
    );
    seat.position.set(0, 2.3, -.8);
    seat.castShadow = true;
    this.bikeGroup.add(seat);

    // Handlebars
    const handlebar = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.1, 0.1),
      frameMaterial
    );
    handlebar.position.set(0, 2.2, 1.3);
    handlebar.castShadow = true;
    this.bikeGroup.add(handlebar);

    // Handlebar stem
    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.5, 0.1),
      frameMaterial
    );
    stem.position.set(0, 1.95, 1.3);
    stem.castShadow = true;
    this.bikeGroup.add(stem);

    // Position the bike
    this.bikeGroup.position.set(
      CONFIG.BIKE_POSITION.x,
      CONFIG.BIKE_POSITION.y,
      CONFIG.BIKE_POSITION.z
    );

    // Rotate bike to face right (tangent to the circular path)
    // -Math.PI / 2 = -90 degrees = facing right
    this.bikeGroup.rotation.y = Math.PI / 2;

    this.scene.add(this.bikeGroup);
    console.log('✓ Bike created');
  }

  /**
   * Get the bike group
   */
  getBikeGroup() {
    return this.bikeGroup;
  }

  /**
   * Get wheels for animation
   */
  getWheels() {
    return this.wheels;
  }

  /**
   * Animate wheel rotation
   */
  animateWheels(speed) {
    this.wheels.forEach(wheel => {
      wheel.rotation.x += speed;
    });
  }
}
