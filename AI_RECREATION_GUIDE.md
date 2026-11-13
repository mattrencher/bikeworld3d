# BikeWorld3D: AI Recreation Guide

Use this document as the implementation brief for rebuilding BikeWorld3D in a
new project. Recreate the experience and its interactions, not just a static
visual mockup. Make reasonable implementation decisions where a detail is not
specified, and keep the result modular, responsive, and runnable.

## Project goal

Build a browser-based 3D portfolio/navigation experience. A low-poly cyclist
stays in the foreground while a circular city rotates around them. Eight
colorful buildings act as the site's navigation menu. Include a separate Model
Inspector page for viewing each model in isolation.

The visual direction is playful, colorful, low-poly, and readable. Favor simple
Three.js primitives, crisp silhouettes, and a clear hierarchy between the 3D
world and lightweight HTML overlays.

## Technology and constraints

- Use JavaScript ES modules, Three.js, and Vite. Do not introduce a UI framework.
- The reference project uses Three.js `^0.180.0` and Vite `^7.1.7`.
- Use CSS for overlays and page layout. Render 3D content with WebGL.
- Keep models and interaction systems in separate modules; centralize world
  configuration and building content.
- Support development with `npm run dev`, production builds with
  `npm run build`, and preview with `npm run preview`.
- Make asset URLs work both locally and when deployed under a subpath. The
  reference Vite configuration uses `/bikeworld3d/` as its deployment base.
- Use the included `assets/Space_2K.hdr` for the environment if available.
  Preserve a solid-color sky fallback if the HDR fails to load.

## Required pages and structure

Create two Vite entry pages:

1. `index.html`: the interactive city experience.
2. `inspector.html`: the standalone model viewer.

Organize the source into clear modules, following a structure such as:

```text
index.html
inspector.html
src/
  main.js
  style.css
  scene/
    sceneSetup.js
  models/
    bike.js
    rider.js
    buildings.js
    path.js
  navigation/
    navigation.js
    scrollHandler.js
    menuSystem.js
    trickSystem.js
  pages/inspector/
    inspector.js
    inspector.css
    inspectorScene.js
    modelLoader.js
  utils/
    constants.js
    animations.js
assets/
  Space_2K.hdr
```

Equivalent modular organization is fine, but keep rendering, models,
navigation, content, and the inspector independently understandable.

## Main city scene

- Put the world origin at the city center. Use Y as up and place the stationary
  bike near positive Z, approximately `(0, 0.3, 35)`.
- Use a perspective camera around `(0, 20, 60)`, looking toward the origin,
  with a field of view near 60 degrees.
- Add a green circular ground plane, a blue sky/fog fallback, ambient,
  directional, and hemisphere lighting, and soft shadows. Cap renderer pixel
  ratio at 2 and update camera and renderer dimensions on resize.
- Build one rotatable city group. Place eight buildings evenly around a circle
  of radius 25, facing outward. Rotate the city group around the Y axis for
  navigation.
- Give each building a colorful low-poly body, a simple roof, and bright
  rectangular windows. Vary building heights and widths slightly while keeping
  the configured section colors consistent.
- Build a dark circular road centered at radius 35 and roughly 7 units wide.
  Include dashed center markings, solid white edge stripes, and regularly
  spaced low-poly lamp posts. Parent the road and its details to the rotating
  city group so they move together.
- Keep the ground and decorative ground rings stationary while the city and
  road rotate.
- Include an environment-map sky when the HDR loads, without allowing an asset
  loading failure to prevent the scene from rendering.

### Building order and data

Keep the buildings in this order, evenly distributed around the city:

| Index | Name | Color | Height |
| --- | --- | --- | ---: |
| 0 | Home | `#4a90e2` | 15 |
| 1 | About | `#e94b3c` | 20 |
| 2 | Photos | `#f5a623` | 12 |
| 3 | 3D | `#7b64ff` | 25 |
| 4 | Shop | `#50c878` | 18 |
| 5 | Code | `#ff6b9d` | 22 |
| 6 | Contact | `#00ced1` | 14 |
| 7 | Game | `#ff4500` | 16 |

Use the building configuration as the single source of truth for placement,
highlighting, navigation, inspector options, and section content.

## Bike and rider

- Create a recognizable bicycle from simple low-poly geometry: two dark wheels,
  an orange frame, metallic accents, seat, and handlebars.
- Orient the bike tangentially to the circular road and keep it stationary
  while the city rotates.
- Add a stylized seated rider with a forward lean, colored clothing, a face,
  and a red cap. Attach the rider to the bike so jumps, wheelies, and tricks
  move coherently.
- Use a group hierarchy that permits independent wheel rotation, wheelie tilt,
  and whole-bike trick rotation around a visually sensible pivot.
- Animate wheel spin and rider pedaling while navigating. Smoothly ease wheel
  speed back to rest when movement stops. Keep animation updates in the main
  animation loop and use elapsed time for framerate-independent motion.

## Navigation and interaction

