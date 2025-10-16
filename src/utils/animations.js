// Animation utilities
import { CONFIG } from './constants.js';

export class AnimationManager {
  constructor(bike, rider) {
    this.bike = bike;
    this.rider = rider;
    this.wheelRotationSpeed = 0;
    this.targetWheelSpeed = 0;
  }

  /**
   * Update animations based on movement
   */
  update(isMoving) {
    // Update wheel rotation speed
    if (isMoving) {
      this.targetWheelSpeed = CONFIG.WHEEL_ROTATION_SPEED;
    } else {
      this.targetWheelSpeed = 0;
    }

    // Smooth wheel speed transition
    this.wheelRotationSpeed += (this.targetWheelSpeed - this.wheelRotationSpeed) * 0.1;

    // Animate wheels
    if (Math.abs(this.wheelRotationSpeed) > 0.001) {
      this.bike.animateWheels(this.wheelRotationSpeed);
    }

    // Animate rider pedaling
    this.rider.animatePedaling(Math.abs(this.wheelRotationSpeed) > 0.01);
  }
}
