# BikeWorld3D - GitHub Copilot Instructions

## Project Overview
BikeWorld3D is an interactive 3D website built with Three.js featuring a bike rider navigating around a circular city. The bike serves as the main navigation mechanism with scroll wheel control, and 8 buildings represent different menu sections that can be clicked to display content.

---

## Core Technologies
- **Three.js** (v0.x): 3D rendering and scene management
- **JavaScript**: ES6+ modules (no frameworks)
- **Vite**: Build tool and development server
- **CSS3**: UI overlays and styling

---

## Project Architecture

### Directory Structure
```
bikeworld3d/
├── index.html                    # Main HTML with UI overlays
├── src/
│   ├── main.js                   # Application entry point & initialization
│   ├── style.css                 # Global styles and UI overlays
│   ├── scene/
│   │   └── sceneSetup.js        # Scene, camera, renderer, lighting setup
│   ├── models/
│   │   ├── buildings.js         # 8 city buildings with highlighting
│   │   ├── path.js              # Circular road around city
│   │   ├── bike.js              # Bike model with wheel animation
│   │   └── rider.js             # Rider model with pedaling animation
│   ├── navigation/
│   │   ├── navigation.js        # City rotation & position tracking
│   │   ├── scrollHandler.js     # Mouse wheel event handling
│   │   └── menuSystem.js        # Building selection & content display
│   └── utils/
│       ├── constants.js         # Configuration & content data
│       └── animations.js        # Animation coordination
└── .github/
    └── copilot-instructions.md  # This file
```

---

## Key Design Decisions

### 1. Low-Poly Aesthetic
- All 3D models use simple geometric primitives (boxes, cylinders, cones, spheres)
- Flat shading enabled for stylized appearance
- Bright, distinct colors for each building
- Minimal polygon count for performance

### 2. Navigation System
- **Scroll down** = Move right (clockwise rotation)
- **Scroll up** = Move left (counter-clockwise rotation)
- City rotates while bike stays stationary (creates illusion of movement)
- Smooth interpolation (lerp) for fluid rotation transitions
- Active building tracked by rotation angle with offset adjustment

### 3. Coordinate System
- **Origin (0,0,0)**: Center of the city
- **Positive Z axis**: Where bike is positioned (facing right)
- **Y axis**: Up/down (height)
- **City rotation**: Around Y axis
- **Buildings**: Positioned in circle, facing outward (180° rotation after lookAt)

### 4. Building Selection Logic
- Rotation offset of `Math.PI / 2` aligns selection with bike position
- Front-most building (directly in front of bike) is highlighted
- Raycasting used for click detection
- Emissive intensity and scale changes for visual feedback

---

## Configuration Constants (src/utils/constants.js)

### Key Settings
```javascript
BUILDING_COUNT: 8              // Number of buildings in city
CITY_RADIUS: 25               // Distance of buildings from center
PATH_RADIUS: 35               // Radius of the circular path
BIKE_POSITION: { x: 0, y: 1, z: 35 }  // Bike at positive Z
CAMERA_POSITION: { x: 0, y: 20, z: 60 }  // High angle view
ROTATION_SPEED: 0.22          // Scroll sensitivity
ROTATION_SMOOTHING: 0.1       // Lerp factor (lower = smoother)
WHEEL_ROTATION_SPEED: 0.15    // Wheel spin speed
HIGHLIGHT_SCALE: 1.1          // Building scale when selected
```

### Building Data Structure
```javascript
BUILDINGS: [
  { name: 'Section Name', color: 0xHEXCOLOR, height: number }
  // 8 buildings total
]
```

---

## Code Style Guidelines

### ES6+ Features
- Use ES6 modules (`import`/`export`)
- Arrow functions for callbacks
- Destructuring where appropriate
- Template literals for strings
- `const`/`let` (never `var`)

### Naming Conventions
- **Classes**: PascalCase (`SceneSetup`, `Buildings`)
- **Variables/Functions**: camelCase (`currentRotation`, `updateBuildingIndex`)
- **Constants**: UPPER_SNAKE_CASE (`BUILDING_COUNT`, `CITY_RADIUS`)
- **Private methods**: Prefix with underscore if needed (`_helper`)

