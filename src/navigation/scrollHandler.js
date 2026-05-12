// Scroll handler - manages mouse wheel and touch events
export class ScrollHandler {
  constructor(navigation, animationManager = null, trickSystem = null) {
    this.navigation = navigation;
    this.animationManager = animationManager;
    this.trickSystem = trickSystem;
    this.isEnabled = true;

    // Touch state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchLastX = 0;
    this.touchMoved = false;
  }

  /**
   * Initialize scroll and touch event listeners
   */
  init() {
    window.addEventListener("wheel", (event) => this.onScroll(event), {
      passive: true,
    });
    // Add keyboard navigation
    window.addEventListener("keydown", (event) => this.onKeyDown(event));
    window.addEventListener("keyup", (event) => this.onKeyUp(event));

    // Touch navigation for mobile
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("touchstart", (e) => this.onTouchStart(e), {
        passive: true,
      });
      canvas.addEventListener("touchmove", (e) => this.onTouchMove(e), {
        passive: false,
      });
      canvas.addEventListener("touchend", (e) => this.onTouchEnd(e), {
        passive: true,
      });
    }

    console.log("✓ Scroll handler initialized");
  }

  /**
   * Handle scroll event
   */
  onScroll(event) {
    if (!this.isEnabled) return;

    // deltaY > 0 = scroll down = move right (clockwise)
    // deltaY < 0 = scroll up = move left (counter-clockwise)
    const delta = event.deltaY * 0.001;
    this.navigation.handleScroll(delta);
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event) {
    if (!this.isEnabled) return;

    // Don't handle keys when an input or textarea is focused
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable)
    )
      return;

    // Trick keys — attempt while airborne; keys are intentionally undocumented
    if (this.trickSystem && this.trickSystem.handleKey(event.key)) {
      event.preventDefault();
      return;
    }

    // Map ArrowRight/ArrowLeft to start/continue smooth acceleration
    if (event.key === "ArrowRight") {
      this.navigation.startKeyAcceleration(1);
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      this.navigation.startKeyAcceleration(-1);
      event.preventDefault();
    }

    // Map PageDown/PageUp to snapping between buildings
    if (event.key === "PageDown") {
      // Move to next building index (wrap around)
      const count = this.navigation.buildings.getBuildings().length;
      const nextIndex = (this.navigation.getCurrentBuildingIndex() + 1) % count;
      this.navigation.snapToBuilding(nextIndex);
      event.preventDefault();
    } else if (event.key === "PageUp") {
      // Move to previous building index
      const count = this.navigation.buildings.getBuildings().length;
      const prevIndex =
        (this.navigation.getCurrentBuildingIndex() - 1 + count) % count;
      this.navigation.snapToBuilding(prevIndex);
      event.preventDefault();
    }

    // Spacebar for bunny hop
    if (event.code === "Space") {
      if (this.animationManager) {
        this.animationManager.triggerBunnyHop();
      }
      event.preventDefault();
    }
  }

  /**
   * Handle keyup events to stop acceleration for arrow keys
   */
  onKeyUp(event) {
    if (!this.isEnabled) return;

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      this.navigation.stopKeyAcceleration();
      event.preventDefault();
    }
  }

  /**
   * Handle touch start — record initial position
   */
  onTouchStart(event) {
    if (!this.isEnabled) return;
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchLastX = touch.clientX;
    this.touchMoved = false;
  }

  /**
   * Handle touch move — drive city rotation from horizontal drag
   */
  onTouchMove(event) {
    if (!this.isEnabled) return;
    event.preventDefault();
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchLastX;
    const totalMoved =
      Math.abs(touch.clientX - this.touchStartX) +
      Math.abs(touch.clientY - this.touchStartY);
    if (totalMoved > 8) this.touchMoved = true;

    // Drag left → positive scroll (clockwise), drag right → counter-clockwise
    const normalized = (-deltaX / window.innerWidth) * 3;
    this.navigation.handleScroll(normalized);
    this.touchLastX = touch.clientX;
  }

  /**
   * Handle touch end — fire tap event when no significant drag occurred
   */
  onTouchEnd(event) {
    if (!this.isEnabled) return;
    if (!this.touchMoved) {
      window.dispatchEvent(new CustomEvent("mobiletap"));
    }
  }

  /**
   * Enable/disable scroll handling
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Check if enabled
   */
  getEnabled() {
    return this.isEnabled;
  }
}
