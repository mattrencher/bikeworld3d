// Animation utilities
import { CONFIG } from "./constants.js";

export class AnimationManager {
  constructor(bike, rider) {
    this.bike = bike;
    this.rider = rider;
    this.wheelRotationSpeed = 0;
    this.targetWheelSpeed = 0;
    this.lastTime = performance.now();
  }

  /**
   * Update animations based on movement
   */
  update(isMoving) {
    // Calculate delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update bunny hop animation
    this.bike.updateBunnyHop(deltaTime);
    const isBunnyHopping = this.bike.isBunnyHopping();

    // Update wheel rotation speed
    if (isMoving) {
      this.targetWheelSpeed = CONFIG.WHEEL_ROTATION_SPEED;
    } else {
      this.targetWheelSpeed = 0;
    }

    // Smooth wheel speed transition
    this.wheelRotationSpeed +=
      (this.targetWheelSpeed - this.wheelRotationSpeed) * 0.1;

    // Animate wheels (slower during bunny hop)
    if (Math.abs(this.wheelRotationSpeed) > 0.001) {
      const wheelSpeed = isBunnyHopping
        ? this.wheelRotationSpeed * 0.5
        : this.wheelRotationSpeed;
      this.bike.animateWheels(wheelSpeed);
    }

    // Animate rider pedaling
    this.rider.animatePedaling(
      Math.abs(this.wheelRotationSpeed) > 0.01,
      isBunnyHopping,
      deltaTime,
    );

    // Sync rider body pose to current trick state
    this.rider.updateTrick(this.bike.getTrickInfo());
  }

  /**
   * Trigger bunny hop
   */
  triggerBunnyHop() {
    return this.bike.bunnyHop();
  }
}
