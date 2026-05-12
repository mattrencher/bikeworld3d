// Scene setup and initialization for BikeWorld3D
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { CONFIG } from "../utils/constants.js";

export class SceneSetup {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
    this.environmentLoaded = false;
    this.skyboxMesh = null;
  }

  /**
   * Initialize the Three.js scene, camera, and renderer
   */
  init(container) {
    this.container = container;

    // Create scene
    this.scene = new THREE.Scene();
    // Set a fallback color for background
    this.scene.background = new THREE.Color(CONFIG.SKY_COLOR);
    this.scene.fog = new THREE.Fog(CONFIG.SKY_COLOR, 60, 190);

    // Create camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA_FOV,
      aspect,
      0.1,
      2000, // Increased to see the skybox sphere
    );
    this.camera.position.set(
      CONFIG.CAMERA_POSITION.x,
      CONFIG.CAMERA_POSITION.y,
      CONFIG.CAMERA_POSITION.z,
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
   * Load HDR environment map and create skybox mesh
   * @param {THREE.Group} cityGroup - The city group to attach skybox to
   */
  loadHDREnvironment(cityGroup) {
    const rgbeLoader = new RGBELoader();

    console.log("🔄 Loading HDR environment...");

    rgbeLoader.load(
      "/assets/Space_2K.hdr",
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        // Create a large sphere for the skybox (smaller than camera far plane)
        const skyboxGeometry = new THREE.SphereGeometry(800, 60, 40);

        // Custom shader material that applies fog to HDR texture
        const skyboxMaterial = new THREE.ShaderMaterial({
          uniforms: {
            envMap: { value: texture },
            fogColor: { value: this.scene.fog.color },
            fogNear: { value: this.scene.fog.near },
            fogFar: { value: this.scene.fog.far },
          },
          vertexShader: `
            varying vec3 vPosition;
            
            void main() {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D envMap;
            uniform vec3 fogColor;
            uniform float fogNear;
            uniform float fogFar;
            
            varying vec3 vPosition;
            
            void main() {
              // Use local position to calculate direction (automatically rotates with mesh)
              vec3 direction = normalize(vPosition);
              
              // Convert direction to UV coordinates for equirectangular mapping
              float phi = atan(direction.z, direction.x);
              float theta = acos(direction.y);
              vec2 uv = vec2(phi / (2.0 * 3.14159265359) + 0.5, theta / 3.14159265359);
              
              // Sample the HDR texture
              vec4 texColor = texture2D(envMap, uv);
              
              // Calculate fog based on distance from camera
              float depth = gl_FragCoord.z / gl_FragCoord.w;
              float fogFactor = smoothstep(fogNear, fogFar, depth);
              
              // Mix HDR color with fog color
              vec3 finalColor = mix(texColor.rgb, fogColor, fogFactor * 0.65); // 65% max fog blend
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `,
          side: THREE.BackSide,
          depthWrite: false,
        });

        this.skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.skyboxMesh.name = "HDR_Skybox";

        // Add to city group so it rotates with the world
        if (cityGroup) {
          cityGroup.add(this.skyboxMesh);
          console.log("✓ HDR skybox loaded and parented to city group");
          console.log(
            "   Skybox parent:",
            this.skyboxMesh.parent.name || "unnamed group",
          );
          console.log("   City group children:", cityGroup.children.length);
        } else {
          // Fallback: add to scene if city group not available yet
          this.scene.add(this.skyboxMesh);
          console.log("✓ HDR skybox loaded (will be reparented)");
        }

        // Set as environment map for reflections
        this.scene.environment = texture;

        // Hide the solid color background now that we have the skybox
        this.scene.background = null;

        this.environmentLoaded = true;
      },
      (progress) => {
        if (progress.total) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`📥 Loading HDR: ${percent.toFixed(0)}%`);
        }
      },
      (error) => {
        console.error("❌ Error loading HDR:", error);
        // Keep the fallback color background
      },
    );
  }

  /**
   * Get the skybox mesh for reparenting if needed
   */
  getSkyboxMesh() {
    return this.skyboxMesh;
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
      0.8,
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

    // Decorative concentric rings for visual depth on the ground plane.
    // These are static (not in cityGroup) so they serve as calm depth cues
    // while the rotating path features above provide the motion.
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x245228,
      side: THREE.DoubleSide,
    });
    [45, 65, 82].forEach((r) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.4, 64),
        ringMat,
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      this.scene.add(ring);
    });

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

  /**
   * Attach skybox to city group after city is created
   * @param {THREE.Group} cityGroup - The city group to attach skybox to
   */
  attachSkyboxToCityGroup(cityGroup) {
    if (this.skyboxMesh && cityGroup) {
      // Remove from scene if it was added there
      if (this.skyboxMesh.parent === this.scene) {
        this.scene.remove(this.skyboxMesh);
      }
      // Add to city group
      cityGroup.add(this.skyboxMesh);
      console.log("✓ Skybox reparented to city group");
    }
  }
}
