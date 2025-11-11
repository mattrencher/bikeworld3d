// Bike model - Low poly bicycle
import * as THREE from "three";
import { CONFIG } from "../utils/constants.js";

export class Bike {
  constructor(scene) {
    this.scene = scene;
    this.bikeGroup = new THREE.Group();
    this.wheels = [];
    this.baseY = CONFIG.BIKE_POSITION.y;
    this.baseRotationZ = 0; // Store base rotation for tilt (wheelie effect)
    this.bunnyHopActive = false;
    this.bunnyHopTime = 0;
    this.bunnyHopCooldownTimer = 0;
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

  /**
   * Perform bunny hop animation
   */
  bunnyHop() {
    if (this.bunnyHopActive || this.bunnyHopCooldownTimer > 0) {
      return false;
    }

    this.bunnyHopActive = true;
    this.bunnyHopTime = 0;
    console.log("🐰 Bunny hop!");
    return true;
  }

  /**
   * Update bunny hop animation
   * @param {number} deltaTime - Time since last frame in seconds
   */
  updateBunnyHop(deltaTime) {
    // Update cooldown timer
    if (this.bunnyHopCooldownTimer > 0) {
      this.bunnyHopCooldownTimer -= deltaTime;
    }

    if (!this.bunnyHopActive) return;

    this.bunnyHopTime += deltaTime;

    // Calculate hop progress (0 to 1)
    const progress = this.bunnyHopTime / CONFIG.BUNNY_HOP_DURATION;

    if (progress >= 1) {
      // Hop complete - reset to base state
      this.bunnyHopActive = false;
      this.bikeGroup.position.y = this.baseY;
      this.bikeGroup.rotation.z = this.baseRotationZ;
      this.bunnyHopCooldownTimer = CONFIG.BUNNY_HOP_COOLDOWN;
      return;
    }

    // Parabolic arc for natural jump motion
    // sin gives smooth up and down motion
    const heightMultiplier = Math.sin(progress * Math.PI);
    const hopHeight = heightMultiplier * CONFIG.BUNNY_HOP_HEIGHT;

    this.bikeGroup.position.y = this.baseY + hopHeight;

    // Wheelie tilt: negative Z rotation tilts the bike backward
    // (after Y rotation of 90°, Z axis controls the forward/back tilt)
    const tiltAmount = Math.sin(progress * Math.PI) * -0.25; // Negative for backward tilt
    this.bikeGroup.rotation.z = this.baseRotationZ + tiltAmount;

    // Debug logging
    console.log(
      `🚴 Hop progress: ${(progress * 100).toFixed(
        0
      )}% | Y: ${this.bikeGroup.position.y.toFixed(
        2
      )} | Z rotation: ${this.bikeGroup.rotation.z.toFixed(3)} rad (${(
        this.bikeGroup.rotation.z * 57.3
      ).toFixed(1)}°)`
    );
  }

  /**
   * Check if bunny hop is active
   */
  isBunnyHopping() {
    return this.bunnyHopActive;
  }
}
