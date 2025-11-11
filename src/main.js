// BikeWorld3D - Main entry point
import "./style.css";
import { SceneSetup } from "./scene/sceneSetup.js";
import { Buildings } from "./models/buildings.js";
import { Path } from "./models/path.js";
import { Bike } from "./models/bike.js";
import { Rider } from "./models/rider.js";
import { Navigation } from "./navigation/navigation.js";
import { ScrollHandler } from "./navigation/scrollHandler.js";
import { MenuSystem } from "./navigation/menuSystem.js";
import { AnimationManager } from "./utils/animations.js";

class BikeWorld3D {
  constructor() {
    this.sceneSetup = null;
    this.buildings = null;
    this.path = null;
    this.bike = null;
    this.rider = null;
    this.navigation = null;
    this.scrollHandler = null;
    this.menuSystem = null;
    this.animationManager = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log("🚴 Initializing BikeWorld3D...");

    // Get container
    const container = document.querySelector("#app");

    // Initialize scene
    this.sceneSetup = new SceneSetup();
    this.sceneSetup.init(container);

    // Create world elements
    this.createWorld();

    // Initialize navigation system
    this.setupNavigation();

    // Start render loop
    this.animate();

    console.log("✅ BikeWorld3D initialized successfully!");
    console.log("📜 Scroll to navigate around the city");
    console.log("🖱️ Click on buildings to view content");
  }

  /**
   * Create all 3D world elements
   */
  createWorld() {
    const scene = this.sceneSetup.getScene();

    // Create path
    this.path = new Path();
    this.path.create();

    // Create buildings
    this.buildings = new Buildings(scene);
    this.buildings.create();

    // Get city group for parenting elements
    const cityGroup = this.buildings.getCityGroup();

    // Parent the path to the city group so it rotates together with buildings
    try {
      const pathGroup = this.path.getPathGroup();
      // Ensure pathGroup exists and add it under the city group so it rotates with buildings
      if (pathGroup && cityGroup) {
        cityGroup.add(pathGroup);
        console.log("\u2713 Path parented to city group");
      }
    } catch (err) {
      console.warn("Could not parent path to city group:", err);
    }

    // Load HDR environment and attach to city group
    this.sceneSetup.loadHDREnvironment(cityGroup);

    // Create bike
    this.bike = new Bike(scene);
    this.bike.create();

    // Create rider
    this.rider = new Rider(scene, this.bike.getBikeGroup());
    this.rider.create();
  }

  /**
   * Setup navigation and interaction systems
   */
  setupNavigation() {
    const cityGroup = this.buildings.getCityGroup();
    const camera = this.sceneSetup.getCamera();

    // Navigation controller
    this.navigation = new Navigation(cityGroup, this.buildings);

    // Scroll handler
    this.scrollHandler = new ScrollHandler(this.navigation);
    this.scrollHandler.init();

    // Menu system
    this.menuSystem = new MenuSystem(camera, this.buildings, this.navigation);
    this.menuSystem.init();

    // Animation manager
    this.animationManager = new AnimationManager(this.bike, this.rider);
  }

  /**
   * Main animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    // Update navigation (city rotation)
    this.navigation.update();

    // Update menu system (building highlights and UI)
    this.menuSystem.update();

    // Update animations (bike wheels, rider pedaling)
    const isMoving = this.navigation.getIsRotating();
    this.animationManager.update(isMoving);

    // Render scene
    this.sceneSetup.render();
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const app = new BikeWorld3D();
    app.init();
  });
} else {
  const app = new BikeWorld3D();
  app.init();
}
