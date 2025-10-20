// Inspector Scene Setup - Clean scene for model inspection
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class InspectorScene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.gridHelper = null;
    this.axisHelper = null;

    this.init();
  }

  /**
   * Initialize the Three.js scene for inspection
   */
  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x484848); // Dark background

    // Camera - perspective with wider FOV for inspection
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // OrbitControls for inspection
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Smooth motion
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 100;
    this.controls.target.set(0, 2, 0); // Look at model center height

    // Lighting - bright and even for inspection
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(10, 20, 10);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 1024;
    directionalLight1.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight1);

    // Add another light from opposite side for even illumination
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, 10, -10);
    this.scene.add(directionalLight2);

    // Fill light from below
    const fillLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    fillLight.position.set(0, -10, 0);
    this.scene.add(fillLight);

    // Grid helper for reference
    this.gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    this.scene.add(this.gridHelper);

    // Axis helper for orientation (RGB = XYZ)
    this.axisHelper = new THREE.AxesHelper(8);
    this.scene.add(this.axisHelper);

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());

    // Handle R key for reset camera
    window.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        this.resetCamera();
      }
    });

    console.log("✓ Inspector scene initialized");
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Render the scene
   */
  render() {
    this.controls.update(); // Update damping
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Add model to scene and center camera on it
   */
  setModel(modelGroup) {
    // Remove any existing models (keep grid and lights)
    const existingModels = this.scene.children.filter(
      (child) => child.userData.isModel === true
    );
    existingModels.forEach((model) => this.scene.remove(model));

    // Add new model
    modelGroup.userData.isModel = true;
    this.scene.add(modelGroup);

    // Calculate bounding box to center camera
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Reset controls target to model center
    this.controls.target.copy(center);

    // Position camera based on model size
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2.5;

    this.camera.position.set(
      center.x + distance * 0.7,
      center.y + distance * 0.5,
      center.z + distance * 0.7
    );

    this.controls.update();

    console.log(
      `✓ Model loaded - Size: ${size.x.toFixed(1)} x ${size.y.toFixed(
        1
      )} x ${size.z.toFixed(1)}`
    );
  }

  /**
   * Reset camera to default position
   */
  resetCamera() {
    if (this.controls.target) {
      const target = this.controls.target;
      const distance = 15;

      this.camera.position.set(
        target.x + distance * 0.7,
        target.y + distance * 0.5,
        target.z + distance * 0.7
      );

      this.controls.update();
      console.log("✓ Camera reset");
    }
  }

  /**
   * Get the scene
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the camera
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the renderer
   */
  getRenderer() {
    return this.renderer;
  }
}
