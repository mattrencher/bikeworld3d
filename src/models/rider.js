// Rider model - Low poly humanoid figure
import * as THREE from "three";

export class Rider {
  constructor(scene, bikeGroup) {
    this.scene = scene;
    this.bikeGroup = bikeGroup;
    this.riderGroup = new THREE.Group();
    this.legs = [];
    this.animationTime = 0;
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
      clothesMaterial
    );
    torso.position.set(0, 2.8, -0.8);
    torso.rotation.x = Math.PI / 12; // Slight lean forward
    torso.castShadow = true;
    this.riderGroup.add(torso);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      skinMaterial
    );
    head.position.set(0, 3.8, -0.7);
    head.castShadow = true;
    this.riderGroup.add(head);

    // Eyes - solid black ovals
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);

    // Left eye
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.scale.set(1, 1.3, 0.6); // Make it oval
    leftEye.position.set(0.15, 3.85, -0.4);
    this.riderGroup.add(leftEye);

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.scale.set(1, 1.3, 0.6); // Make it oval
    rightEye.position.set(-0.15, 3.85, -0.4);
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
        Math.PI * 0.6
      ),
      capMaterial
    );
    const hatScale = 0.65;
    hatDome.scale.set(hatScale, -hatScale * 0.8, hatScale); // Scale up to fit on head
    hatDome.position.set(0, 4.13, -0.7); // Position higher to sit on top
    // hatDome.castShadow = true;
    this.riderGroup.add(hatDome);

    // Cap brim (visor)
    const capBrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.05, 0.7),
      capMaterial
    );
    capBrim.position.set(0, 4.05, -0.35); // Adjusted forward position for longer brim
    capBrim.rotation.x = -Math.PI / 8; // Slight downward angle
    capBrim.castShadow = true;
    this.riderGroup.add(capBrim);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 1.2, 0.2);

    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(0.5, 3.1, -0.3);
    leftArm.rotation.x = Math.PI / -2.7;
    leftArm.castShadow = true;
    this.riderGroup.add(leftArm);

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(-0.5, 3.1, -0.3);
    rightArm.rotation.x = Math.PI / -2.7;
    rightArm.castShadow = true;
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

    // Add rider to bike group so it moves with the bike
    this.bikeGroup.add(this.riderGroup);

    console.log("✓ Rider created");
  }

  /**
   * Animate pedaling motion
   */
  animatePedaling(isMoving) {
    if (!isMoving) return;

    this.animationTime += 0.1;

    if (this.legs.length === 2) {
      // Alternate leg movement (pedaling)
      const leftLegRotation = Math.sin(this.animationTime) * 0.3;
      const rightLegRotation = Math.sin(this.animationTime + Math.PI) * 0.3;

      this.legs[0].rotation.x = leftLegRotation;
      this.legs[1].rotation.x = rightLegRotation;
    }
  }

  /**
   * Get the rider group
   */
  getRiderGroup() {
    return this.riderGroup;
  }
}
