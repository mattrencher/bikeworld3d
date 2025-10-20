// Model Loader - Instantiate models in isolation for inspection
import * as THREE from "three";
import { Bike } from "../../models/bike.js";
import { Rider } from "../../models/rider.js";
import { Buildings } from "../../models/buildings.js";
import { Path } from "../../models/path.js";
import { CONFIG } from "../../utils/constants.js";

export class ModelLoader {
  constructor() {
    // Temporary scene for instantiation if models auto-add
    this.tempScene = new THREE.Scene();
  }

  /**
   * Load a model by name
   * @param {string} modelName - 'bike', 'rider', 'building-0', 'path', etc.
   * @returns {THREE.Group} - The model group
   */
  loadModel(modelName) {
    console.log(`Loading model: ${modelName}`);

    if (modelName === "bike") {
      return this.loadBike();
    } else if (modelName === "rider") {
      return this.loadRider();
    } else if (modelName.startsWith("building-")) {
      const index = parseInt(modelName.split("-")[1]);
      return this.loadBuilding(index);
    } else if (modelName === "path") {
      return this.loadPath();
    }

    console.warn(`Unknown model: ${modelName}`);
    return null;
  }

  /**
   * Load the bike model
   */
  loadBike() {
    const bike = new Bike(this.tempScene);
    bike.create();

    // Extract the bike group
    const bikeGroup = bike.getBikeGroup();

    // Remove from temp scene if it was added
    if (bikeGroup.parent) {
      bikeGroup.parent.remove(bikeGroup);
    }

    // Reset position and rotation to origin for inspection
    bikeGroup.position.set(0, 0, 0);
    bikeGroup.rotation.set(0, 0, 0);

    return bikeGroup;
  }

  /**
   * Load the rider model
   */
  loadRider() {
    // Rider needs a bike group as parent, create a dummy one
    const dummyBikeGroup = new THREE.Group();

    const rider = new Rider(this.tempScene, dummyBikeGroup);
    rider.create();

    const riderGroup = rider.getRiderGroup();

    // Extract from dummy parent
    if (riderGroup.parent) {
      riderGroup.parent.remove(riderGroup);
    }

    // Reset position and rotation
    riderGroup.position.set(0, 0, 0);
    riderGroup.rotation.set(0, 0, 0);

    return riderGroup;
  }

  /**
   * Load a specific building by index
   */
  loadBuilding(index) {
    const buildings = new Buildings(this.tempScene);
    buildings.create();

    // Extract specific building from the city group
    const buildingMeshes = buildings.getBuildingMeshes();

    if (index >= 0 && index < buildingMeshes.length) {
      const buildingGroup = buildingMeshes[index];

      // Clone the building so we don't affect the original
      const clonedBuilding = buildingGroup.clone();

      // Reset position and rotation (buildings are positioned in circle)
      clonedBuilding.position.set(0, 0, 0);
      clonedBuilding.rotation.set(0, 0, 0);

      return clonedBuilding;
    }

    console.warn(`Building index ${index} out of range`);
    return null;
  }

  /**
   * Load the circular path
   */
  loadPath() {
    const path = new Path();
    path.create();

    const pathGroup = path.getPathGroup();

    // Remove from parent if it was added
    if (pathGroup.parent) {
      pathGroup.parent.remove(pathGroup);
    }

    // Path is already at origin
    return pathGroup;
  }

  /**
   * Get model metadata (vertices, triangles)
   * @param {THREE.Group} modelGroup
   * @returns {Object} - { vertices, triangles }
   */
  getModelInfo(modelGroup) {
    let vertices = 0;
    let triangles = 0;

    modelGroup.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geo = child.geometry;

        // Count vertices
        if (geo.attributes.position) {
          vertices += geo.attributes.position.count;
        }

        // Count triangles
        if (geo.index) {
          triangles += geo.index.count / 3;
        } else if (geo.attributes.position) {
          triangles += geo.attributes.position.count / 3;
        }
      }
    });

    return {
      vertices: Math.round(vertices),
      triangles: Math.round(triangles),
    };
  }

  /**
   * Get display name for model
   * @param {string} modelName
   * @returns {string}
   */
  getModelDisplayName(modelName) {
    if (modelName === "bike") return "Bike";
    if (modelName === "rider") return "Rider";
    if (modelName === "path") return "Circular Path";

    if (modelName.startsWith("building-")) {
      const index = parseInt(modelName.split("-")[1]);
      if (index >= 0 && index < CONFIG.BUILDINGS.length) {
        return `Building: ${CONFIG.BUILDINGS[index].name}`;
      }
    }

    return "Unknown Model";
  }

  /**
   * Get all available building names
   * @returns {Array} - Array of { value, label }
   */
  getBuildingOptions() {
    return CONFIG.BUILDINGS.map((building, index) => ({
      value: `building-${index}`,
      label: `Building: ${building.name}`,
    }));
  }
}
