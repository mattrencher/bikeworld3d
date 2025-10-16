// Rider model - Low poly humanoid figure
import * as THREE from 'three';

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
    const skinColor = 0xFFDBAC;
    const clothesColor = 0x2E5090;
    
    const skinMaterial = new THREE.MeshLambertMaterial({ 
      color: skinColor,
      flatShading: true 
    });
    const clothesMaterial = new THREE.MeshLambertMaterial({ 
      color: clothesColor,
      flatShading: true 
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

    // Helmet
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xFF3333, flatShading: true })
    );
    helmet.position.set(0, 4.1, -0.7);
    helmet.scale.set(1, 0.8, 1.1);
    helmet.castShadow = true;
    this.riderGroup.add(helmet);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 0.9, 0.2);
    
    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(0.5, 2.8, -0.5);
    leftArm.rotation.x = Math.PI / 4;
    leftArm.castShadow = true;
    this.riderGroup.add(leftArm);
    
    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(-0.5, 2.8, -0.5);
    rightArm.rotation.x = Math.PI / 4;
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
    
    console.log('✓ Rider created');
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
