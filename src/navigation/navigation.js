// Navigation controller - manages city rotation and position tracking
import { CONFIG } from "../utils/constants.js";

export class Navigation {
  constructor(cityGroup, buildings) {
    this.cityGroup = cityGroup;
    this.buildings = buildings;

    this.currentRotation = 0;
    this.targetRotation = 0;
    this.currentBuildingIndex = 0;
    this.isRotating = false;

    this.scrollAccumulator = 0;
  }

  /**
   * Handle scroll input
   * @param {number} delta - Scroll delta (positive = scroll down/right, negative = scroll up/left)
   */
  handleScroll(delta) {
    // Normalize delta and apply to rotation
    const normalizedDelta = delta * CONFIG.ROTATION_SPEED;
    this.targetRotation -= normalizedDelta;
    this.isRotating = true;
  }

  /**
   * Update rotation with smooth interpolation
   */
  update() {
    if (Math.abs(this.targetRotation - this.currentRotation) > 0.001) {
      // Smooth interpolation (lerp)
      this.currentRotation +=
        (this.targetRotation - this.currentRotation) *
        CONFIG.ROTATION_SMOOTHING;
      this.cityGroup.rotation.y = this.currentRotation;

      // Update building index based on rotation
      this.updateBuildingIndex();
    } else {
      this.isRotating = false;
    }
  }

  /**
   * Calculate which building is currently in front (closest to bike at positive Z)
   */
  updateBuildingIndex() {
    // Normalize rotation to 0-2π range
    let normalizedRotation = this.currentRotation % (Math.PI * 2);
    if (normalizedRotation < 0) {
      normalizedRotation += Math.PI * 2;
    }

    // Calculate building index
    // Offset by PI/2 to align with the bike's position (at positive Z axis, facing right)
    // This makes the building directly in front of the bike the active one
    const anglePerBuilding = (Math.PI * 2) / CONFIG.BUILDING_COUNT;
    const adjustedRotation = normalizedRotation + Math.PI / 2;
    const rawIndex = Math.round(adjustedRotation / anglePerBuilding);
    this.currentBuildingIndex = rawIndex % CONFIG.BUILDING_COUNT;
  }

  /**
   * Get current building index
   */
  getCurrentBuildingIndex() {
    return this.currentBuildingIndex;
  }

  /**
   * Get current building data
   */
  getCurrentBuilding() {
    return CONFIG.BUILDINGS[this.currentBuildingIndex];
  }

  /**
   * Check if currently rotating
   */
  getIsRotating() {
    return this.isRotating;
  }

  /**
   * Snap to nearest building
   */
  snapToBuilding(index) {
    const anglePerBuilding = (Math.PI * 2) / CONFIG.BUILDING_COUNT;
    this.targetRotation = anglePerBuilding * index;
  }
}
