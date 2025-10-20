# BikeWorld3D

BikeWorld3D is a small interactive 3D web project built with Three.js and Vite. It features a low-poly circular city with a bike as the main navigation control. Scroll to rotate the city and click buildings to open content. A separate Model Inspector page lets you view and inspect each model (bike, rider, buildings, and path) individually.

---

## Live Demo (Local)

- Start the dev server and open the app in your browser:

```powershell
# From project root (Windows PowerShell)
npm install    # (if dependencies not yet installed)
npm run dev
```

- Open the main app: http://localhost:5173/
- Open the model inspector: http://localhost:5173/inspector.html

---

## Project Structure

```
/
├── index.html               # Main app entry
├── inspector.html           # Model inspector page
├── README.md                # This file
├── package.json
├── vite.config.js
└── src/
    ├── main.js
    ├── style.css
    ├── scene/
    │   └── sceneSetup.js
    ├── models/
    │   ├── bike.js
    │   ├── rider.js
    │   ├── path.js
    │   └── buildings.js
    ├── navigation/
    │   ├── navigation.js
    │   ├── scrollHandler.js
    │   └── menuSystem.js
    └── pages/
        └── inspector/
            ├── inspector.js
            ├── inspector.css
            ├── inspectorScene.js
            └── modelLoader.js
```

---

## Features

- Scroll-based navigation: scroll the wheel to rotate the city around the bike.
- Model Inspector: separate page to view and inspect individual models with OrbitControls.
- Low-poly visual style, simple geometry for performance.
- Keyboard support: arrow keys and PageUp/PageDown for navigation (configurable).

---

## How the Inspector Works

- The inspector loads each model into a clean scene with a grid and axis helper.
- OrbitControls provide rotate/pan/zoom functionality.
- The ModelLoader extracts model groups from existing model classes and centers them for viewing.

---

## Adding Screenshots or Demo GIFs

To include images or animated GIFs in this README (useful for demos):

1. Create an `assets/` folder at the project root (for example: `./assets/screenshots/`).
2. Save screenshots or GIFs there, for example `./assets/screenshots/inspector.png` or `inspector-demo.gif`.
3. Reference them in this README using Markdown:

```markdown
![Inspector screenshot](./assets/screenshots/inspector.png)

![Demo GIF](./assets/screenshots/inspector-demo.gif)
```

For GIFs, keep resolution small (e.g., 720p or lower) to avoid large repository sizes.

---

## Development Notes

- The project uses plain ES modules and Three.js (no framework). Vite provides dev server and build.
- Models are simple primitives (boxes, cylinders, cones, spheres) to keep the poly-count low.
- The `src/pages/inspector` folder hosts the inspector implementation and can be extended with toggles (wireframe, screenshot) easily.

---

## Build & Deploy

```powershell
npm run build
npm run preview
```

After build, the `dist/` folder contains `index.html` and `inspector.html` and the static asset bundles. Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages).

---

## Tips & Troubleshooting

- If dev server doesn't start, ensure your Node.js version matches Vite requirements (Node 20.19+ or 22.12+).
- If models don't appear in the inspector, check console for errors and verify the `ModelLoader` can instantiate the model classes.
- Use the inspector to debug model orientation, scaling, and geometry.

---

## Contributing

Feel free to open pull requests for: UI polish, material editing, animation playback, or adding instrumented tests.

---

## License

This project is MIT licensed.

---

Enjoy exploring BikeWorld3D! 🚴‍♂️🏙️
