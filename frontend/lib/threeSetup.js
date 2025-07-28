// lib/threeSetup.js
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const CHARACTER_ANIMATIONS = [
  'Bouncing Fight Idle.fbx',
  'Hook Punch.fbx',
  'Punching.fbx',
  'Roundhouse Kick.fbx',
  'Fist Fight A.fbx',
  'Hurricane Kick.fbx',
  'Knee Kick Lead.fbx',
  'Au To Role.fbx',
  'Body Block.fbx',
  'Taunt.fbx',
  'Death From Right.fbx',
  'Defeated.fbx',
  'Martelo 2.fbx',
  'Esquiva 2.fbx',
  'Esquiva 5.fbx',
];

const CHARACTER_COUNT = 2; // Brad and Remy
const ANIMATIONS_PER_CHARACTER = CHARACTER_ANIMATIONS.length;

export const initThreeScene = (mountRef, onLoadComplete) => {
  const gameRef = {
    scene: null,
    camera: null,
    renderer: null,
    boss: null,
    remy: null,
    mixerBoss: null,
    mixerRemy: null,
    clock: new THREE.Clock(),
    actions: {
      boss: {},
      remy: {},
    },
    currentActions: {
      boss: null,
      remy: null,
    },
    isAnimating: {
      boss: false,
      remy: false,
    },
    blocking: {
      boss: false,
      remy: false,
    },
    attacking: {
      boss: false,
      remy: false,
    },
    loadedCharacters: 0,
    loadedAnimations: { boss: 0, remy: 0 },
  };

  // --- Background Iframe Setup ---
  const iframeContainer = document.createElement('div');
  iframeContainer.style.position = 'fixed';
  iframeContainer.style.top = '0';
  iframeContainer.style.left = '0';
  iframeContainer.style.width = '100%';
  iframeContainer.style.height = '100%';
  iframeContainer.style.zIndex = '1';
  iframeContainer.style.pointerEvents = 'auto';

  const iframe = document.createElement('iframe');
  iframe.id = 'sketchfab-frame';
  iframe.title = 'Scary Basement Interior photoscan';
  iframe.src =
    'https://sketchfab.com/models/5887de4f1cf54adeb46b2eab5b92c4a7/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=1&ui_fullscreen=1&ui_annotations=0';
  iframe.frameBorder = '0';
  iframe.allowFullscreen = true;
  iframe.mozallowfullscreen = 'true';
  iframe.webkitallowfullscreen = 'true';
  iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  iframe.onload = () => {
    console.log('Sketchfab background iframe loaded.');
    loadCharacters(gameRef.scene, gameRef, onLoadComplete);
  };

  iframeContainer.appendChild(iframe);
  document.body.appendChild(iframeContainer);

  // --- Three.js Scene Setup ---
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'relative';
  renderer.domElement.style.zIndex = '4';

  mountRef.current.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  gameRef.scene = scene;
  gameRef.camera = camera;
  gameRef.renderer = renderer;

  // --- Animation Loop ---
  const animate = () => {
    requestAnimationFrame(animate);
    const delta = gameRef.clock.getDelta();
    if (gameRef.mixerBoss) {
      gameRef.mixerBoss.update(delta);
      if (gameRef.boss) {
        gameRef.boss.position.y = -2; // Keep boss on ground
      }
    }
    if (gameRef.mixerRemy) {
      gameRef.mixerRemy.update(delta);
      if (gameRef.remy) {
        gameRef.remy.position.y = 0; // Keep remy on ground
      }
    }
    renderer.render(scene, camera);
  };
  animate();

  // --- Handle Resize ---
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);

  // --- Cleanup Function ---
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    if (mountRef.current && renderer.domElement) {
      mountRef.current.removeChild(renderer.domElement);
    }
    if (document.body.contains(iframeContainer)) {
      document.body.removeChild(iframeContainer);
    }
    renderer.dispose();
    // Consider disposing geometries/materials if needed
  };

  return { gameRef, cleanup, handleResize }; // Return necessary refs and cleanup
};

