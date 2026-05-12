// Menu system - handles building selection and content display
import * as THREE from "three";
import { CONTENT } from "../utils/constants.js";

export class MenuSystem {
  constructor(camera, buildings, navigation) {
    this.camera = camera;
    this.buildings = buildings;
    this.navigation = navigation;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.contentOverlay = document.getElementById("content-overlay");
    this.contentBody = document.getElementById("content-body");
    this.closeBtn = document.getElementById("close-btn");
    this.buildingNameDisplay = document.getElementById("building-name");

    this.isContentOpen = false;
    this.lastHighlightedIndex = -1;
  }

  /**
   * Initialize event listeners
   */
  init() {
    // Click event for building selection
    window.addEventListener("click", (event) => this.onClick(event));

    // Close button
    this.closeBtn.addEventListener("click", () => this.hideContent());

    // Close on overlay click (outside content)
    this.contentOverlay.addEventListener("click", (event) => {
      if (event.target === this.contentOverlay) {
        this.hideContent();
      }
    });

    // Escape key to close
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isContentOpen) {
        this.hideContent();
      }
    });

    // Mobile: tap canvas opens current building
    window.addEventListener("mobiletap", () => this.openCurrentBuilding());

    // Mobile: building name tap opens content
    if (this.buildingNameDisplay) {
      this.buildingNameDisplay.style.cursor = "pointer";
      this.buildingNameDisplay.addEventListener("click", () =>
        this.openCurrentBuilding(),
      );
    }

    // Mobile navigation buttons
    const prevBtn = document.getElementById("mobile-prev");
    const nextBtn = document.getElementById("mobile-next");
    const enterBtn = document.getElementById("mobile-enter");
    if (prevBtn) prevBtn.addEventListener("click", () => this.navigatePrev());
    if (nextBtn) nextBtn.addEventListener("click", () => this.navigateNext());
    if (enterBtn)
      enterBtn.addEventListener("click", () => this.openCurrentBuilding());

    console.log("✓ Menu system initialized");
  }

  /**
   * Handle click events
   */
  onClick(event) {
    return; // building clicks disabled
    if (this.isContentOpen) return;

    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections with buildings
    const buildingMeshes = this.buildings.getBuildingMeshes();
    const intersects = this.raycaster.intersectObjects(buildingMeshes, true);

    if (intersects.length > 0) {
      // Find the building object (not just any mesh)
      let buildingMesh = intersects[0].object;
      while (buildingMesh.parent && !buildingMesh.userData.isBuilding) {
        buildingMesh = buildingMesh.parent;
        if (buildingMesh.userData && buildingMesh.userData.isBuilding) {
          break;
        }
      }

      // Check if we found a valid building
      if (buildingMesh.userData && buildingMesh.userData.isBuilding) {
        const buildingName = buildingMesh.userData.buildingName;
        this.showContent(buildingName);
      }
    }
  }

  /**
   * Show content overlay for selected building
   */
  showContent(buildingName) {
    const content = CONTENT[buildingName];
    if (!content) return;

    // Populate content
    this.contentBody.innerHTML = `
      <h2>${content.title}</h2>
      ${content.body}
    `;

    // Show overlay
    this.contentOverlay.classList.remove("hidden");
    setTimeout(() => {
      this.contentOverlay.classList.add("visible");
    }, 10);

    this.isContentOpen = true;
    console.log(`📄 Showing content for: ${buildingName}`);
  }

  /**
   * Hide content overlay
   */
  hideContent() {
    this.contentOverlay.classList.remove("visible");
    setTimeout(() => {
      this.contentOverlay.classList.add("hidden");
    }, 300);

    this.isContentOpen = false;
  }

  /**
   * Update building name display
   */
  update() {
    const currentIndex = this.navigation.getCurrentBuildingIndex();

    // Update highlight if building changed
    if (currentIndex !== this.lastHighlightedIndex) {
      this.buildings.highlightBuilding(currentIndex);
      this.lastHighlightedIndex = currentIndex;

      // Update building name display
      const currentBuilding = this.navigation.getCurrentBuilding();
      this.buildingNameDisplay.textContent = currentBuilding.name;
      // building name display disabled
      // this.buildingNameDisplay.classList.add("visible");
    }
  }

  /**
   * Check if content is open
   */
  getIsContentOpen() {
    return this.isContentOpen;
  }

  /**
   * Open content for the currently highlighted building
   */
  openCurrentBuilding() {
    if (this.isContentOpen) return;
    const currentBuilding = this.navigation.getCurrentBuilding();
    if (currentBuilding) {
      this.showContent(currentBuilding.name);
    }
  }

  /**
   * Navigate to the previous building
   */
  navigatePrev() {
    const count = this.navigation.buildings.getBuildings().length;
    const prevIndex =
      (this.navigation.getCurrentBuildingIndex() - 1 + count) % count;
    this.navigation.snapToBuilding(prevIndex);
  }

  /**
   * Navigate to the next building
   */
  navigateNext() {
    const count = this.navigation.buildings.getBuildings().length;
    const nextIndex = (this.navigation.getCurrentBuildingIndex() + 1) % count;
    this.navigation.snapToBuilding(nextIndex);
  }
}
