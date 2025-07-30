import * as THREE from 'three';

export class GameEngine {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.mountRef = null;
  }

  initialize(mountRef) {
    this.mountRef = mountRef;

    // Create transparent scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Make scene background transparent

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);

    // Create renderer with alpha (transparency)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'relative';
    this.renderer.domElement.style.zIndex = '4'; // In front of iframe
    this.mountRef.appendChild(this.renderer.domElement);

    // Add lighting (adjust as needed for Sketchfab background)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased ambient light
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7); // Position to match general scene lighting
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Setup background iframe
    this.setupBackgroundIframe();

    // Handle resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    return this.scene;
  }

  setupBackgroundIframe() {
    // --- Background Iframe Setup (Updated for Interactivity and New Model) ---
    const iframeContainer = document.createElement('div');
    iframeContainer.style.position = 'fixed';
    iframeContainer.style.top = '0';
    iframeContainer.style.left = '0';
    iframeContainer.style.width = '100%';
    iframeContainer.style.height = '100%';
    iframeContainer.style.zIndex = '1'; // Behind Three.js scene
    // --- KEY CHANGE: Set to 'auto' to allow user interaction ---
    iframeContainer.style.pointerEvents = 'auto'; // Allow clicks/touches on the iframe

    const iframe = document.createElement('iframe');
    iframe.id = 'sketchfab-frame';
    // --- KEY CHANGE: Use the new Scary Basement model URL ---
    iframe.title = 'Scary Basement Interior photoscan'; // Add title for accessibility
    iframe.src =
      'https://sketchfab.com/models/5887de4f1cf54adeb46b2eab5b92c4a7/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=1&ui_fullscreen=1&ui_annotations=0';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.mozallowfullscreen = 'true';
    iframe.webkitallowfullscreen = 'true';
    // Ensure the 'allow' attribute matches the one from the provided embed code
    iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Append iframe
    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(mixers) {
    const delta = this.clock.getDelta();

    // Update all mixers
    if (mixers.boss) {
      mixers.boss.update(delta);
    }
    if (mixers.remy) {
      mixers.remy.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  cleanup() {
    window.removeEventListener('resize', this.handleResize);
    if (this.mountRef && this.renderer.domElement) {
      this.mountRef.removeChild(this.renderer.domElement);
    }
    // Remove iframe background on unmount
    const iframeContainer =
      document.querySelector('#sketchfab-frame')?.parentElement;
    if (iframeContainer && document.body.contains(iframeContainer)) {
      document.body.removeChild(iframeContainer);
    }
    // Dispose of renderer and scene properly to prevent memory leaks
    this.renderer.dispose();
  }
}
