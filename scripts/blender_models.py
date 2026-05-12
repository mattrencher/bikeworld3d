"""
BikeWorld3D — Blender model builder
=====================================
Recreates the bike and rider geometry from the Three.js source as native
Blender meshes using Principled BSDF materials.

HOW TO USE
----------
1. Open Blender (3.0+)
2. Switch to the Scripting workspace
3. Open this file (or paste it into the text editor)
4. Click "Run Script"
5. Two collections appear: "Bike" and "Rider"
6. Refine geometry visually as desired
7. Export: File → Export → glTF 2.0 (.glb/.gltf)
   - Format: GLB
   - Include: Selected Objects (or both collections)
   - Transform: Y Forward, Z Up  ← important
   - Geometry: Apply Modifiers checked

LOADING IN THREE.JS
--------------------
Replace the programmatic Bike/Rider classes with GLTFLoader:

  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

  const loader = new GLTFLoader();
  loader.load('/models/bike.glb', (gltf) => {
    const bikeModel = gltf.scene;
    // Wrap in groups for position and tilt (same pattern as current code)
    const bikeGroup = new THREE.Group();
    const tiltGroup = new THREE.Group();
    tiltGroup.add(bikeModel);
    bikeGroup.add(tiltGroup);
    bikeGroup.position.set(...CONFIG.BIKE_POSITION);
    bikeGroup.rotation.y = Math.PI / 2;
    scene.add(bikeGroup);
  });

COORDINATE MAPPING  (Three.js → Blender)
------------------------------------------
  Three.js  X  →  Blender  X  (right)
  Three.js  Y  →  Blender  Z  (up)
  Three.js  Z  →  Blender -Y  (forward)

  Rotation axes remap the same way because Blender is Z-up right-handed
  and Three.js is Y-up right-handed.  Cylinder/tube angles along the
  bike's length axis translate directly when using rotation.x in both.

  Wheel orientation:
    Three.js: rotation.z = PI/2  (cylinder Y-axis → X-axis)
    Blender:  rotation.y = PI/2  (cylinder Z-axis → X-axis)
"""

import bpy
import math

# ─────────────────────────────────────────────────────────
#  Utilities
# ─────────────────────────────────────────────────────────

def t2b(x, y, z):
    """Convert Three.js (Y-up) position to Blender (Z-up)."""
    return (x, -z, y)


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)


def make_collection(name):
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


def assign_to_collection(obj, col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)


def make_material(name, rgb, metallic=0.0, roughness=0.8):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
    return mat


def add_cylinder(name, radius, depth, verts, pos_3js, rot_blender, mat, col):
    """
    pos_3js:     Three.js (x, y, z) — converted internally via t2b()
    rot_blender: Blender Euler (rx, ry, rz) in radians
    """
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius,
        depth=depth,
        vertices=verts,
        location=t2b(*pos_3js),
        rotation=rot_blender,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    assign_to_collection(obj, col)
    return obj


def add_box(name, three_dims, pos_3js, rot_blender, mat, col):
    """
    three_dims: (width, height, depth) as used in Three.js BoxGeometry
    Blender scale: X = width/2, Y = depth/2, Z = height/2
    """
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0), rotation=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    w, h, d = three_dims
    obj.scale = (w / 2, d / 2, h / 2)          # Blender: X=width, Y=depth, Z=height
    bpy.ops.object.transform_apply(scale=True)
    obj.location = t2b(*pos_3js)
    obj.rotation_euler = rot_blender
    obj.data.materials.append(mat)
    assign_to_collection(obj, col)
    return obj


def add_sphere(name, radius, pos_3js, scale_xyz, mat, col):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius,
        location=t2b(*pos_3js),
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale_xyz
    bpy.ops.object.transform_apply(scale=True)
    obj.data.materials.append(mat)
    assign_to_collection(obj, col)
    return obj


# ─────────────────────────────────────────────────────────
#  Bike
# ─────────────────────────────────────────────────────────

