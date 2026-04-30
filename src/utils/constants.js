// Configuration constants for BikeWorld3D

export const CONFIG = {
  // Building settings
  BUILDING_COUNT: 8,
  CITY_RADIUS: 25,

  // Building names and colors (low-poly aesthetic)
  BUILDINGS: [
    { name: "Home", color: 0x4a90e2, height: 15 },
    { name: "About", color: 0xe94b3c, height: 20 },
    { name: "Photos", color: 0xf5a623, height: 12 },
    { name: "3D", color: 0x7b64ff, height: 25 },
    { name: "Shop", color: 0x50c878, height: 18 },
    { name: "Code", color: 0xff6b9d, height: 22 },
    { name: "Contact", color: 0x00ced1, height: 14 },
    { name: "Game", color: 0xff4500, height: 16 },
  ],

  // Bike positioning
  BIKE_POSITION: { x: 0, y: 0.3, z: 35 },

  // Camera settings
  CAMERA_POSITION: { x: 0, y: 20, z: 60 },
  CAMERA_FOV: 60,

  // Animation settings
  ROTATION_SPEED: 0.5,
  ROTATION_SMOOTHING: 0.1,
  WHEEL_ROTATION_SPEED: 0.15,

  // Path settings
  PATH_RADIUS: 35,
  PATH_WIDTH: 7,

  // Interaction
  SNAP_THRESHOLD: 0.1, // Radians threshold for snapping to building
  HIGHLIGHT_SCALE: 1.1,

  // Bunny hop settings
  BUNNY_HOP_HEIGHT: 3.5,
  BUNNY_HOP_DURATION: 0.9, // seconds
  BUNNY_HOP_COOLDOWN: 0.8, // seconds

  // Double jump settings
  DOUBLE_JUMP_HEIGHT: 6.5,
  DOUBLE_JUMP_DURATION: 1.35,

  // Trick settings
  TRICK_DURATION: 0.52,
  TAILWHIP_DURATION: 0.38,

  // Colors
  GROUND_COLOR: 0x2c5530,
  PATH_COLOR: 0x404040,
  SKY_COLOR: 0x87ceeb,
  AMBIENT_LIGHT: 0xffffff,
  DIRECTIONAL_LIGHT: 0xffffff,
};

export const DEFAULTMODEL = "bike";

// Content for each building section
export const CONTENT = {
  Home: {
    title: "Welcome to BikeWorld3D",
    body: "<p>Navigate around the city by scrolling. Click on buildings to explore different sections.</p><p>This is an interactive 3D experience built with Three.js.</p>",
  },
  About: {
    title: "About This Project",
    body: "<p>BikeWorld3D is an experimental navigation system using 3D graphics.</p><p>Ride your bike through a low-poly city and discover different sections.</p>",
  },
  Photos: {
    title: "Photo Gallery",
    body: "<p>Photo gallery section.</p><p>Your photos and images would be displayed here.</p>",
  },
  "3D": {
    title: "3D Projects",
    body: "<p>3D work and projects section.</p><p>Showcase your 3D models, animations, and experiences here.</p>",
  },
  Shop: {
    title: "Shop",
    body: "<p>Online shop section.</p><p>Products and services would be displayed here.</p>",
  },
  Code: {
    title: "Code & Projects",
    body: "<p>Programming projects and code samples.</p><p>Showcase your development work and open source contributions.</p>",
  },
  Contact: {
    title: "Get in Touch",
    body: "<p>Contact information section.</p><p>Email: hello@bikeworld3d.com</p><p>Social media links would go here.</p>",
  },
  Game: {
    title: "Games",
    body: "<p>Interactive games section.</p><p>Mini-games and interactive experiences would be featured here.</p>",
  },
};
