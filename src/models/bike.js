// Bike model - Low poly bicycle
import * as THREE from "three";
import { CONFIG } from "../utils/constants.js";

export class Bike {
  constructor(scene) {
    this.scene = scene;
    this.bikeGroup = new THREE.Group(); // Outer group: position + face-right Y rotation
    this.spinGroup = new THREE.Group(); // Mid group: trick rotations (backflip, 360, tilt)
    this.tiltGroup = new THREE.Group(); // Inner group: wheelie tilt (X rotation)
    this.wheels = [];
    this.baseY = CONFIG.BIKE_POSITION.y;
    this.baseRotationX = 0;

    // Jump state
    this.bunnyHopActive = false;
    this.bunnyHopTime = 0;
    this.bunnyHopCooldownTimer = 0;
    this.jumpCount = 0; // 0 = grounded, 1 = first jump, 2 = double jump
    this.jumpStartY = this.baseY;
    this.currentJumpHeight = CONFIG.BUNNY_HOP_HEIGHT;
    this.currentJumpDuration = CONFIG.BUNNY_HOP_DURATION;

    // Trick state
    this.trick = {
      active: false,
      type: null,
      progress: 0,
      duration: 0,
      style: "full", // 'full' = complete rotation, 'peak' = out-and-back
    };
    this.trickStart = { x: 0, y: 0, z: 0 };
    this.trickTarget = { x: 0, y: 0, z: 0 };
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
    this.tiltGroup.add(frontWheel);

    // Back wheel
    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, 0.8, -1.44);
    backWheel.castShadow = true;
    this.wheels.push(backWheel);
    this.tiltGroup.add(backWheel);

