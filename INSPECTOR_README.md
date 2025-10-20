# Model Inspector - Quick Start Guide

## Overview

The Model Inspector is a separate page that allows you to view, rotate, and inspect individual 3D models from the BikeWorld3D project in isolation.

## How to Access

1. **From Main App**: Click the "🔍 Model Inspector" button in the top-right corner
2. **Direct URL**: Navigate to `/inspector.html` or `http://localhost:5173/inspector.html`

## Features

### 🎯 Model Selection

- Use the dropdown menu in the top-left to select any model:
  - **Bike**: The red bicycle with wheels
  - **Rider**: The humanoid figure with helmet
  - **8 Buildings**: Each of the city buildings (Home, About, Photos, 3D, Shop, Code, Contact, Game)
  - **Path**: The circular road with lane markings

### 🖱️ Controls

| Action           | Control                   |
| ---------------- | ------------------------- |
| **Rotate**       | Left Mouse Button + Drag  |
| **Pan**          | Right Mouse Button + Drag |
| **Zoom**         | Mouse Wheel / Scroll      |
| **Reset Camera** | Press `R` key             |

### 📊 Model Information

The bottom-left panel displays:

- Model name
- Vertex count (total vertices in the model)
- Triangle count (polygon count)

### 🎨 Scene Features

- **Dark Background**: Makes models stand out clearly
- **Grid Helper**: 30x30 grid for spatial reference
- **Axis Helper**: RGB arrows showing XYZ axes (Red=X, Green=Y, Blue=Z)
- **Even Lighting**: Multiple lights from different angles for clear viewing

## Tips

### Best Practices

1. **Start with Default View**: When switching models, the camera auto-positions based on model size
2. **Use Reset (R)**: If you get lost, press R to reset the camera to a good viewing angle
3. **Inspect Details**: Zoom in close to see geometry details, window placements, etc.
4. **Check All Angles**: Use rotation to inspect models from all sides

### Keyboard Shortcuts

- `R` - Reset camera to default position
- `Escape` - (No action currently, but could close inspector in future)

## Development Use Cases

### For Designers

- **Geometry Review**: Check polygon counts and model complexity
- **Proportion Check**: View models in isolation to verify proportions
- **Detail Inspection**: Zoom in to check individual elements (windows, wheels, etc.)

### For Developers

- **Debug Models**: See exactly what a model looks like without scene context
- **Performance Check**: Vertex/triangle counts help identify optimization opportunities
- **Comparison**: Switch between buildings to compare sizes and styles

### For Artists

- **Color Review**: See colors without city lighting affecting them
- **Shape Refinement**: Inspect low-poly aesthetic from all angles
- **Quality Assurance**: Verify all model parts are properly positioned

## Technical Details

### File Structure

```
bikeworld3d/
├── inspector.html              # Inspector entry point
├── vite.config.js              # Multi-page Vite config
└── src/
    └── pages/
        └── inspector/
            ├── inspector.js    # Main app logic
            ├── inspector.css   # Styles
            ├── inspectorScene.js  # Scene setup
            └── modelLoader.js  # Model instantiation
```

### How It Works

1. **Model Loader**: Instantiates models using the same classes as main app
2. **Isolation**: Models are extracted from temporary scenes and centered at origin
3. **Scene Setup**: Clean scene with grid, lights, and OrbitControls
4. **UI**: Dropdown dynamically populated with all available models

### Performance

- **Lightweight**: Only one model loaded at a time
- **Fast Switching**: Models load instantly when switching
- **Smooth Controls**: OrbitControls with damping for fluid camera movement

## Building & Deployment

### Development

The inspector is automatically available in dev mode:

```bash
npm run dev
```

Then navigate to `http://localhost:5173/inspector.html`

### Production Build

Vite automatically builds both pages:

```bash
npm run build
```

Output includes:

- `dist/index.html` - Main app
- `dist/inspector.html` - Inspector page

### Deployment

Both pages are deployed together. Users can access:

- Main app: `https://yourdomain.com/`
- Inspector: `https://yourdomain.com/inspector.html`

## Future Enhancements (Planned)

### Potential Features

- [ ] Wireframe toggle
- [ ] Screenshot/export functionality
- [ ] Animation playback (for animated models)
- [ ] Material editor
- [ ] Measurement tools (distance, angle)
- [ ] Model comparison (side-by-side view)
- [ ] Light position adjustment
- [ ] Background color picker
- [ ] Model statistics (bounding box size, etc.)

## Troubleshooting

### Inspector Won't Load

- Check that `vite.config.js` exists with multi-page config
- Verify `inspector.html` is in project root
- Check browser console for errors

### Models Not Appearing

- Check model selector dropdown has options
- Verify model classes (Bike, Rider, etc.) are working in main app
- Check browser console for loading errors

### Controls Not Working

- Make sure OrbitControls is imported from Three.js examples
- Check that canvas is receiving mouse events (not blocked by UI)
- Try clicking on the canvas first to focus it

### Camera Too Close/Far

- Press `R` to reset camera
- Camera auto-positions based on model bounding box
- If still wrong, check modelLoader.js positioning logic

## Support

For issues or questions:

1. Check browser console for error messages
2. Verify Three.js and dependencies are installed
3. Ensure all model classes export required methods (getBikeGroup, etc.)
4. Check that models work correctly in main app first

---

**Enjoy inspecting your models! 🔍**
