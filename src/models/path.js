// Circular path around the city
import * as THREE from "three";
import { CONFIG } from "../utils/constants.js";

export class Path {
  constructor() {
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
      64,
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

    const innerR = CONFIG.PATH_RADIUS - CONFIG.PATH_WIDTH / 2;
    const outerR = CONFIG.PATH_RADIUS + CONFIG.PATH_WIDTH / 2;
    this.addEdgeStripes(innerR, outerR);
    // this.addChevrons();
    this.addLampPosts(outerR);
    // this.addGroundSpokes(innerR);

    // Do not add pathGroup to the scene here.
    // The caller should add or parent the pathGroup (for example, under the buildings' city group)
    console.log("✓ Path created (not added to scene)");
  }

  /**
   * Add dashed center lane markings to the path
   */
  addLaneMarkings() {
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const markingGeometry = new THREE.BoxGeometry(0.4, 0.05, 3.0);
    const segments = 50;
    const angleStep = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
      if (i % 2 === 0) {
        const angle = angleStep * i;
        const x = Math.cos(angle) * CONFIG.PATH_RADIUS;
        const z = Math.sin(angle) * CONFIG.PATH_RADIUS;
        const marking = new THREE.Mesh(markingGeometry, markingMaterial);
        marking.position.set(x, 0.15, z);
        marking.rotation.y = -angle;
        this.pathGroup.add(marking);
      }
    }
  }

  /**
   * Solid white edge lines at inner and outer path boundaries.
   * @param {number} innerR
   * @param {number} outerR
   */
  addEdgeStripes(innerR, outerR) {
    const stripeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    const innerLine = new THREE.Mesh(
      new THREE.RingGeometry(innerR - 0.35, innerR, 64),
      stripeMat,
    );
    innerLine.rotation.x = -Math.PI / 2;
    innerLine.position.y = 0.12;
    this.pathGroup.add(innerLine);

    const outerLine = new THREE.Mesh(
      new THREE.RingGeometry(outerR, outerR + 0.35, 64),
      stripeMat,
    );
    outerLine.rotation.x = -Math.PI / 2;
    outerLine.position.y = 0.12;
    this.pathGroup.add(outerLine);
  }

  /**
   * Directional chevron arrows painted on the road surface between buildings.
   */
  addChevrons() {
    const chevMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const barGeometry = new THREE.BoxGeometry(1.6, 0.06, 0.35);
    const segments = CONFIG.BUILDING_COUNT;
    const angleStep = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
      const angle = angleStep * i + angleStep / 2;
      const x = Math.cos(angle) * CONFIG.PATH_RADIUS;
      const z = Math.sin(angle) * CONFIG.PATH_RADIUS;

      for (const side of [-1, 1]) {
        const bar = new THREE.Mesh(barGeometry, chevMat);
        bar.position.set(x, 0.16, z);
        bar.rotation.y = -angle + side * 0.5;
        this.pathGroup.add(bar);
      }
    }
  }

  /**
   * Lamp posts around the outer edge of the path.
   * @param {number} outerR
   */
  addLampPosts(outerR) {
    const postR = outerR + 2;
    const count = 16;
    const angleStep = (Math.PI * 2) / count;
    const poleMat = new THREE.MeshLambertMaterial({
      color: 0x999999,
      flatShading: true,
    });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.15, 5, 6);
    const headGeometry = new THREE.SphereGeometry(0.35, 8, 6);

    for (let i = 0; i < count; i++) {
      const angle = angleStep * i;
      const post = new THREE.Group();

      const pole = new THREE.Mesh(poleGeometry, poleMat);
      pole.position.y = 2.5;
      pole.castShadow = true;
      post.add(pole);

      const head = new THREE.Mesh(headGeometry, lightMat);
      head.position.y = 5.4;
      post.add(head);

      post.position.set(Math.cos(angle) * postR, 0, Math.sin(angle) * postR);
      this.pathGroup.add(post);
    }
  }

  /**
   * Radial spokes on the inner ground. Because they live in pathGroup they rotate
   * with the city, strongly amplifying the sense of rotational speed.
   * @param {number} innerR - spokes extend from the origin outward to this radius
   */
  addGroundSpokes(innerR) {
    const spokeMat = new THREE.MeshBasicMaterial({ color: 0x3a6b3e });
    const count = 24;
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const angle = angleStep * i;
      const spokeGroup = new THREE.Group();

      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.04, innerR),
        spokeMat,
      );
      // Shift so the spoke extends from near-center outward to innerR
      spoke.position.z = innerR / 2;
      spokeGroup.add(spoke);
      spokeGroup.rotation.y = angle;
      spokeGroup.position.y = 0.06;
      this.pathGroup.add(spokeGroup);
    }
  }

  /**
   * Get the path group
   */
  getPathGroup() {
    return this.pathGroup;
  }
}
