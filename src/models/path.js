// Circular path around the city
import * as THREE from "three";
import { CONFIG } from "../utils/constants.js";

export class Path {
  constructor(scene) {
    this.scene = scene;
    this.pathGroup = new THREE.Group();
  }

  /**
   * Create the circular path
   */
  create() {
    // Main circular road
    const pathGeometry = new THREE.RingGeometry(
      CONFIG.PATH_RADIUS - CONFIG.PATH_WIDTH / 2,
      CONFIG.PATH_RADIUS + CONFIG.PATH_WIDTH / 2,
      64
    );

    const pathMaterial = new THREE.MeshLambertMaterial({
      color: CONFIG.PATH_COLOR,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.y = 0.1; // Slightly above ground
    pathMesh.receiveShadow = true;

    this.pathGroup.add(pathMesh);

    // Add lane markings (dashed white lines)
    this.addLaneMarkings();

    this.scene.add(this.pathGroup);
    console.log("✓ Path created");
  }

  /**
   * Add dashed lane markings to the path
   */
  addLaneMarkings() {
    const markingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const segments = 50;
    const angleStep = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
      if (i % 2 === 0) {
        // Create dashed effect
        const angle = angleStep * i;
        const x = Math.cos(angle) * CONFIG.PATH_RADIUS;
        const z = Math.sin(angle) * CONFIG.PATH_RADIUS;

        const markingGeometry = new THREE.BoxGeometry(0.3, 0.05, 2.5);
        const marking = new THREE.Mesh(markingGeometry, markingMaterial);

        marking.position.set(x, 0.15, z);
        marking.rotation.y = -angle;

        this.pathGroup.add(marking);
      }
    }
  }

  /**
   * Get the path group
   */
  getPathGroup() {
    return this.pathGroup;
  }
}
