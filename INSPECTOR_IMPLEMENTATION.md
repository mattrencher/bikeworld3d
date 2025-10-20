# Model Inspector Page - Implementation Approach

## Overview

Create a separate page (`/inspector.html`) for inspecting individual 3D models from the BikeWorld3D project. This page will allow developers and designers to view, rotate, and examine each model in isolation.

---

## Architecture

### 1. Directory Structure

```
bikeworld3d/
├── index.html                    # Main app entry point
├── inspector.html                # NEW - Inspector page entry point
├── src/
│   ├── main.js                   # Main app
│   ├── style.css                 # Main app styles
│   ├── pages/
│   │   └── inspector/
│   │       ├── inspector.js      # NEW - Inspector app entry
│   │       ├── inspector.css     # NEW - Inspector styles
│   │       ├── modelLoader.js    # NEW - Model instantiation utility
│   │       └── inspectorScene.js # NEW - Dedicated scene setup
│   ├── models/                   # EXISTING - Reuse these
│   │   ├── bike.js
│   │   ├── rider.js
│   │   ├── buildings.js
│   │   └── path.js
│   └── utils/
│       └── constants.js          # EXISTING - Reuse constants
├── vite.config.js                # UPDATE - Add multi-page support
└── package.json                  # UPDATE - Add OrbitControls dependency
```

---

## Implementation Details

### 2. Vite Multi-Page Configuration

