// Trick system - routes keyboard combos to BMX tricks while airborne
export class TrickSystem {
  constructor(bike) {
    this.bike = bike;

    // Keys that trigger tricks while airborne (deliberately undocumented)
    this.trickKeys = {
      's': 'backflip',
      'a': '360ccw',
      'd': '360cw',
      'w': 'superman',
      'q': 'nohander',
      'e': 'cancan',
      'z': 'tailwhip',
      'x': 'tailwhip',
    };
  }

  /**
   * Attempt to trigger a trick based on key pressed while airborne.
   * @param {string} key - The key value (will be lowercased)
   * @returns {boolean} Whether a trick was triggered
   */
  handleKey(key) {
    const trickType = this.trickKeys[key.toLowerCase()];
    if (!trickType) return false;
    if (!this.bike.isAirborne()) return false;
    return this.bike.performTrick(trickType);
  }
}