### Function Documentation
Use JSDoc comments for public methods:
```javascript
/**
 * Brief description of what the function does
 * @param {type} paramName - Description
 * @returns {type} Description
 */
```

### Error Handling
- Add console logs for initialization steps with ✓ prefix
- Validate user input where applicable
- Handle edge cases (division by zero, null checks)

---

## Three.js Specific Patterns

### Scene Setup
1. Create scene with background color and fog
2. Setup camera with aspect ratio handling
3. Create renderer with antialiasing and shadows
4. Add lights (ambient, directional, hemisphere)
5. Handle window resize events
6. Implement render loop with `requestAnimationFrame`

### Model Creation Pattern
```javascript
export class ModelName {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
  }

  create() {
    // Create geometries and materials
    // Build mesh hierarchy
    // Position and rotate
    // Add to scene
    console.log('✓ ModelName created');
  }

  getGroup() {
    return this.group;
  }
}
```

### Material Standards
- Use `MeshLambertMaterial` for most objects (performance-friendly)
- Enable `flatShading: true` for low-poly aesthetic
- Set `castShadow: true` and `receiveShadow: true` appropriately
- Use `emissive` and `emissiveIntensity` for highlights

### Rotation Conventions
- **Bike facing right**: `rotation.y = -Math.PI / 2` (-90°)
- **Buildings facing outward**: `lookAt(0,0,0)` then `rotateY(Math.PI)`
- **Wheel rolling**: Rotate on X axis (`rotation.x += speed`)

---

## Animation Guidelines

### Smooth Interpolation (Lerp)
```javascript
current += (target - current) * smoothingFactor;
```
- Used for city rotation (smoothing = 0.1)
- Used for wheel speed transitions
- Lower factor = smoother but slower

### Animation Coordination
- All animations updated in main animation loop
- Check `isMoving` state before animating wheels/rider
- Sync wheel speed with rotation speed
- Pedaling animation uses `Math.sin()` for oscillation

---

## UI Overlay System

### HTML Structure
- `#app`: Canvas container
- `#ui-overlay`: Non-interactive overlays (hints, building names)
- `#content-overlay`: Interactive modal for building content

### CSS Patterns
- Use `position: fixed` for overlays
- `pointer-events: none` for non-interactive elements
- Glassmorphism: `backdrop-filter: blur(10px)` + `rgba()` backgrounds
- Smooth transitions: `transition: opacity 0.3s ease`
- `.visible` class toggles opacity for show/hide

### Content Display
1. User clicks building (raycasting detects)
2. Show overlay: Remove `.hidden`, add `.visible`
3. Populate content from `CONTENT` object
4. Close via button, ESC key, or overlay click

---

## Performance Considerations

### Optimization Techniques
- Keep polygon count low (use simple primitives)
- Limit shadow-casting lights (one directional light)
- Use appropriate shadow map size (2048x2048)
- Limit pixel ratio: `Math.min(window.devicePixelRatio, 2)`
- No instanced meshes needed for 8 buildings (small count)

### Target Performance
- **60 FPS** on mid-range desktop
- Smooth rotation with no stuttering
- Instant click response
- Quick initial load (<2 seconds)

---

## Common Tasks & Patterns

### Adding a New Building
1. Add to `CONFIG.BUILDINGS` array in `constants.js`
2. Add content to `CONTENT` object
3. Update `BUILDING_COUNT` if needed
4. Buildings auto-position based on count

### Changing Navigation Speed
- Adjust `ROTATION_SPEED` in constants.js (higher = faster)
- Adjust `ROTATION_SMOOTHING` (lower = smoother but slower response)

### Modifying Camera View
- Change `CAMERA_POSITION` for different angles
- Adjust `CAMERA_FOV` for zoom (lower = more zoomed in)
- Update `lookAt(0, 0, 0)` to change focus point

### Adding New Animations
1. Create animation method in respective model class
2. Add to `AnimationManager.update()` in animations.js
3. Sync with movement state if needed

---

## Debugging Tips

### Console Logs
- Initialization steps marked with ✓ prefix
- Building selection logs with 📄 emoji
- Use browser console to check for errors

### Common Issues
- **Buildings not highlighting correctly**: Check rotation offset in `updateBuildingIndex()`
- **Wheels not spinning**: Verify `animateWheels()` uses correct axis (X axis)
- **Bike facing wrong way**: Should be `rotation.y = -Math.PI / 2`
- **Buildings facing inward**: Must apply `rotateY(Math.PI)` after `lookAt()`