**File:** `vite.config.js` (create if doesn't exist)

```javascript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        inspector: resolve(__dirname, "inspector.html"),
      },
    },
  },
});
```

**Why:** Vite needs to know about multiple HTML entry points for building and dev server.

---

### 3. Inspector HTML Page

**File:** `inspector.html`

**Key Features:**

- Separate HTML file at root level
- Full-screen canvas with UI overlay
- Model selector dropdown/sidebar
- Control hints (rotate, zoom, pan)
- Link back to main app

**Structure:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BikeWorld3D - Model Inspector</title>
  </head>
  <body>
    <div id="inspector-app"></div>

    <!-- UI Overlay -->
    <div id="inspector-ui">
      <!-- Model Selector Sidebar -->
      <div id="model-selector">
        <h2>Select Model</h2>
        <select id="model-dropdown">
          <option value="bike">Bike</option>
          <option value="rider">Rider</option>
          <option value="building-0">Building: Home</option>
          <option value="building-1">Building: About</option>
          <!-- ... all 8 buildings -->
          <option value="path">Path</option>
        </select>
      </div>

      <!-- Info Panel -->
      <div id="model-info">
        <h3 id="model-name">Bike</h3>
        <p id="model-details">Vertices: 0 | Triangles: 0</p>
      </div>

      <!-- Controls Hint -->
      <div id="controls-hint">
        <p><strong>Controls:</strong></p>
        <p>Left Mouse: Rotate</p>
        <p>Right Mouse: Pan</p>
        <p>Scroll: Zoom</p>
      </div>

      <!-- Navigation -->
      <a href="/" id="back-link">← Back to App</a>
    </div>

    <script type="module" src="/src/pages/inspector/inspector.js"></script>
  </body>
</html>
```

---

### 4. Inspector Scene Setup

**File:** `src/pages/inspector/inspectorScene.js`

**Purpose:** Create a clean scene optimized for model inspection (not the main city scene).

**Features:**

```javascript
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class InspectorScene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a); // Dark background

    // Camera - perspective with wider FOV for inspection
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls for inspection
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Smooth motion
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;
    this.controls.target.set(0, 2, 0); // Look at model center height

    // Lighting - bright and even for inspection
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Add another light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);

    // Grid helper for reference
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    this.scene.add(gridHelper);

    // Axis helper for orientation
    const axisHelper = new THREE.AxesHelper(5);
    this.scene.add(axisHelper);

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.controls.update(); // Update damping
    this.renderer.render(this.scene, this.camera);
  }

  // Add model to scene and center camera on it
  setModel(modelGroup) {
    // Remove any existing models (keep grid and lights)
    const existingModels = this.scene.children.filter(
      (child) => child.type === "Group" && child.userData.isModel
    );
    existingModels.forEach((model) => this.scene.remove(model));

    // Add new model
    modelGroup.userData.isModel = true;
    this.scene.add(modelGroup);

    // Calculate bounding box to center camera
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Reset controls target to model center
    this.controls.target.copy(center);

    // Position camera based on model size
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    this.camera.position.set(
      center.x + distance,
      center.y + distance * 0.5,
      center.z + distance
    );

    this.controls.update();
  }

  getScene() {
    return this.scene;
  }
}
```

**Key Design Decisions:**

- Dark background to make models pop
- Grid and axis helpers for spatial reference
- OrbitControls with damping for smooth rotation
- Auto-centering and camera positioning based on model bounds
- Even lighting from multiple angles (no dramatic shadows)

---

### 5. Model Loader Utility

**File:** `src/pages/inspector/modelLoader.js`

**Purpose:** Instantiate models in isolation without main scene dependencies.

**Challenge:** Current model classes (`Bike`, `Rider`, `Buildings`) call `scene.add()` in their constructors. We need to:

1. Create models without adding to scene automatically, OR
2. Create a temporary scene, instantiate, extract the group, then use it

**Approach A (Preferred - Modify Model Classes):**

```javascript
// Modify existing model classes to NOT auto-add to scene
// Already done for Path, can extend to others
```

**Approach B (Current - Work with Existing Code):**

```javascript
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
   * @param {string} modelName - 'bike', 'rider', 'building-0', etc.
   * @returns {THREE.Group} - The model group
   */
  loadModel(modelName) {
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

    return null;
  }

  loadBike() {
    const bike = new Bike(this.tempScene);
    bike.create();

    // Extract the bike group
    const bikeGroup = bike.getBikeGroup();

    // Remove from temp scene if it was added
    if (bikeGroup.parent) {
      bikeGroup.parent.remove(bikeGroup);
    }

    // Reset position to origin for inspection
    bikeGroup.position.set(0, 0, 0);
    bikeGroup.rotation.set(0, 0, 0);

    return bikeGroup;
  }

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

    // Reset position
    riderGroup.position.set(0, 0, 0);
    riderGroup.rotation.set(0, 0, 0);

    return riderGroup;
  }

  loadBuilding(index) {
    const buildings = new Buildings(this.tempScene);
    buildings.create();

    // Extract specific building from the city group
    const cityGroup = buildings.getCityGroup();
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

    return null;
  }

  loadPath() {
    const path = new Path();
    path.create();

    const pathGroup = path.getPathGroup();

    if (pathGroup.parent) {
      pathGroup.parent.remove(pathGroup);
    }

    return pathGroup;
  }

  /**
   * Get model metadata (name, vertex count, etc.)
   */
  getModelInfo(modelGroup) {
    let vertices = 0;
    let triangles = 0;

    modelGroup.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geo = child.geometry;
        if (geo.attributes.position) {
          vertices += geo.attributes.position.count;
        }
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
   */
  getModelDisplayName(modelName) {
    if (modelName === "bike") return "Bike";
    if (modelName === "rider") return "Rider";
    if (modelName === "path") return "Circular Path";
    if (modelName.startsWith("building-")) {
      const index = parseInt(modelName.split("-")[1]);
      return `Building: ${CONFIG.BUILDINGS[index].name}`;
    }
    return "Unknown";
  }
}
```

---

### 6. Main Inspector Application

**File:** `src/pages/inspector/inspector.js`

**Purpose:** Main entry point that wires everything together.

```javascript
import "./inspector.css";
import { InspectorScene } from "./inspectorScene.js";
import { ModelLoader } from "./modelLoader.js";
import { CONFIG } from "../../utils/constants.js";

class ModelInspector {
  constructor() {
    this.scene = null;
    this.modelLoader = null;
    this.currentModel = null;

    // UI elements
    this.modelDropdown = null;
    this.modelNameDisplay = null;
    this.modelDetailsDisplay = null;
  }