- Scrolling down rotates the city clockwise; scrolling up rotates it in the
  opposite direction. Normalize wheel input and interpolate current rotation
  toward target rotation for smooth movement.
- Keep the bike in place and derive the active building from the city rotation.
  Account for the bike's positive-Z position when aligning the selected section.
- Visually highlight the building in front of the cyclist by increasing its
  scale slightly (about 1.1) and strengthening its emissive color. Restore all
  other buildings to their normal appearance.
- Display the active building name in an HTML overlay.
- Support keyboard navigation: hold Left/Right Arrow to accelerate city
  movement; PageUp/PageDown snap between adjacent buildings and wrap at either
  end.
- On touch devices, horizontal drags rotate the city. A tap opens the active
  section. Provide visible previous, enter, and next controls, and show a
  touch-specific navigation hint.
- Provide bunny hops using Space, including a second jump while airborne. Add
  short airborne BMX tricks, with rider poses, triggered by letter keys while
  airborne. Do not let trick controls interfere with navigation keys or text
  input.
- Clicking a building should open that building's content on desktop. Use
  raycasting against building meshes and resolve child-mesh hits to their
  owning building.
- Provide a content modal with a close button, Escape-to-close, and
  click-outside-to-close behavior. Disable world interactions as appropriate
  while the modal is open.
- Ensure HTML controls remain usable above the canvas. Use accessible button
  labels, keyboard focus styles, and semantic markup.

### Section content

Provide a title and short placeholder copy for each section:

- **Home:** Welcome to BikeWorld3D, explain scroll navigation and the Three.js
  experience.
- **About:** Explain the experimental 3D navigation and low-poly city.
- **Photos:** Placeholder photo gallery.
- **3D:** Placeholder for 3D work, models, and animations.
- **Shop:** Placeholder for products and services.
- **Code:** Placeholder for programming projects and code samples.
- **Contact:** Include contact information and social-link placeholders.
- **Game:** Placeholder for mini-games and interactive experiences.

Treat section content as data, not duplicated UI markup.

## User interface and styling

- Fill the viewport with the WebGL canvas and prevent page scrolling in the
  experience.
- Keep navigation hints and the active building label in a non-blocking
  overlay. Add a visible link to the Model Inspector.
- Use translucent dark panels, subtle borders, rounded corners, and restrained
  blur for the overlay/modal UI. Keep text readable over the scene.
- Provide desktop and touch-specific hints. On touch/coarse-pointer devices,
  show the mobile controls and hide the desktop hint.
- Make the content modal scrollable and adapt its width, padding, and typography
  to narrow screens.
- Keep pointer events disabled on decorative overlay regions and enabled on
  actual links, buttons, and the modal.

## Model Inspector

- Provide a dark neutral Three.js scene with bright, even lighting, a grid, and
  XYZ axes.
- Use OrbitControls for rotate, pan, and zoom. Add damping, sensible distance
  limits, and an `R` key camera reset.
- Provide a selector for Bike, Rider, all eight buildings, and Path.
- Load model instances from the same model modules as the main experience.
  Center the selected model and adjust the camera based on its bounding box.
- Show the selected model's display name, vertex count, and triangle count.
- Ensure switching models removes the prior model but keeps lights and helpers.
- Include a clear link back to the main experience and responsive inspector
  panels for small screens.

## Suggested implementation sequence

1. Create the Vite project, dependencies, two HTML entry pages, and shared
   configuration/content data.
2. Implement the scene, camera, lighting, resize handling, ground, and fallback
   sky.
3. Implement and position the bike, rider, circular road, and eight buildings.
4. Add city rotation, active-building tracking, highlights, and desktop/mobile
   controls.
5. Add content overlays, building raycasting, jumps, tricks, and coordinated
   animations.
6. Implement the inspector using the same model classes.
7. Polish responsive styling, keyboard accessibility, loading failures, and
   deployment asset paths.

## Completion criteria

The recreation is complete when:

- `npm run build` succeeds and both entry pages appear in the production build.
- The main page renders the city, circular road, cyclist, and rider without
  runtime errors.
- Scroll, arrow keys, PageUp/PageDown, touch drag, and mobile buttons navigate
  consistently, including wrapping between the first and last buildings.
- The front-most building is highlighted and its content can be opened and
  closed with the supported controls.
- The bike wheels spin while moving, the rider pedals, and jumps/tricks animate
  without leaving the bike in a broken pose.
- The inspector can load every model, report geometry counts, orbit/pan/zoom,
  reset its camera, and return to the main page.
- Layout remains usable on desktop and narrow touch screens, and the app still
  works if the HDR environment asset is unavailable.

## Implementation note

In the current reference source, the desktop building-click handler returns
before its raycasting logic, so building clicks are effectively disabled even
though the interface copy describes clicking buildings. For a faithful,
usable recreation, implement the described desktop click-to-open behavior
rather than preserving that accidental early return. The mobile enter/tap path
should also open the currently selected building.