const loadCharacters = (scene, gameRef, onLoadComplete) => {
  const loader = new FBXLoader();

  // --- Load Boss (Brad) ---
  loader.load(
    '/characters/The Boss.fbx',
    (object) => {
      console.log('Brad loaded successfully:', object);
      object.scale.set(0.02, 0.02, 0.02);
      object.position.set(-0.5, -2, 0);
      object.rotation.y = Math.PI / 2;
      object.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(object);
      gameRef.boss = object;
      gameRef.mixerBoss = new THREE.AnimationMixer(object);

      let loadedCount = 0;
      CHARACTER_ANIMATIONS.forEach((animFile) => {
        loader.load(
          `/Animations/${animFile}`,
          (anim) => {
            if (anim.animations.length > 0) {
              const action = gameRef.mixerBoss.clipAction(anim.animations[0]);
              gameRef.actions.boss[animFile] = action;
              if (animFile === 'Bouncing Fight Idle.fbx') {
                action.setLoop(THREE.LoopRepeat);
                action.play();
                gameRef.currentActions.boss = action;
              }
            }
            loadedCount++;
            gameRef.loadedAnimations.boss = loadedCount;
            if (loadedCount === ANIMATIONS_PER_CHARACTER && gameRef.remy) {
              gameRef.loadedCharacters++;
              if (gameRef.loadedCharacters === CHARACTER_COUNT) {
                onLoadComplete(); // Signal completion
              }
            }
          },
          undefined,
          (error) => {
            console.error(`Error loading Brad animation ${animFile}:`, error);
            loadedCount++;
            gameRef.loadedAnimations.boss = loadedCount;
            if (loadedCount === ANIMATIONS_PER_CHARACTER && gameRef.remy) {
              gameRef.loadedCharacters++;
              if (gameRef.loadedCharacters === CHARACTER_COUNT) {
                onLoadComplete(); // Signal completion even with errors
              }
            }
          }
        );
      });
    },
    undefined,
    (error) => {
      console.error('Error loading Brad character:', error);
      // Attempt to signal completion even if one character fails
      if (gameRef.remy) {
        gameRef.loadedCharacters++;
        if (gameRef.loadedCharacters === CHARACTER_COUNT) {
          onLoadComplete();
        }
      }
    }
  );

  // --- Load Remy ---
  loader.load(
    '/characters/Remy.fbx',
    (object) => {
      object.scale.set(0.01, 0.01, 0.01);
      object.position.set(2.5, 0, 0);
      object.rotation.y = -Math.PI / 2;
      object.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(object);
      gameRef.remy = object;
      gameRef.mixerRemy = new THREE.AnimationMixer(object);

      let loadedCount = 0;
      CHARACTER_ANIMATIONS.forEach((animFile) => {
        loader.load(
          `/Animations/${animFile}`,
          (anim) => {
            if (anim.animations.length > 0) {
              const action = gameRef.mixerRemy.clipAction(anim.animations[0]);
              gameRef.actions.remy[animFile] = action;
              if (animFile === 'Bouncing Fight Idle.fbx') {
                action.setLoop(THREE.LoopRepeat);
                action.play();
                gameRef.currentActions.remy = action;
              }
            }
            loadedCount++;
            gameRef.loadedAnimations.remy = loadedCount;
            if (loadedCount === ANIMATIONS_PER_CHARACTER && gameRef.boss) {
              gameRef.loadedCharacters++;
              if (gameRef.loadedCharacters === CHARACTER_COUNT) {
                onLoadComplete(); // Signal completion
              }
            }
          },
          undefined,
          (error) => {
            console.error(`Error loading Remy animation ${animFile}:`, error);
            loadedCount++;
            gameRef.loadedAnimations.remy = loadedCount;
            if (loadedCount === ANIMATIONS_PER_CHARACTER && gameRef.boss) {
              gameRef.loadedCharacters++;
              if (gameRef.loadedCharacters === CHARACTER_COUNT) {
                onLoadComplete(); // Signal completion even with errors
              }
            }
          }
        );
      });
    },
    undefined,
    (error) => {
      console.error('Error loading Remy character:', error);
      // Attempt to signal completion even if one character fails
      if (gameRef.boss) {
        gameRef.loadedCharacters++;
        if (gameRef.loadedCharacters === CHARACTER_COUNT) {
          onLoadComplete();
        }
      }
    }
  );
};

// --- Animation Control Utilities ---
export const stopAllAnimations = (character, gameRef) => {
  const actions = gameRef.actions[character];
  Object.values(actions).forEach((action) => {
    if (action && action.isRunning()) {
      action.stop();
    }
  });
};

export const resetToIdle = (character, gameRef) => {
  stopAllAnimations(character, gameRef);
  const actions = gameRef.actions[character];
  const charObject = character === 'boss' ? gameRef.boss : gameRef.remy;
  if (charObject) {
    charObject.position.y = character === 'boss' ? -2 : 0;
  }
  if (actions['Bouncing Fight Idle.fbx']) {
    const idleAction = actions['Bouncing Fight Idle.fbx'];
    idleAction.reset().setLoop(THREE.LoopRepeat).play();
    gameRef.currentActions[character] = idleAction;
  }
};

// --- Movement Logic ---
export const moveTowardsOpponent = (
  attacker,
  attackType,
  gameRef,
  onReturnComplete
) => {
  const isBoss = attacker === 'boss';
  const character = isBoss ? gameRef.boss : gameRef.remy;
  const opponent = isBoss ? gameRef.remy : gameRef.boss;

  if (!character || !opponent) return;

  const originalY = character.position.y;
  const direction = new THREE.Vector3();
  opponent.getWorldPosition(direction);
  character.getWorldPosition(direction);
  direction.sub(character.position).normalize();

  const moveDistance =
    attackType === 'punch' ? 0.8 : attackType === 'kick' ? 1.2 : 0.5;
  const targetPosition = character.position
    .clone()
    .add(direction.multiplyScalar(moveDistance));
  targetPosition.y = originalY;

  const startPosition = character.position.clone();
  const duration = 0.3;
  const startTime = Date.now();

  const moveCharacter = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);
    character.position.lerpVectors(startPosition, targetPosition, progress);
    character.position.y = originalY;

    if (progress < 1) {
      requestAnimationFrame(moveCharacter);
    } else {
      setTimeout(() => {
        const returnStart = character.position.clone();
        const returnTarget = isBoss
          ? new THREE.Vector3(-0.5, -2, 0) // Boss returns to original position
          : new THREE.Vector3(2.5, 0, 0); // Remy returns to original position
        const returnStartTime = Date.now();
        const returnCharacter = () => {
          const returnElapsed = (Date.now() - returnStartTime) / 1000;
          const returnProgress = Math.min(returnElapsed / 0.3, 1);
          character.position.lerpVectors(
            returnStart,
            returnTarget,
            returnProgress
          );
          character.position.y = isBoss ? -2 : 0;
          if (returnProgress < 1) {
            requestAnimationFrame(returnCharacter);
          } else {
            character.position.y = isBoss ? -2 : 0;
            gameRef.attacking[attacker] = false;
            if (onReturnComplete) onReturnComplete(); // Callback when return is done
          }
        };
        requestAnimationFrame(returnCharacter);
      }, 200);
    }
    character.position.y = originalY;
  };
  requestAnimationFrame(moveCharacter);
};
