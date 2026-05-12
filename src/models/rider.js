// Rider model - Low poly humanoid figure
import * as THREE from "three";

export class Rider {
  constructor(scene, tiltGroup) {
    this.scene = scene;
    this.tiltGroup = tiltGroup;
    this.riderGroup = new THREE.Group();
    this.legs = [];
    this.arms = [];
    this.animationTime = 0;
    this.trickState = null; // current trick type, or null
    this.trickWasActive = false;
    this.ARM_BASE_ROTATION_X = -Math.PI / 3.2;
  }

  /**
   * Create the rider
   */
  create() {
    const skinColor = 0xffdbac;
    const clothesColor = 0x2e5090;

    const skinMaterial = new THREE.MeshLambertMaterial({
      color: skinColor,
      flatShading: true,
    });
    const clothesMaterial = new THREE.MeshLambertMaterial({
      color: clothesColor,
      flatShading: true,
    });

    // Torso
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.5),
      clothesMaterial,
    );
    torso.position.set(0, 2.7, -0.55);
    torso.rotation.x = Math.PI / 8; // Moderate forward lean
    torso.castShadow = true;
    this.riderGroup.add(torso);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      skinMaterial,
    );
    head.position.set(0, 3.7, -0.4);
    head.castShadow = true;
    this.riderGroup.add(head);

    // Eyes - solid black ovals
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);

    // Left eye
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.scale.set(1, 1.3, 0.6); // Make it oval
    leftEye.position.set(0.15, 3.75, -0.1);
    this.riderGroup.add(leftEye);

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.scale.set(1, 1.3, 0.6);
    rightEye.position.set(-0.15, 3.75, -0.1);
    this.riderGroup.add(rightEye);

    // Ball Cap - basic baseball cap
    const capMaterial = new THREE.MeshLambertMaterial({
      color: 0xff3333,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    // Cap crown (rounded top)
    // const capCrown = new THREE.Mesh(
    //   new THREE.SphereGeometry(0.4, 8, 8),
    //   capMaterial
    // );
    // capCrown.scale.set(1.3, 0.8, 1.3); // Scale up to fit on head
    // capCrown.position.set(0, 4.25, -0.7); // Position higher to sit on top
    // capCrown.castShadow = true;
    // this.riderGroup.add(capCrown);

    const hatDome = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.7,
        50,
        20,
        Math.PI * 0.34,
        Math.PI * 2.0,
        Math.PI * 0.99,
        Math.PI * 0.6,
      ),
      capMaterial,
    );
    const hatScale = 0.65;
    hatDome.scale.set(hatScale, -hatScale * 0.8, hatScale);
    hatDome.position.set(0, 4.05, -0.4);
    // hatDome.castShadow = true;
    this.riderGroup.add(hatDome);

    // Cap brim (visor)
    const capBrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.05, 0.7),
      capMaterial,
    );
    capBrim.position.set(0, 3.97, 0.05);
    capBrim.rotation.x = -Math.PI / 8;
    capBrim.castShadow = true;
    this.riderGroup.add(capBrim);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 1.1, 0.2);

    // Left arm — pivot shifted forward, steeper angle so tips still reach handlebars
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(0.5, 2.75, 0.15);
    leftArm.rotation.x = -Math.PI / 3.2;
    leftArm.castShadow = true;
    this.arms.push(leftArm);
    this.riderGroup.add(leftArm);

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(-0.5, 2.75, 0.15);
    rightArm.rotation.x = -Math.PI / 3.2;
    rightArm.castShadow = true;
    this.arms.push(rightArm);
    this.riderGroup.add(rightArm);

    // Legs (for pedaling animation)
    const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);

    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, clothesMaterial);
    leftLeg.position.set(0.25, 1.8, -0.8);
    leftLeg.castShadow = true;
    this.legs.push(leftLeg);
    this.riderGroup.add(leftLeg);

    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, clothesMaterial);
    rightLeg.position.set(-0.25, 1.8, -0.8);
    rightLeg.castShadow = true;
    this.legs.push(rightLeg);
    this.riderGroup.add(rightLeg);

    // Add rider to tilt group so it tilts with the bike during wheelie
    this.tiltGroup.add(this.riderGroup);

    console.log("✓ Rider created and attached to tilt group");
  }

  /**
   * Animate pedaling motion
   * @param {boolean} isMoving
   * @param {boolean} isBunnyHopping
   * @param {number} deltaTime - seconds since last frame
   */
  animatePedaling(isMoving, isBunnyHopping = false, deltaTime = 0) {
    if (!isMoving || isBunnyHopping) return;

    // Let updateTrick handle legs for tricks that use them
    if (this.trickState === "superman" || this.trickState === "cancan") return;

    // 6 rad/sec pedal cadence, scaled by delta time to be framerate-independent
    this.animationTime += deltaTime * 6;

    if (this.legs.length === 2) {
      // Alternate leg movement (pedaling)
      this.legs[0].rotation.x = Math.sin(this.animationTime) * 0.3;
      this.legs[1].rotation.x = Math.sin(this.animationTime + Math.PI) * 0.3;
    }
  }

  /**
   * Sync rider body pose to current bike trick state each frame.
   * @param {{ active: boolean, type: string|null, progress: number, style: string }} trickInfo
   */
  updateTrick(trickInfo) {
    const wasActive = this.trickWasActive;
    this.trickWasActive = trickInfo.active;
    this.trickState = trickInfo.active ? trickInfo.type : null;

    if (!trickInfo.active) {
      if (wasActive) this._resetTrickPose();
      return;
    }

    const t = trickInfo.progress;
    // Both 'full' and 'peak' tricks use a sin arc so body poses always
    // return cleanly to 0 by the end — no snap on completion.
    const intensity = Math.sin(Math.min(t, 1) * Math.PI);

    switch (trickInfo.type) {
      case "backflip":
        // Lean back with the rotation
        this.riderGroup.rotation.x = intensity * -0.7;
        break;

      case "superman":
        // Body extends back, arms reach forward
        this.riderGroup.rotation.x = intensity * 0.9;
        if (this.arms.length === 2) {
          this.arms[0].rotation.x = this.ARM_BASE_ROTATION_X + intensity * -1.0;
          this.arms[1].rotation.x = this.ARM_BASE_ROTATION_X + intensity * -1.0;
        }
        if (this.legs.length === 2) {
          this.legs[0].rotation.x = intensity * -0.5;
          this.legs[1].rotation.x = intensity * -0.5;
        }
        break;

      case "nohander":
        // Arms fly out to the sides
        if (this.arms.length === 2) {
          this.arms[0].rotation.z = intensity * 1.3;
          this.arms[1].rotation.z = intensity * -1.3;
        }
        break;

      case "cancan":
        // Left leg kicks out sideways
        if (this.legs.length === 2) {
          this.legs[0].rotation.z = intensity * 1.1;
          this.legs[0].rotation.x = intensity * 0.3;
        }
        break;

      case "360cw":
      case "360ccw":
      case "tailwhip":
        // Subtle body lean into the spin
        this.riderGroup.rotation.z = intensity * 0.15;
        break;
    }
  }

  /**
   * Reset rider body to neutral pose after a trick.
   */
  _resetTrickPose() {
    this.riderGroup.rotation.set(0, 0, 0);
    this.arms.forEach((arm) => {
      arm.rotation.set(this.ARM_BASE_ROTATION_X, 0, 0);
    });
    this.legs.forEach((leg) => {
      leg.rotation.set(0, 0, 0);
    });
  }

  /**
   * Get the rider group
   */
  getRiderGroup() {
    return this.riderGroup;
  }
}
