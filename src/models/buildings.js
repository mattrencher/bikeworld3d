// Buildings - City structure with 8 menu buildings
import * as THREE from 'three';
import { CONFIG } from '../utils/constants.js';

export class Buildings {
  constructor(scene) {
    this.scene = scene;
    this.cityGroup = new THREE.Group();
    this.buildings = [];
    this.buildingMeshes = [];
  }

  /**
   * Create all 8 buildings in a circular formation
   */
  create() {
    const angleStep = (Math.PI * 2) / CONFIG.BUILDING_COUNT;

    CONFIG.BUILDINGS.forEach((buildingData, index) => {
      const angle = angleStep * index;
      const building = this.createBuilding(buildingData, angle, index);
      this.buildings.push({ ...buildingData, angle, index, mesh: building });
      this.buildingMeshes.push(building);
      this.cityGroup.add(building);
    });

    this.scene.add(this.cityGroup);
    console.log(`✓ Created ${CONFIG.BUILDING_COUNT} buildings`);
  }

  /**
   * Create a single building
   */
  createBuilding(buildingData, angle, index) {
    const buildingGroup = new THREE.Group();

    // Calculate position on circle
    const x = Math.cos(angle) * CONFIG.CITY_RADIUS;
    const z = Math.sin(angle) * CONFIG.CITY_RADIUS;

    // Main building body
    const width = 8 + Math.random() * 4;
    const height = buildingData.height;
    const depth = 8 + Math.random() * 4;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ 
      color: buildingData.color,
      flatShading: true,
      emissive: buildingData.color,
      emissiveIntensity: 0.1
    });
    
    const buildingMesh = new THREE.Mesh(geometry, material);
    buildingMesh.position.y = height / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    
    // Store building data on mesh for raycasting
    buildingMesh.userData = {
      buildingName: buildingData.name,
      buildingIndex: index,
      isBuilding: true,
      originalColor: buildingData.color,
      originalScale: 1
    };

    buildingGroup.add(buildingMesh);

    // Add a simple roof
    const roofGeometry = new THREE.ConeGeometry(width * 0.7, 4, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8B4513,
      flatShading: true 
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    buildingGroup.add(roof);

    // Add windows (simple rectangles)
    this.addWindows(buildingGroup, width, height, depth, buildingData.color);

    // Position the building group
    buildingGroup.position.set(x, 0, z);
    
    // Rotate building to face outward (away from center)
    buildingGroup.lookAt(0, 0, 0);
    buildingGroup.rotateY(Math.PI); // Rotate 180 degrees to face outward

    return buildingGroup;
  }

  /**
   * Add simple window details to buildings
   */
  addWindows(buildingGroup, width, height, depth, buildingColor) {
    const windowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFAA,
      emissive: 0xFFFFAA,
      emissiveIntensity: 0.3
    });

    // Front-facing windows
    const rows = Math.floor(height / 4);
    const cols = 3;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const windowGeometry = new THREE.PlaneGeometry(1, 1.5);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        
        const x = (col - 1) * 2;
        const y = (row + 1) * 4;
        
        window.position.set(x, y, depth / 2 + 0.01);
        buildingGroup.add(window);
      }
    }
  }

  /**
   * Get the city group for rotation
   */
  getCityGroup() {
    return this.cityGroup;
  }

  /**
   * Get building meshes for raycasting
   */
  getBuildingMeshes() {
    return this.buildingMeshes;
  }

  /**
   * Get all buildings data
   */
  getBuildings() {
    return this.buildings;
  }

  /**
   * Highlight a specific building
   */
  highlightBuilding(index) {
    this.buildingMeshes.forEach((building, i) => {
      const mainMesh = building.children[0]; // Get the main building mesh
      if (i === index) {
        mainMesh.material.emissiveIntensity = 0.4;
        building.scale.set(
          CONFIG.HIGHLIGHT_SCALE,
          CONFIG.HIGHLIGHT_SCALE,
          CONFIG.HIGHLIGHT_SCALE
        );
      } else {
        mainMesh.material.emissiveIntensity = 0.1;
        building.scale.set(1, 1, 1);
      }
    });
  }

  /**
   * Reset all building highlights
   */
  resetHighlights() {
    this.buildingMeshes.forEach((building) => {
      const mainMesh = building.children[0];
      mainMesh.material.emissiveIntensity = 0.1;
      building.scale.set(1, 1, 1);
    });
  }
}
