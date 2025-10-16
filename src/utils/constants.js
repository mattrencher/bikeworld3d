// Configuration constants for BikeWorld3D

export const CONFIG = {
  // Building settings
  BUILDING_COUNT: 8,
  CITY_RADIUS: 25,
  
  // Building names and colors (low-poly aesthetic)
  BUILDINGS: [
    { name: 'Home', color: 0x4A90E2, height: 15 },
    { name: 'About', color: 0xE94B3C, height: 20 },
    { name: 'Photos', color: 0xF5A623, height: 12 },
    { name: '3D', color: 0x7B64FF, height: 25 },
    { name: 'Shop', color: 0x50C878, height: 18 },
    { name: 'Code', color: 0xFF6B9D, height: 22 },
    { name: 'Contact', color: 0x00CED1, height: 14 },
    { name: 'Game', color: 0xFF4500, height: 16 }
  ],

  // Bike positioning
  BIKE_POSITION: { x: 0, y: 1, z: 35 },
  
  // Camera settings
  CAMERA_POSITION: { x: 0, y: 20, z: 60 },
  CAMERA_FOV: 60,
  
  // Animation settings
  ROTATION_SPEED: 0.22,
  ROTATION_SMOOTHING: 0.1,
  WHEEL_ROTATION_SPEED: 0.15,
  
  // Path settings
  PATH_RADIUS: 35,
  PATH_WIDTH: 6,
  
  // Interaction
  SNAP_THRESHOLD: 0.1, // Radians threshold for snapping to building
  HIGHLIGHT_SCALE: 1.1,
  
  // Colors
  GROUND_COLOR: 0x2C5530,
  PATH_COLOR: 0x404040,
  SKY_COLOR: 0x87CEEB,
  AMBIENT_LIGHT: 0xffffff,
  DIRECTIONAL_LIGHT: 0xffffff
};

// Content for each building section
export const CONTENT = {
  'Home': {
    title: 'Welcome to BikeWorld3D',
    body: '<p>Navigate around the city by scrolling. Click on buildings to explore different sections.</p><p>This is an interactive 3D experience built with Three.js.</p>'
  },
  'About': {
    title: 'About This Project',
    body: '<p>BikeWorld3D is an experimental navigation system using 3D graphics.</p><p>Ride your bike through a low-poly city and discover different sections.</p>'
  },
  'Photos': {
    title: 'Photo Gallery',
    body: '<p>Photo gallery section.</p><p>Your photos and images would be displayed here.</p>'
  },
  '3D': {
    title: '3D Projects',
    body: '<p>3D work and projects section.</p><p>Showcase your 3D models, animations, and experiences here.</p>'
  },
  'Shop': {
    title: 'Shop',
    body: '<p>Online shop section.</p><p>Products and services would be displayed here.</p>'
  },
  'Code': {
    title: 'Code & Projects',
    body: '<p>Programming projects and code samples.</p><p>Showcase your development work and open source contributions.</p>'
  },
  'Contact': {
    title: 'Get in Touch',
    body: '<p>Contact information section.</p><p>Email: hello@bikeworld3d.com</p><p>Social media links would go here.</p>'
  },
  'Game': {
    title: 'Games',
    body: '<p>Interactive games section.</p><p>Mini-games and interactive experiences would be featured here.</p>'
  }
};
