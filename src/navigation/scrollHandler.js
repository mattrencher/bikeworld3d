// Scroll handler - manages mouse wheel events
export class ScrollHandler {
  constructor(navigation) {
    this.navigation = navigation;
    this.isEnabled = true;
  }

  /**
   * Initialize scroll event listener
   */
  init() {
    window.addEventListener('wheel', (event) => this.onScroll(event), { passive: true });
    console.log('✓ Scroll handler initialized');
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