### Development Tools
- Vite dev server: `npm run dev`
- Hot module reload enabled
- Check browser console for Three.js warnings

---

## Extension Points

### Easy Additions
- **Keyboard controls**: Add arrow key listeners in new file
- **Sounds**: Add Web Audio API integration
- **Particle effects**: Create particle system for ambient effects
- **Day/night cycle**: Animate light colors and intensities

### Medium Complexity
- **Better models**: Replace with GLTF models (use GLTFLoader)
- **Mobile support**: Add touch event handlers
- **Loading screen**: Add progress tracking for assets
- **Mini-map**: Create 2D overlay showing position

### Advanced Features
- **Multiple levels**: Create different city layouts
- **Physics**: Add collision detection
- **Multiplayer**: WebSocket integration for shared experience
- **VR support**: Three.js VR module integration

---

## Testing Checklist

### Functionality
- [ ] Scroll up/down rotates city correctly
- [ ] Front-most building is highlighted
- [ ] Building name displays correctly
- [ ] Click on building opens content
- [ ] Content displays correctly for all 8 sections
- [ ] Close button works
- [ ] ESC key closes content
- [ ] Click outside content closes overlay

### Visual Quality
- [ ] Buildings face outward (windows visible)
- [ ] Bike faces right
- [ ] Wheels rotate correctly (rolling motion)
- [ ] Rider pedals when moving
- [ ] Shadows render correctly
- [ ] No z-fighting or visual glitches
- [ ] UI overlays have proper styling

### Performance
- [ ] Maintains 60 FPS during rotation
- [ ] No lag when clicking buildings
- [ ] Smooth wheel animations
- [ ] Quick initial load

---

## Known Limitations

### Current Constraints
- Desktop-only (no mobile optimization)
- No keyboard navigation
- Simple geometric models (no detailed meshes)
- Basic content system (static HTML)
- Single camera view (no orbit controls)

### Future Considerations
- Add WebGL capability detection
- Implement fallback for older browsers
- Add loading progress indicator
- Consider memory cleanup for long sessions

---

## Build & Deploy

### Development
```bash
npm run dev          # Start dev server (http://localhost:5173)
```

### Production
```bash
npm run build        # Build for production (outputs to /dist)
npm run preview      # Preview production build
```

### Deployment
- Static site (no server required)
- Deploy `/dist` folder to any static host
- No environment variables needed
- Compatible with: Vercel, Netlify, GitHub Pages, etc.

---

## Useful Resources

### Three.js Documentation
- Main docs: https://threejs.org/docs/
- Examples: https://threejs.org/examples/
- Editor: https://threejs.org/editor/

### Project Files
- Configuration: `src/utils/constants.js`
- Main entry: `src/main.js`
- Scene setup: `src/scene/sceneSetup.js`

---

## Code Generation Guidelines

### When Creating New Features
1. Follow existing file structure and patterns
2. Use ES6 class syntax for components
3. Add to appropriate directory (models/, navigation/, utils/)
4. Update main.js if initialization needed
5. Add configuration to constants.js
6. Document public methods with JSDoc
7. Add console.log for initialization confirmation

### When Modifying Existing Code
1. Check constants.js before hardcoding values
2. Maintain consistent naming conventions
3. Preserve existing animation coordination
4. Test rotation/selection logic after changes
5. Verify Three.js object hierarchy not broken
6. Ensure performance not degraded

### When Fixing Bugs
1. Check coordinate system and rotations first
2. Verify axis conventions (Y=up, Z=forward for bike)
3. Test with console.log to track values
4. Consider rotation offset calculations
5. Check for null/undefined errors
6. Validate array indices and bounds

---

## Final Notes

This is an MVP (Minimum Viable Product) implementation focused on:
- ✅ Core functionality working smoothly
- ✅ Clean, maintainable code structure
- ✅ Low-poly aesthetic achieved
- ✅ Desktop experience optimized
- ✅ Room for future enhancements

The codebase is designed to be easily extended and modified. All major components are modular and documented. Configuration is centralized for easy tweaking.

**Happy coding! 🚴‍♂️🏙️**
