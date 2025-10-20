// Bike model - Low poly bicycle
import * as THREE from "three";
import { CONFIG } from "../utils/constants.js";

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
    const frameColor = 0xffa500;
    const frameMaterial = new THREE.MeshLambertMaterial({
      color: frameColor,
      flatShading: true,
    });
    const accentColor = 0xc0c0c0;
    const accentMaterial = new THREE.MeshLambertMaterial({
      color: accentColor,
      flatShading: true,
    });

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({
      color: 0x222222,
      flatShading: true,
    });

    // Front wheel
    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.8, 1.25);
    frontWheel.castShadow = true;
    this.wheels.push(frontWheel);
    this.bikeGroup.add(frontWheel);

    // Back wheel
    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, 0.8, -1.44);
    backWheel.castShadow = true;
    this.wheels.push(backWheel);
    this.bikeGroup.add(backWheel);

    // Frame parts
    // Top tube (horizontal)
    const topTube = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.1, // radiusTop,
        0.1, // radiusBottom,
        1.5, // height,
        8 // radialSegments
      ),
      frameMaterial
    );
    topTube.position.set(0, 1.8, 0.1);
    topTube.rotation.x = Math.PI / 2;
    this.bikeGroup.add(topTube);

    const downTube = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.1, // radiusTop,
        0.1, // radiusBottom,
        1.6, // height,
        8 // radialSegments
      ),
      frameMaterial
    );
    downTube.position.set(0, 1.3, 0.2);
    downTube.rotation.x = Math.PI / 3.5;
    this.bikeGroup.add(downTube);

    // Seat tube (vertical)
    const seatTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.3, 8),
      frameMaterial
    );
    seatTube.position.set(0, 1.35, -0.6);
    seatTube.rotation.x = Math.PI / -13;
    seatTube.castShadow = true;
    this.bikeGroup.add(seatTube);

    const seatPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 1.7, 8),
      accentMaterial
    );
    seatPost.position.set(0, 1.55, -0.65);
    seatPost.rotation.x = Math.PI / -13;
    seatPost.castShadow = true;
    this.bikeGroup.add(seatPost);

    // Head tube (angled)
    const headTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.45, 8),
      frameMaterial
    );
    headTube.position.set(0, 1.8, 0.9);
    headTube.rotation.x = Math.PI / -16;
    headTube.castShadow = true;
    this.bikeGroup.add(headTube);

    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.2, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true })
    );
    seat.position.set(0, 2.3, -0.8);
    seat.castShadow = true;
    this.bikeGroup.add(seat);

    // Handlebar stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8),
      accentMaterial
    );
    stem.position.set(0, 1.8, 0.9);
    stem.rotation.x = Math.PI / -16;
    stem.castShadow = true;
    this.bikeGroup.add(stem);

    // Handlebars
    const bars = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.6, 8),
      accentMaterial
    );
    bars.position.set(0, 2.15, 0.85);
    bars.rotation.set(Math.PI / 2, 0, 1.5);
    bars.castShadow = true;
    this.bikeGroup.add(bars);

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
    console.log("✓ Bike created");
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
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += speed;
    });
  }
}
