// Model Inspector - Main entry point
import "./inspector.css";
import { InspectorScene } from "./inspectorScene.js";
import { ModelLoader } from "./modelLoader.js";
import { DEFAULTMODEL } from "../../utils/constants.js";

const defaultModel = DEFAULTMODEL;

class ModelInspector {
  constructor() {
    this.scene = null;
    this.modelLoader = null;
    this.currentModel = null;
    this.currentModelName = defaultModel;

    // UI elements
    this.modelDropdown = null;
    this.modelNameDisplay = null;
    this.modelDetailsDisplay = null;
  }

  /**
   * Initialize the inspector application
   */
  init() {
    console.log("🔍 Initializing Model Inspector...");

    // Get container
    const container = document.querySelector("#inspector-app");

    if (!container) {
      console.error("Inspector container not found");
      return;
    }

    // Initialize scene
    this.scene = new InspectorScene(container);

    // Initialize model loader
    this.modelLoader = new ModelLoader();

    // Setup UI
    this.setupUI();

    // Load default model
    this.loadModel(defaultModel);

    // Start render loop
    this.animate();

    console.log("✅ Model Inspector initialized successfully!");
    console.log("🖱️ Use mouse to rotate, pan, and zoom");
    console.log("⌨️ Press R to reset camera");
  }

  /**
   * Setup UI elements and event listeners
   */
  setupUI() {
    // Get UI elements
    this.modelDropdown = document.getElementById("model-dropdown");
    this.modelNameDisplay = document.getElementById("model-name");
    this.modelDetailsDisplay = document.getElementById("model-details");

    if (
      !this.modelDropdown ||
      !this.modelNameDisplay ||
      !this.modelDetailsDisplay
    ) {
      console.error("UI elements not found");
      return;
    }

    // Populate building options dynamically
    this.populateBuildingOptions();

    // Event listener for model selection
    this.modelDropdown.addEventListener("change", (e) => {
      this.loadModel(e.target.value);
    });

    console.log("✓ UI initialized");
  }

  /**
   * Populate building options in dropdown
   */
  populateBuildingOptions() {
    // Get building options from model loader
    const buildingOptions = this.modelLoader.getBuildingOptions();

    // Find the rider option to insert buildings after it
    const riderOption = Array.from(this.modelDropdown.options).find(
      (opt) => opt.value === defaultModel
    );

    // Add all building options
    buildingOptions.forEach((building) => {
      const option = document.createElement("option");
      option.value = building.value;
      option.textContent = building.label;

      // Insert after rider option
      if (riderOption && riderOption.nextSibling) {
        this.modelDropdown.insertBefore(option, riderOption.nextSibling);
      } else {
        this.modelDropdown.appendChild(option);
      }
    });

    console.log(`✓ Added ${buildingOptions.length} building options`);
  }

  /**
   * Load a model by name
   * @param {string} modelName - 'bike', 'rider', 'building-0', etc.
   */
  loadModel(modelName) {
    console.log(`📦 Loading model: ${modelName}`);

    // Load model
    const modelGroup = this.modelLoader.loadModel(modelName);

    if (!modelGroup) {
      console.error(`Failed to load model: ${modelName}`);
      return;
    }

    // Set model in scene
    this.scene.setModel(modelGroup);
    this.currentModel = modelGroup;
    this.currentModelName = modelName;

    // Update UI
    this.updateUI(modelName);

    // Update dropdown selection
    this.modelDropdown.value = modelName;
  }

  /**
   * Update UI with model information
   * @param {string} modelName
   */
  updateUI(modelName) {
    // Update model name
    const displayName = this.modelLoader.getModelDisplayName(modelName);
    this.modelNameDisplay.textContent = displayName;

    // Update model info (vertices and triangles)
    if (this.currentModel) {
      const info = this.modelLoader.getModelInfo(this.currentModel);
      this.modelDetailsDisplay.textContent = `Vertices: ${info.vertices.toLocaleString()} | Triangles: ${info.triangles.toLocaleString()}`;
    }
  }

  /**
   * Main animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    this.scene.render();
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const inspector = new ModelInspector();
    inspector.init();
  });
} else {
  const inspector = new ModelInspector();
  inspector.init();
}