  init() {
    console.log("🔍 Initializing Model Inspector...");

    // Get container
    const container = document.querySelector("#inspector-app");

    // Initialize scene
    this.scene = new InspectorScene(container);

    // Initialize model loader
    this.modelLoader = new ModelLoader();

    // Setup UI
    this.setupUI();

    // Load default model (bike)
    this.loadModel("bike");

    // Start render loop
    this.animate();

    console.log("✅ Model Inspector initialized");
  }

  setupUI() {
    // Get UI elements
    this.modelDropdown = document.getElementById("model-dropdown");
    this.modelNameDisplay = document.getElementById("model-name");
    this.modelDetailsDisplay = document.getElementById("model-details");

    // Populate building options dynamically
    this.populateBuildingOptions();

    // Event listener for model selection
    this.modelDropdown.addEventListener("change", (e) => {
      this.loadModel(e.target.value);
    });
  }

  populateBuildingOptions() {
    // Find the option after 'rider'
    const riderOption = Array.from(this.modelDropdown.options).find(
      (opt) => opt.value === "rider"
    );

    // Add all building options
    CONFIG.BUILDINGS.forEach((building, index) => {
      const option = document.createElement("option");
      option.value = `building-${index}`;
      option.textContent = `Building: ${building.name}`;

      // Insert after rider
      if (riderOption) {
        riderOption.insertAdjacentElement("afterend", option);
      } else {
        this.modelDropdown.appendChild(option);
      }
    });
  }

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

    // Update UI
    this.updateUI(modelName);
  }

  updateUI(modelName) {
    // Update model name
    const displayName = this.modelLoader.getModelDisplayName(modelName);
    this.modelNameDisplay.textContent = displayName;

    // Update model info
    const info = this.modelLoader.getModelInfo(this.currentModel);
    this.modelDetailsDisplay.textContent = `Vertices: ${info.vertices.toLocaleString()} | Triangles: ${info.triangles.toLocaleString()}`;
  }

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
```

---

### 7. Inspector Styles

**File:** `src/pages/inspector/inspector.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  background: #1a1a1a;
  color: #ffffff;
}

#inspector-app {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}

#inspector-ui {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

/* Model Selector Sidebar */
#model-selector {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 10px;
  min-width: 250px;
  pointer-events: auto;
}

#model-selector h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #4a90e2;
}

#model-dropdown {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  background: #2a2a2a;
  color: #ffffff;
  border: 1px solid #444;
  border-radius: 5px;
  cursor: pointer;
}

#model-dropdown:hover {
  background: #333;
}

/* Model Info Panel */
#model-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  border-radius: 10px;
  pointer-events: auto;
}

#model-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #4a90e2;
}

#model-info p {
  font-size: 12px;
  color: #aaa;
}

/* Controls Hint */
#controls-hint {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  border-radius: 10px;
  pointer-events: auto;
  font-size: 12px;
}

#controls-hint p {
  margin: 4px 0;
  color: #ccc;
}

#controls-hint strong {
  color: #4a90e2;
  font-size: 14px;
}

/* Back Link */
#back-link {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(74, 144, 226, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  pointer-events: auto;
  transition: background 0.3s ease;
}

#back-link:hover {
  background: rgba(74, 144, 226, 1);
}

/* Responsive */
@media (max-width: 768px) {
  #model-selector,
  #model-info,
  #controls-hint {
    max-width: calc(100% - 40px);
  }

  #controls-hint {
    top: auto;
    bottom: 100px;
    right: 20px;
  }
}
```

---

### 8. Add Navigation Link to Main App

**File:** `index.html` (update)

Add a link to the inspector page in the main app's UI overlay:

```html
<div id="ui-overlay">
  <!-- Existing content -->

  <!-- NEW: Inspector Link -->
  <a href="/inspector.html" id="inspector-link" class="nav-link">
    🔍 Model Inspector
  </a>