    // Frame parts
    // Top tube (horizontal)
    const topTube = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.1, // radiusTop,
        0.1, // radiusBottom,
        1.5, // height,
        8, // radialSegments
      ),
      frameMaterial,
    );
    topTube.position.set(0, 1.8, 0.1);
    topTube.rotation.x = Math.PI / 2;
    this.tiltGroup.add(topTube);

    const downTube = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.1, // radiusTop,
        0.1, // radiusBottom,
        1.6, // height,
        8, // radialSegments
      ),
      frameMaterial,
    );
    downTube.position.set(0, 1.3, 0.2);
    downTube.rotation.x = Math.PI / 3.5;
    this.tiltGroup.add(downTube);

    // Seat tube (vertical)
    const seatTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.3, 8),
      frameMaterial,
    );
    seatTube.position.set(0, 1.35, -0.6);
    seatTube.rotation.x = Math.PI / -13;
    seatTube.castShadow = true;
    this.tiltGroup.add(seatTube);

    const seatPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 1.7, 8),
      accentMaterial,
    );
    seatPost.position.set(0, 1.55, -0.65);
    seatPost.rotation.x = Math.PI / -13;
    seatPost.castShadow = true;
    this.tiltGroup.add(seatPost);

    // Head tube (angled)
    const headTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.45, 8),
      frameMaterial,
    );
    headTube.position.set(0, 1.8, 0.9);
    headTube.rotation.x = Math.PI / -16;
    headTube.castShadow = true;
    this.tiltGroup.add(headTube);

    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.2, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true }),
    );
    seat.position.set(0, 2.3, -0.8);
    seat.castShadow = true;
    this.tiltGroup.add(seat);

    // Handlebar stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8),
      accentMaterial,
    );
    stem.position.set(0, 1.8, 0.9);
    stem.rotation.x = Math.PI / -16;
    stem.castShadow = true;
    this.tiltGroup.add(stem);

    // Handlebars
    const bars = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.6, 8),
      accentMaterial,
    );
    bars.position.set(0, 2.15, 0.85);
    bars.rotation.set(Math.PI / 2, 0, 1.5);
    bars.castShadow = true;
    this.tiltGroup.add(bars);

    // Build hierarchy: bikeGroup → spinGroup → tiltGroup
    // Offset spinGroup upward to the visual center of the bike+rider (~y=2.0),
    // and tiltGroup back down by the same amount inside spinGroup.
    // This makes all trick rotations pivot around the combined center of mass
    // rather than the wheel-bottom origin.
    const SPIN_PIVOT_Y = 2.0;
    this.spinGroup.position.set(0, SPIN_PIVOT_Y, 0);
    this.tiltGroup.position.set(0, -SPIN_PIVOT_Y, 0);
    this.spinGroup.add(this.tiltGroup);
    this.bikeGroup.add(this.spinGroup);

    // Position the bike
    this.bikeGroup.position.set(
      CONFIG.BIKE_POSITION.x,
      CONFIG.BIKE_POSITION.y,
      CONFIG.BIKE_POSITION.z,
    );

    // Rotate bike to face right (tangent to the circular path)
    this.bikeGroup.rotation.y = Math.PI / 2;

    this.scene.add(this.bikeGroup);
    console.log("✓ Bike created");
  }

  /** Get the outer bike group */
  getBikeGroup() {
    return this.bikeGroup;
  }

  /** Get the spin group (trick rotations) */
  getSpinGroup() {
    return this.spinGroup;
  }

  /** Get the tilt group (for attaching rider) */
  getTiltGroup() {
    return this.tiltGroup;
  }

  /** Get wheels for animation */
  getWheels() {
    return this.wheels;
  }

  /** Animate wheel rotation */
  animateWheels(speed) {
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += speed;
    });
  }

  /**
   * Trigger a jump. Supports double jump when already airborne.
   * @returns {boolean} Whether the jump was accepted
   */
  bunnyHop() {
    if (this.bunnyHopCooldownTimer > 0) return false;

    if (!this.bunnyHopActive) {
      // First jump from ground
      this.bunnyHopActive = true;
      this.bunnyHopTime = 0;
      this.jumpCount = 1;
      this.jumpStartY = this.baseY;
      this.currentJumpHeight = CONFIG.BUNNY_HOP_HEIGHT;
      this.currentJumpDuration = CONFIG.BUNNY_HOP_DURATION;
      console.log("🐰 Bunny hop!");
      return true;
    } else if (this.jumpCount === 1) {
      // Double jump — re-launch from current height with bigger arc
      this.jumpCount = 2;
      this.jumpStartY = this.bikeGroup.position.y;
      this.bunnyHopTime = 0;
      this.currentJumpHeight = CONFIG.DOUBLE_JUMP_HEIGHT;
      this.currentJumpDuration = CONFIG.DOUBLE_JUMP_DURATION;
      // Cancel any in-progress trick so the new jump starts clean
      this._resetTrick();
      console.log("🚀 Double jump!");
      return true;
    }

    return false;
  }

  /**
   * Trigger a BMX trick while airborne.
   * @param {string} type - 'backflip' | '360cw' | '360ccw' | 'superman' | 'nohander' | 'cancan' | 'tailwhip'
   * @returns {boolean} Whether the trick was accepted
   */
  performTrick(type) {
    if (!this.bunnyHopActive) return false;
    if (this.trick.active) return false;

    const TRICKS = {
      backflip: {
        target: { x: -Math.PI * 2, y: 0, z: 0 },
        duration: CONFIG.TRICK_DURATION,
        style: "full",
      },
      "360cw": {
        target: { x: 0, y: -Math.PI * 2, z: 0 },
        duration: CONFIG.TRICK_DURATION,
        style: "full",
      },
      "360ccw": {
        target: { x: 0, y: Math.PI * 2, z: 0 },
        duration: CONFIG.TRICK_DURATION,
        style: "full",
      },
      tailwhip: {
        target: { x: 0, y: Math.PI * 2, z: 0 },
        duration: CONFIG.TAILWHIP_DURATION,
        style: "full",
      },
      superman: {
        target: { x: 0.38, y: 0, z: 0 },
        duration: CONFIG.TRICK_DURATION * 1.5,
        style: "peak",
      },
      nohander: {
        target: { x: 0, y: 0, z: 0.45 },
        duration: CONFIG.TRICK_DURATION * 1.3,
        style: "peak",
      },
      cancan: {
        target: { x: 0, y: 0, z: -0.45 },
        duration: CONFIG.TRICK_DURATION * 1.3,
        style: "peak",
      },
    };

    const def = TRICKS[type];
    if (!def) return false;

    this.trickStart = {
      x: this.spinGroup.rotation.x,
      y: this.spinGroup.rotation.y,
      z: this.spinGroup.rotation.z,
    };
    this.trickTarget = {
      x: this.trickStart.x + def.target.x,
      y: this.trickStart.y + def.target.y,
      z: this.trickStart.z + def.target.z,
    };

    this.trick.active = true;
    this.trick.type = type;
    this.trick.progress = 0;
    this.trick.duration = def.duration;
    this.trick.style = def.style;

    console.log(`🤙 ${type}`);
    return true;
  }

  /**
   * Returns current trick state for syncing rider visuals.
   */
  getTrickInfo() {
    return {
      active: this.trick.active,
      type: this.trick.type,
      progress: this.trick.progress,
      style: this.trick.style,
    };
  }

  /** Whether the bike is currently in the air */
  isAirborne() {
    return this.bunnyHopActive;
  }

  /** Whether a jump animation is active */
  isBunnyHopping() {
    return this.bunnyHopActive;
  }

  /**
   * Update jump and trick animations each frame.
   * @param {number} deltaTime - seconds since last frame
   */
  updateBunnyHop(deltaTime) {
    if (this.bunnyHopCooldownTimer > 0) {
      this.bunnyHopCooldownTimer -= deltaTime;
    }

    if (!this.bunnyHopActive) return;

    this.bunnyHopTime += deltaTime;
    const progress = this.bunnyHopTime / this.currentJumpDuration;

    if (progress >= 1) {
      // Land cleanly
      this.bunnyHopActive = false;
      this.jumpCount = 0;
      this.bikeGroup.position.y = this.baseY;
      this.tiltGroup.rotation.x = this.baseRotationX;
      this.bunnyHopCooldownTimer = CONFIG.BUNNY_HOP_COOLDOWN;
      this._resetTrick();
      return;
    }

    // Arc formula: starts at jumpStartY, peaks mid-air, returns to baseY
    // f(t) = jumpStartY + (baseY - jumpStartY)*t + sin(t*π)*height
    // Works for both normal jumps (jumpStartY == baseY) and double jumps from height
    this.bikeGroup.position.y =
      this.jumpStartY +
      (this.baseY - this.jumpStartY) * progress +
      Math.sin(progress * Math.PI) * this.currentJumpHeight;

    // Subtle wheelie tilt (skip when backflip owns the same axis)
    if (this.trick.type !== "backflip") {
      const tiltAmount = Math.sin(progress * Math.PI) * 0.12;
      this.tiltGroup.rotation.x = this.baseRotationX - tiltAmount;
    }

    this._updateTrick(deltaTime);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _updateTrick(deltaTime) {
    if (!this.trick.active) return;

    this.trick.progress += deltaTime / this.trick.duration;
    const t = Math.min(this.trick.progress, 1.0);

    if (this.trick.style === "full") {
      // Ease in-out for smooth complete rotations
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      this.spinGroup.rotation.x =
        this.trickStart.x + (this.trickTarget.x - this.trickStart.x) * eased;
      this.spinGroup.rotation.y =
        this.trickStart.y + (this.trickTarget.y - this.trickStart.y) * eased;
      this.spinGroup.rotation.z =
        this.trickStart.z + (this.trickTarget.z - this.trickStart.z) * eased;
    } else {
      // Sin curve: peaks at t=0.5 and naturally returns to 0 at t=1
      const peak = Math.sin(t * Math.PI);
      this.spinGroup.rotation.x =
        this.trickStart.x + (this.trickTarget.x - this.trickStart.x) * peak;
      this.spinGroup.rotation.y =
        this.trickStart.y + (this.trickTarget.y - this.trickStart.y) * peak;
      this.spinGroup.rotation.z =
        this.trickStart.z + (this.trickTarget.z - this.trickStart.z) * peak;
    }

    if (t >= 1.0) {
      // Snap to clean neutral on completion
      this.spinGroup.rotation.set(0, 0, 0);
      this.trick.active = false;
      this.trick.type = null;
      this.trick.progress = 0;
    }
  }

  _resetTrick() {
    this.trick.active = false;
    this.trick.type = null;
    this.trick.progress = 0;
    this.spinGroup.rotation.set(0, 0, 0);
  }
}
