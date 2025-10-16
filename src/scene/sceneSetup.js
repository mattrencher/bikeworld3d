// Scene setup and initialization for BikeWorld3D
import * as THREE from "three";
import { CONFIG } from "../utils/constants.js";

export class SceneSetup {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
  }

  /**
   * Initialize the Three.js scene, camera, and renderer
   */
  init(container) {
    this.container = container;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.SKY_COLOR);
    this.scene.fog = new THREE.Fog(CONFIG.SKY_COLOR, 40, 85);

    // Create camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA_FOV,
      aspect,
      0.1,
      1000
    );
    this.camera.position.set(
      CONFIG.CAMERA_POSITION.x,
      CONFIG.CAMERA_POSITION.y,
      CONFIG.CAMERA_POSITION.z
    );
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Add lights
    this.addLights();

    // Add ground plane
    this.addGround();

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());

    console.log("✓ Scene initialized");
  }

  /**
   * Add lighting to the scene
   */
  addLights() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(CONFIG.AMBIENT_LIGHT, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(
      CONFIG.DIRECTIONAL_LIGHT,
      0.8
    );
    directionalLight.position.set(50, 80, 40);
    directionalLight.castShadow = true;

    // Shadow configuration
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    this.scene.add(directionalLight);

    // Add a subtle hemisphere light for more natural lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);

    console.log("✓ Lights added");
  }

  /**
   * Add ground plane to the scene
   */
  addGround() {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: CONFIG.GROUND_COLOR,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    console.log("✓ Ground added");
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

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