</div>
```

**File:** `src/style.css` (update)

```css
#inspector-link {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(74, 144, 226, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease;
  z-index: 100;
}

#inspector-link:hover {
  background: rgba(74, 144, 226, 1);
}
```

---

## Implementation Steps

### Phase 1: Setup (30 min)

1. ✅ Create `vite.config.js` with multi-page config
2. ✅ Create `inspector.html` at root
3. ✅ Create directory structure: `src/pages/inspector/`
4. ✅ Add OrbitControls import (already in Three.js examples)

### Phase 2: Core Inspector (1 hour)

5. ✅ Create `inspectorScene.js` with grid, lights, OrbitControls
6. ✅ Create `modelLoader.js` to instantiate models in isolation
7. ✅ Create `inspector.js` main app entry point
8. ✅ Create `inspector.css` for UI styling

### Phase 3: UI & Polish (30 min)

9. ✅ Build model selector dropdown with all options
10. ✅ Add model info display (vertices, triangles)
11. ✅ Add controls hint overlay
12. ✅ Add navigation links between pages

### Phase 4: Testing (30 min)

13. ✅ Test all models load correctly
14. ✅ Test OrbitControls (rotate, pan, zoom)
15. ✅ Test responsive behavior
16. ✅ Test navigation between pages

---

## Benefits of This Approach

### ✅ Separation of Concerns

- Inspector is completely separate from main app
- No modifications needed to existing models (works with current code)
- Can be developed and tested independently

### ✅ Developer-Friendly

- Easy to add new models to inspect
- Visual feedback for geometry changes
- Quick iteration on model design

### ✅ Performance

- Only loads one model at a time
- Lightweight scene (no city rotation logic)
- Fast switching between models

### ✅ Extensibility

- Can add wireframe toggle
- Can add material editor
- Can add export functionality
- Can add screenshot capability

---

## Optional Enhancements (Future)

### 1. Wireframe Toggle

```javascript
const wireframeCheckbox = document.getElementById("wireframe-toggle");
wireframeCheckbox.addEventListener("change", (e) => {
  currentModel.traverse((child) => {
    if (child.isMesh) {
      child.material.wireframe = e.target.checked;
    }
  });
});
```

### 2. Screenshot Feature

```javascript
function takeScreenshot() {
  const imgData = renderer.domElement.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `${currentModelName}-screenshot.png`;
  link.href = imgData;
  link.click();
}
```

### 3. Animation Playback

For models with animations (rider pedaling, wheels spinning):

```javascript
const animateCheckbox = document.getElementById("animate-toggle");
// Play stored animations if available
```

### 4. Stats Display

Add FPS counter and memory usage:

```javascript
import Stats from "three/examples/jsm/libs/stats.module";
const stats = new Stats();
document.body.appendChild(stats.dom);
```

---

## Files to Create

### New Files (7 total)

1. ✅ `vite.config.js`
2. ✅ `inspector.html`
3. ✅ `src/pages/inspector/inspector.js`
4. ✅ `src/pages/inspector/inspector.css`
5. ✅ `src/pages/inspector/inspectorScene.js`
6. ✅ `src/pages/inspector/modelLoader.js`
7. ✅ `INSPECTOR_IMPLEMENTATION.md` (this document)

### Files to Update (2 total)

1. ⚠️ `index.html` - Add inspector link
2. ⚠️ `src/style.css` - Style inspector link

---

## Timeline Estimate

- **Setup & Configuration:** 30 minutes
- **Core Implementation:** 1.5 hours
- **UI & Styling:** 45 minutes
- **Testing & Debugging:** 30 minutes
- **Documentation:** 15 minutes

**Total:** ~3 hours for complete implementation

---

## Next Steps

Would you like me to:

1. **Implement the full inspector page** (all files above)
2. **Start with Phase 1** (setup and config)
3. **Create a minimal prototype** first (single model, basic controls)
4. **Modify this approach** based on your feedback

Let me know and I'll proceed with implementation! 🚀