def build_bike():
    col = make_collection("Bike")

    frame  = make_material("Frame_Orange",  (1.0,  0.647, 0.0),  roughness=0.6)
    accent = make_material("Accent_Silver", (0.75, 0.75,  0.75), metallic=0.8, roughness=0.3)
    wheel  = make_material("Wheel_Dark",    (0.13, 0.13,  0.13), roughness=0.9)
    seat   = make_material("Seat_Black",    (0.02, 0.02,  0.02), roughness=0.8)

    # Wheels
    # Three.js: CylinderGeometry(0.8, 0.8, 0.2, 16), rotation.z = PI/2
    # Blender:  rotation.y = PI/2  (cylinder Z-axis → X-axis, rolls along Y)
    wheel_rot = (0, math.pi / 2, 0)
    add_cylinder("FrontWheel", 0.8, 0.2, 16, (0, 0.8,  1.25), wheel_rot, wheel, col)
    add_cylinder("BackWheel",  0.8, 0.2, 16, (0, 0.8, -1.44), wheel_rot, wheel, col)

    # Tubes along bike length  (Three.js rotation.x = PI/2 → Blender rotation.x = PI/2)
    # After t2b the tube must lie along Blender Y; rotation.x = PI/2 maps Z-axis → -Y ✓
    along = (math.pi / 2, 0, 0)

    # Top tube: h=1.5
    add_cylinder("TopTube",  0.1, 1.5, 8, (0, 1.8,  0.1),  along, frame, col)

    # Down tube: angled  (Three.js rotation.x = PI/3.5 ≈ 51°)
    add_cylinder("DownTube", 0.1, 1.6, 8, (0, 1.3,  0.2),  (math.pi / 3.5, 0, 0), frame, col)

    # Seat tube: slight backward lean  (Three.js rotation.x = PI/-13 ≈ -14°)
    add_cylinder("SeatTube", 0.1, 1.3, 8, (0, 1.35, -0.6), (math.pi / -13, 0, 0), frame, col)

    # Seat post (silver)
    add_cylinder("SeatPost", 0.09, 1.7, 8, (0, 1.55, -0.65), (math.pi / -13, 0, 0), accent, col)

    # Head tube (slight angle)
    add_cylinder("HeadTube", 0.1, 0.45, 8, (0, 1.8, 0.9), (math.pi / -16, 0, 0), frame, col)

    # Stem (silver, same angle as head tube)
    add_cylinder("Stem", 0.09, 0.6, 8, (0, 1.8, 0.9), (math.pi / -16, 0, 0), accent, col)

    # Handlebars: span across bike width (X-axis)
    # Three.js rotation.set(PI/2, 0, 1.5) → bars effectively across width
    # Blender: rotation.y = PI/2 orients cylinder axis along X ✓
    add_cylinder("Handlebars", 0.1, 1.6, 8, (0, 2.15, 0.85), (0, math.pi / 2, 0), accent, col)

    # Saddle: Three.js BoxGeometry(0.5, 0.2, 0.8)
    add_box("Saddle", (0.5, 0.2, 0.8), (0, 2.3, -0.8), (0, 0, 0), seat, col)

    print("✓ Bike collection built")


# ─────────────────────────────────────────────────────────
#  Rider
# ─────────────────────────────────────────────────────────

def build_rider():
    col = make_collection("Rider")

    skin    = make_material("Skin",     (1.0,  0.855, 0.675), roughness=0.9)
    clothes = make_material("Clothes",  (0.18, 0.31,  0.565), roughness=0.9)
    black   = make_material("Black",    (0.02, 0.02,  0.02),  roughness=0.9)
    red     = make_material("Cap_Red",  (1.0,  0.2,   0.2),   roughness=0.8)

    # Torso: BoxGeometry(0.8, 1.2, 0.5), slight forward lean (rotation.x = PI/12)
    add_box("Torso", (0.8, 1.2, 0.5), (0, 2.8, -0.8), (math.pi / 12, 0, 0), clothes, col)

    # Head: BoxGeometry(0.6, 0.6, 0.6)
    add_box("Head",  (0.6, 0.6, 0.6), (0, 3.8, -0.7), (0, 0, 0), skin, col)

    # Eyes: oval spheres (Three.js scale 1, 1.3, 0.6 → Blender X=1, Y=0.6, Z=1.3)
    add_sphere("LeftEye",  0.08, ( 0.15, 3.85, -0.4), (1.0, 0.6, 1.3), black, col)
    add_sphere("RightEye", 0.08, (-0.15, 3.85, -0.4), (1.0, 0.6, 1.3), black, col)

    # Arms: BoxGeometry(0.2, 1.2, 0.2), angled forward (rotation.x = PI/-2.7)
    add_box("LeftArm",  (0.2, 1.2, 0.2), ( 0.5, 3.1, -0.3), (math.pi / -2.7, 0, 0), skin, col)
    add_box("RightArm", (0.2, 1.2, 0.2), (-0.5, 3.1, -0.3), (math.pi / -2.7, 0, 0), skin, col)

    # Legs: BoxGeometry(0.25, 0.8, 0.25)
    add_box("LeftLeg",  (0.25, 0.8, 0.25), ( 0.25, 1.8, -0.8), (0, 0, 0), clothes, col)
    add_box("RightLeg", (0.25, 0.8, 0.25), (-0.25, 1.8, -0.8), (0, 0, 0), clothes, col)

    # Cap dome: scaled sphere sitting on top of head
    add_sphere("CapDome", 0.45, (0, 4.13, -0.7), (0.65, 0.65, 0.52), red, col)

    # Cap brim: BoxGeometry(0.55, 0.05, 0.7), angled slightly down
    add_box("CapBrim", (0.55, 0.05, 0.7), (0, 4.05, -0.35), (-math.pi / 8, 0, 0), red, col)

    print("✓ Rider collection built")


# ─────────────────────────────────────────────────────────
#  Run
# ─────────────────────────────────────────────────────────

clear_scene()
build_bike()
build_rider()

print()
print("Done!  Next steps:")
print("  1. Refine geometry visually in Blender")
print("  2. File → Export → glTF 2.0 (.glb)")
print("     Transform: Y Forward, Z Up")
print("  3. Place exported .glb files in public/models/")
print("  4. Load with THREE.GLTFLoader (see file header for code)")
