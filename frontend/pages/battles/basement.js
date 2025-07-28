// File: pages/battles/basement.js
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export default function StreetBattle() {
  const mountRef = useRef(null);
  const [bossHealth, setBossHealth] = useState(100);
  const [remyHealth, setRemyHealth] = useState(100);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ boss: 0, remy: 0 });
  const [combatLog, setCombatLog] = useState([]);
  const gameRef = useRef({
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
  });
  // Inside the main useEffect, REPLACE the existing iframe setup section with this:

  useEffect(() => {
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
    // Optional but good practice: Ensure iframe itself can receive events (usually default)
    // iframe.style.pointerEvents = 'auto';

    // Create scene, camera, renderer *first*
    // Create transparent scene
    const scene = new THREE.Scene();
    scene.background = null; // Make scene background transparent

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    // Create renderer with alpha (transparency)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'relative';
    renderer.domElement.style.zIndex = '4'; // In front of iframe
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting (adjust as needed for Sketchfab background)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7); // Position to match general scene lighting
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Save references
    gameRef.current.scene = scene;
    gameRef.current.camera = camera;
    gameRef.current.renderer = renderer;

    // Define loadCharacters inside useEffect or ensure it's accessible
    // For this example, I'll assume loadCharacters is defined outside but needs scene.
    // If it's defined inside, move its definition here.
    // Define the handler for iframe load
    const handleIframeLoad = () => {
      console.log('Sketchfab background iframe loaded.');
      // Now that the background is loaded, load the characters
      loadCharacters(scene); // Pass the scene object
    };

    // Assign the load handler to the iframe
    iframe.onload = handleIframeLoad;

    // Append iframe *after* assigning the onload handler
    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer);
    // --- End Background Iframe Setup ---

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = gameRef.current.clock.getDelta();

      if (gameRef.current.mixerBoss) {
        gameRef.current.mixerBoss.update(delta);
        // --- FIX: Force boss Y position to -2 every frame ---
        // This counteracts any Y offset from animations.
        if (gameRef.current.boss) {
          gameRef.current.boss.position.y = -2;
        }
        // --- END FIX ---
      }

      if (gameRef.current.mixerRemy) {
        gameRef.current.mixerRemy.update(delta);
        // Remy stays at Y=0
        if (gameRef.current.remy) {
          gameRef.current.remy.position.y = 0;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Remove iframe background on unmount
      if (document.body.contains(iframeContainer)) {
        // Remove the event listener if needed (though browser usually handles it)
        // iframe.onload = null; // Good practice, though often not strictly necessary for removal
        document.body.removeChild(iframeContainer);
      }
      // Dispose of renderer and scene properly to prevent memory leaks
      renderer.dispose();
      // Dispose of geometries and materials if you have direct references
      // scene.traverse(child => {
      //   if (child.isMesh) {
      //     if (child.geometry) child.geometry.dispose();
      //     if (child.material) {
      //       // Handle ArrayMaterial if necessary
      //       if (Array.isArray(child.material)) {
      //         child.material.forEach(material => material.dispose());
      //       } else {
      //         child.material.dispose();
      //       }
      //     }
      //   }
      // });
    };
  }, []); // Ensure loadCharacters is either defined inside or its dependencies are handled correctly

  const loadCharacters = (scene) => {
    const loader = new FBXLoader();

    // Load Brad (facing Remy)
    loader.load(
      '/characters/The Boss.fbx',
      (object) => {
        console.log('Brad loaded successfully:', object);
        // Use same scale as Remy for consistency
        object.scale.set(0.02, 0.02, 0.02);
        // Position Brad on the ground (Y=-2) and adjust X/Z as needed
        // --- CONFIRMED: Boss Y position is set to -2 ---
        object.position.set(-0.5, -2, 0); // Keep Y at -2 for his ground level
        object.rotation.y = Math.PI / 2; // Face Remy

        // Ensure visibility and shadows
        object.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(object);
        gameRef.current.boss = object;
        gameRef.current.mixerBoss = new THREE.AnimationMixer(object);

        // Use same animations as Remy
        const animations = [
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

        let loadedCount = 0;

        // Load all animations for Brad
        animations.forEach((animFile) => {
          loader.load(
            `/Animations/${animFile}`,
            (anim) => {
              if (anim.animations.length > 0) {
                const action = gameRef.current.mixerBoss.clipAction(
                  anim.animations[0]
                );
                gameRef.current.actions.boss[animFile] = action;

                // Set idle as default
                if (animFile === 'Bouncing Fight Idle.fbx') {
                  action.setLoop(THREE.LoopRepeat);
                  action.play();
                  gameRef.current.currentActions.boss = action;
                }
              }

              loadedCount++;
              setProgress((prev) => ({
                ...prev,
                boss: loadedCount,
              }));

              // Note: Progress check logic might need adjustment if animation counts differ
              // For now, assuming both have 15 animations like in the list above.
              // You might need to adjust the checkLoadingCompletion logic or the progress tracking
              // if the actual number of successfully loaded animations differs.

              if (loadedCount === animations.length) {
                // Check if both characters are loaded
                if (gameRef.current.boss && gameRef.current.remy) {
                  // Check if animations for both are loaded (approximate)
                  // A more robust check would track progress for both characters separately
                  // and compare to their respective animation counts.
                  // This is a simplification based on the assumption both lists have 15 items.
                  // You might see "Brad: 15/18" in the UI if the old checkLoadingCompletion logic
                  // is still expecting 18. You can adjust that too.
                  if (progress.remy >= 15) {
                    // Assuming Remy also has 15 animations loaded
                    setLoading(false);
                  }
                }
              }
            },
            undefined,
            (error) => {
              console.error(`Error loading Brad animation ${animFile}:`, error);
              loadedCount++;
              setProgress((prev) => ({
                ...prev,
                boss: loadedCount,
              }));

              if (loadedCount === animations.length) {
                if (gameRef.current.boss && gameRef.current.remy) {
                  if (progress.remy >= 15) {
                    setLoading(false);
                  }
                }
              }
            }
          );
        });
      },
      undefined,
      (error) => {
        console.error('Error loading Brad character:', error);
        // Attempt to finish loading even if one character fails
        if (gameRef.current.remy) {
          if (progress.remy >= 15) {
            setLoading(false);
          }
        }
      }
    );

    // Load Remy (facing Boss)
    loader.load(
      '/characters/Remy.fbx',
      (object) => {
        object.scale.set(0.01, 0.01, 0.01);
        // Position Remy on the ground (Y=0) and adjust X/Z as needed
        // --- CONFIRMED: Remy Y position is correctly set to 0 ---
        object.position.set(2.5, 0, 0); // Keep Y at 0 for ground level
        object.rotation.y = -Math.PI / 2; // Face Boss

        object.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(object);
        gameRef.current.remy = object;
        gameRef.current.mixerRemy = new THREE.AnimationMixer(object);

        // Load animations
        const animations = [
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

        let loadedCount = 0;

        animations.forEach((animFile) => {
          loader.load(
            `/Animations/${animFile}`,
            (anim) => {
              if (anim.animations.length > 0) {
                const action = gameRef.current.mixerRemy.clipAction(
                  anim.animations[0]
                );
                gameRef.current.actions.remy[animFile] = action;

                // Set idle as default
                if (animFile === 'Bouncing Fight Idle.fbx') {
                  action.setLoop(THREE.LoopRepeat);
                  action.play();
                  gameRef.current.currentActions.remy = action;
                }
              }

              loadedCount++;
              setProgress((prev) => ({
                ...prev,
                remy: loadedCount,
              }));

              if (loadedCount === animations.length) {
                if (gameRef.current.boss && gameRef.current.remy) {
                  if (progress.boss >= 15) {
                    // Assuming Brad also has 15 animations loaded
                    setLoading(false);
                  }
                }
              }
            },
            undefined,
            (error) => {
              console.error(`Error loading Remy animation ${animFile}:`, error);
              loadedCount++;
              setProgress((prev) => ({
                ...prev,
                remy: loadedCount,
              }));

              if (loadedCount === animations.length) {
                if (gameRef.current.boss && gameRef.current.remy) {
                  if (progress.boss >= 15) {
                    setLoading(false);
                  }
                }
              }
            }
          );
        });
      },
      undefined,
      (error) => {
        console.error('Error loading Remy character:', error);
        // Attempt to finish loading even if one character fails
        if (gameRef.current.boss) {
          if (progress.boss >= 15) {
            setLoading(false);
          }
        }
      }
    );
  };

  // Stop all animations for a character
  const stopAllAnimations = (character) => {
    const actions = gameRef.current.actions[character];
    Object.values(actions).forEach((action) => {
      if (action && action.isRunning()) {
        action.stop();
      }
    });
  };

  // Reset to idle animation
  const resetToIdle = (character) => {
    stopAllAnimations(character);
    const actions = gameRef.current.actions[character];
    const charObject =
      character === 'boss' ? gameRef.current.boss : gameRef.current.remy;

    // --- FIX: Explicitly reset Y position to boss's ground level (-2) or remy's (0) ---
    if (charObject) {
      charObject.position.y = character === 'boss' ? -2 : 0;
    }
    // --- END FIX ---

    if (actions['Bouncing Fight Idle.fbx']) {
      const idleAction = actions['Bouncing Fight Idle.fbx'];
      idleAction.reset().setLoop(THREE.LoopRepeat).play();
      gameRef.current.currentActions[character] = idleAction;
    }
  };

  // Play sound effect
  const playSound = (soundFile) => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.3;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    }
  };

  // Add to combat log
  const addToCombatLog = (message) => {
    setCombatLog((prev) => [...prev.slice(-4), message]);
  };

  // Move character towards opponent during attack
  const moveTowardsOpponent = (attacker, attackType) => {
    const isBoss = attacker === 'boss';
    const character = isBoss ? gameRef.current.boss : gameRef.current.remy;
    const opponent = isBoss ? gameRef.current.remy : gameRef.current.boss;
    if (!character || !opponent) return;

    // --- FIX: Store original Y for correct calculation ---
    const originalY = character.position.y; // This will be -2 for boss, 0 for Remy
    // --- END FIX ---

    // Calculate direction to opponent (from current position)
    const direction = new THREE.Vector3();
    opponent.getWorldPosition(direction);
    character.getWorldPosition(direction); // Get current position
    direction.sub(character.position).normalize(); // Direction vector

    // Move character forward during attack
    const moveDistance =
      attackType === 'punch' ? 0.8 : attackType === 'kick' ? 1.2 : 0.5;
    // Calculate target position based on the current position (including original Y)
    const targetPosition = character.position
      .clone()
      .add(direction.multiplyScalar(moveDistance));
    // --- FIX: Ensure target Y matches the character's ground level ---
    targetPosition.y = originalY; // Keep Y consistent with starting level
    // --- END FIX ---

    // Animate movement
    const startPosition = character.position.clone();
    const duration = 0.3; // 300ms
    const startTime = Date.now();

    const moveCharacter = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Interpolate position
      character.position.lerpVectors(startPosition, targetPosition, progress);
      // --- FIX: Lock Y to original ground level during forward movement ---
      character.position.y = originalY; // This prevents floating/sinking during lerp
      // --- END FIX ---

      if (progress < 1) {
        requestAnimationFrame(moveCharacter);
      } else {
        // Return to original position after attack
        setTimeout(() => {
          const returnStart = character.position.clone();
          // Ensure return to correct ground level
          const returnTarget = isBoss
            ? new THREE.Vector3(-1.5, -2, 0) // Boss returns to Y=-2
            : new THREE.Vector3(1.5, 0, 0); // Remy returns to Y=0
          const returnStartTime = Date.now();

          const returnCharacter = () => {
            const returnElapsed = (Date.now() - returnStartTime) / 1000;
            const returnProgress = Math.min(returnElapsed / 0.3, 1);
            character.position.lerpVectors(
              returnStart,
              returnTarget,
              returnProgress
            );
            // --- FIX: Ensure Y stays at correct ground level during return animation ---
            character.position.y = isBoss ? -2 : 0;
            // --- END FIX ---
            if (returnProgress < 1) {
              requestAnimationFrame(returnCharacter);
            } else {
              // Explicitly set Y to correct ground level one final time at the end
              character.position.y = isBoss ? -2 : 0;
              // --- FIX: Mark attacking as false when return is complete ---
              gameRef.current.attacking[attacker] = false;
              // --- END FIX ---
            }
          };
          requestAnimationFrame(returnCharacter);
        }, 200);
      }
      // --- FIX: Redundant but safe Y lock during forward movement ---
      character.position.y = originalY; // Ensure Y stays locked to original level
      // --- END FIX ---
    };

    requestAnimationFrame(moveCharacter);
  };

  // Execute attack with proper positioning
  const executeAttack = (
    attacker,
    attackAnimation,
    damage,
    attackType = 'punch'
  ) => {
    if (loading || bossHealth <= 0 || remyHealth <= 0) return;

    const isBoss = attacker === 'boss';
    const defender = isBoss ? 'remy' : 'boss';
    const attackerActions = isBoss
      ? gameRef.current.actions.boss
      : gameRef.current.actions.remy;
    const defenderActions = isBoss
      ? gameRef.current.actions.remy
      : gameRef.current.actions.boss;
    const defenderIsBlocking = isBoss
      ? gameRef.current.blocking.remy
      : gameRef.current.blocking.boss;

    // Mark as attacking
    gameRef.current.attacking[attacker] = true; // --- FIX: Set attacking to true at the start ---

    // Move towards opponent
    moveTowardsOpponent(attacker, attackType);

    // Stop current animations
    if (gameRef.current.currentActions[attacker]) {
      gameRef.current.currentActions[attacker].stop();
    }

    // Play attack animation
    const attackAction = attackerActions[attackAnimation];
    if (!attackAction) {
      console.warn(`Animation ${attackAnimation} not found for ${attacker}`);
      gameRef.current.attacking[attacker] = false; // --- FIX: Reset attacking flag on error ---
      return;
    }

    // Play attack sound
    if (attackType === 'punch') playSound('punch.mp3');
    else if (attackType === 'kick') playSound('kick.mp3');
    else if (attackType === 'special') playSound('special.mp3');

    attackAction.reset();
    attackAction.setLoop(THREE.LoopOnce);
    attackAction.clampWhenFinished = true;
    attackAction.play();
    gameRef.current.currentActions[attacker] = attackAction;

    // Calculate damage (blocking reduces damage)
    const actualDamage = defenderIsBlocking ? Math.floor(damage * 0.3) : damage;

    // Apply damage at midpoint of animation
    const damageTime = attackAction.getClip().duration * 0.5;
    setTimeout(() => {
      if (isBoss) {
        setRemyHealth((prev) => Math.max(0, prev - actualDamage));
      } else {
        setBossHealth((prev) => Math.max(0, prev - actualDamage));
      }

      // Log combat action
      const attackerName = isBoss ? 'Brad' : 'Remy';
      const defenderName = isBoss ? 'Remy' : 'Brad';
      const blockText = defenderIsBlocking ? ' (BLOCKED!)' : '';
      addToCombatLog(
        `${attackerName} hits ${defenderName} for ${actualDamage} damage${blockText}`
      );

      if (actualDamage > 0) {
        showBloodEffect();
      }
    }, damageTime * 1000);

    // Play defender reaction after attack completes
    setTimeout(() => {
      attackAction.stop();
      // gameRef.current.attacking[attacker] = false; // --- MOVED: This is now handled after return movement ---
      // Determine reaction based on blocking and damage
      let reactionAnimation = 'Receive Punch To The Face.fbx';
      if (defenderIsBlocking) {
        reactionAnimation = 'Body Block.fbx';
      } else if (actualDamage >= 20) {
        reactionAnimation = 'Shoved Reaction With Spin.fbx';
      } else if (actualDamage >= 15) {
        reactionAnimation = 'Sweep Fall.fbx';
      }

      // Play reaction animation
      const reactionAction = defenderActions[reactionAnimation];
      if (reactionAction) {
        if (gameRef.current.currentActions[defender]) {
          gameRef.current.currentActions[defender].stop();
        }
        reactionAction.reset();
        reactionAction.setLoop(THREE.LoopOnce);
        reactionAction.clampWhenFinished = true;
        reactionAction.play();
        gameRef.current.currentActions[defender] = reactionAction;

        // Return defender to idle after reaction
        setTimeout(() => {
          reactionAction.stop();
          resetToIdle(defender);
        }, reactionAction.getClip().duration * 1000);
      }

      // Return attacker to idle (this happens while the attacker is returning to position)
      // --- FIX: Reset attacker to idle pose immediately, position handled by moveTowardsOpponent ---
      resetToIdle(attacker);
      // --- END FIX ---
    }, attackAction.getClip().duration * 1000);
  };

  // Execute combo attack
  const executeCombo = (attacker, comboMoves) => {
    if (loading || bossHealth <= 0 || remyHealth <= 0) return;

    const isBoss = attacker === 'boss';
    const defender = isBoss ? 'remy' : 'boss';
    const attackerActions = isBoss
      ? gameRef.current.actions.boss
      : gameRef.current.actions.remy;
    const defenderActions = isBoss
      ? gameRef.current.actions.remy
      : gameRef.current.actions.boss;

    playSound('combo.mp3');
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} performs a combo attack!`);

    let moveIndex = 0;

    const executeNextMove = () => {
      if (
        moveIndex >= comboMoves.length ||
        bossHealth <= 0 ||
        remyHealth <= 0
      ) {
        resetToIdle(attacker);
        return;
      }

      const move = comboMoves[moveIndex];
      const attackAction = attackerActions[move.animation];
      if (!attackAction) {
        moveIndex++;
        executeNextMove();
        return;
      }

      // Move towards opponent for each combo move
      moveTowardsOpponent(attacker, move.type);

      // Play attack sound
      if (move.type === 'punch') playSound('punch.mp3');
      else if (move.type === 'kick') playSound('kick.mp3');

      // Stop current animation
      if (gameRef.current.currentActions[attacker]) {
        gameRef.current.currentActions[attacker].stop();
      }

      // Play move animation
      attackAction.reset();
      attackAction.setLoop(THREE.LoopOnce);
      attackAction.clampWhenFinished = true;
      attackAction.play();
      gameRef.current.currentActions[attacker] = attackAction;

      // Apply damage at midpoint
      const damageTime = attackAction.getClip().duration * 0.5;
      setTimeout(() => {
        if (isBoss) {
          setRemyHealth((prev) => Math.max(0, prev - move.damage));
        } else {
          setBossHealth((prev) => Math.max(0, prev - move.damage));
        }

        if (move.damage > 0) {
          showBloodEffect();
        }
      }, damageTime * 1000);

      // Move to next after completion
      setTimeout(() => {
        attackAction.stop();
        moveIndex++;
        executeNextMove();
      }, attackAction.getClip().duration * 1000);
    };

    executeNextMove();
  };

  // Blocking function
  const toggleBlock = (character) => {
    if (loading || bossHealth <= 0 || remyHealth <= 0) return;

    const isBoss = character === 'boss';
    gameRef.current.blocking[character] = !gameRef.current.blocking[character];

    if (gameRef.current.blocking[character]) {
      // Start blocking
      const actions = isBoss
        ? gameRef.current.actions.boss
        : gameRef.current.actions.remy;
      const blockAction = actions['Body Block.fbx'];
      if (blockAction) {
        if (gameRef.current.currentActions[character]) {
          gameRef.current.currentActions[character].stop();
        }
        blockAction.reset();
        blockAction.setLoop(THREE.LoopRepeat);
        blockAction.play();
        gameRef.current.currentActions[character] = blockAction;
        addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} is blocking!`);
        playSound('block.mp3');
      }
    } else {
      // Stop blocking
      resetToIdle(character);
      addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} stops blocking`);
    }
  };

  // Dodge function
  const dodge = (character) => {
    if (loading || bossHealth <= 0 || remyHealth <= 0) return;

    const isBoss = character === 'boss';
    const actions = isBoss
      ? gameRef.current.actions.boss
      : gameRef.current.actions.remy;
    const dodgeAction =
      actions['Au To Role.fbx'] ||
      actions['Esquiva 2.fbx'] ||
      actions['Esquiva 5.fbx'];

    if (!dodgeAction) return;

    // Stop current animation
    if (gameRef.current.currentActions[character]) {
      gameRef.current.currentActions[character].stop();
    }

    // Play dodge animation
    dodgeAction.reset();
    dodgeAction.setLoop(THREE.LoopOnce);
    dodgeAction.clampWhenFinished = true;
    dodgeAction.play();
    gameRef.current.currentActions[character] = dodgeAction;
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} dodges!`);
    playSound('dodge.mp3');

    // Return to idle after dodge
    setTimeout(() => {
      dodgeAction.stop();
      resetToIdle(character);
    }, dodgeAction.getClip().duration * 1000);
  };

  // Taunt function
  const taunt = (character) => {
    if (loading || bossHealth <= 0 || remyHealth <= 0) return;

    const isBoss = character === 'boss';
    const actions = isBoss
      ? gameRef.current.actions.boss
      : gameRef.current.actions.remy;
    const tauntAction = actions['Taunt.fbx'];
    if (!tauntAction) return;

    // Stop current animation
    if (gameRef.current.currentActions[character]) {
      gameRef.current.currentActions[character].stop();
    }

    // Play taunt animation
    tauntAction.reset();
    tauntAction.setLoop(THREE.LoopOnce);
    tauntAction.clampWhenFinished = true;
    tauntAction.play();
    gameRef.current.currentActions[character] = tauntAction;
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} taunts!`);
    playSound('taunt.mp3');

    // Return to idle after taunt
    setTimeout(() => {
      tauntAction.stop();
      resetToIdle(character);
    }, tauntAction.getClip().duration * 1000);
  };

  // Special move function
  const specialMove = (character) => {
    if (loading || bossHealth <= 0 || remyHealth <= 0) return;

    const isBoss = character === 'boss';
    const attackAnimation = isBoss ? 'Martelo 2.fbx' : 'Hurricane Kick.fbx';
    executeAttack(character, attackAnimation, 25, 'special');
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} uses a special move!`);
  };

  // Knockout function
  const knockout = (character) => {
    if (loading) return;

    const isBoss = character === 'boss';
    const actions = isBoss
      ? gameRef.current.actions.boss
      : gameRef.current.actions.remy;
    const deathAction =
      actions['Death From Right.fbx'] || actions['Defeated.fbx'];
    if (!deathAction) return;

    // Stop current animation
    if (gameRef.current.currentActions[character]) {
      gameRef.current.currentActions[character].stop();
    }

    // Play death animation
    deathAction.reset();
    deathAction.setLoop(THREE.LoopOnce);
    deathAction.clampWhenFinished = true;
    deathAction.play();
    gameRef.current.currentActions[character] = deathAction;
    playSound('victory.mp3');
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} is knocked out!`);
  };

  const showBloodEffect = () => {
    const bloodOverlay = document.querySelector('.blood-overlay');
    if (bloodOverlay) {
      bloodOverlay.classList.remove('blood-flash');
      // Trigger reflow
      void bloodOverlay.offsetWidth;
      bloodOverlay.classList.add('blood-flash');
    }
  };

  // Handle win conditions
  useEffect(() => {
    if (bossHealth <= 0 && gameRef.current.boss) {
      knockout('boss');
    }
    if (remyHealth <= 0 && gameRef.current.remy) {
      knockout('remy');
    }
  }, [bossHealth, remyHealth]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      />

      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center',
            zIndex: 100, // Ensure it's above the iframe but below UI if needed
            background: 'rgba(0,0,0,0.8)',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          <div>Loading fighters and animations...</div>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>
            Brad: {progress.boss}/15 | Remy: {progress.remy}/15{' '}
            {/* Updated counts */}
          </div>
          <button
            onClick={() => setLoading(false)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Skip Loading (Debug)
          </button>
        </div>
      )}

      {/* Blood overlay */}
      <div
        className="blood-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0,
          zIndex: 5, // Between iframe and Three.js canvas
          background:
            'radial-gradient(circle, rgba(255,0,0,0.7) 0%, rgba(255,0,0,0) 70%)',
        }}
      ></div>

      {/* Health bars */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          zIndex: 10, // UI on top
        }}
      >
        <div>
          <div
            style={{ color: 'white', textAlign: 'center', marginBottom: '5px' }}
          >
            BRAD
          </div>
          <div
            style={{
              width: '200px',
              height: '20px',
              background: '#333',
              border: '1px solid #ff6b35',
            }}
          >
            <div
              style={{
                width: `${bossHealth}%`,
                height: '100%',
                background: 'linear-gradient(to right, #ff0000, #ff6b35)',
                transition: 'width 0.3s',
              }}
            ></div>
          </div>
          <div
            style={{ color: 'white', textAlign: 'center', marginTop: '5px' }}
          >
            {gameRef.current.blocking.boss ? 'BLOCKING' : ''}
          </div>
        </div>
        <div>
          <div
            style={{ color: 'white', textAlign: 'center', marginBottom: '5px' }}
          >
            REMY
          </div>
          <div
            style={{
              width: '200px',
              height: '20px',
              background: '#333',
              border: '1px solid #3399ff',
            }}
          >
            <div
              style={{
                width: `${remyHealth}%`,
                height: '100%',
                background: 'linear-gradient(to right, #0066cc, #3399ff)',
                transition: 'width 0.3s',
              }}
            ></div>
          </div>
          <div
            style={{ color: 'white', textAlign: 'center', marginTop: '5px' }}
          >
            {gameRef.current.blocking.remy ? 'BLOCKING' : ''}
          </div>
        </div>
      </div>

      {/* Combat log */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
          color: 'white',
          fontSize: '14px',
          textShadow: '1px 1px 2px black',
        }}
      >
        {combatLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {/* Boss controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '200px',
          left: '10%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          BRAD CONTROLS
        </div>
        <button
          onClick={() => executeAttack('boss', 'Punching.fbx', 8, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Jab
        </button>
        <button
          onClick={() => executeAttack('boss', 'Hook Punch.fbx', 12, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Hook
        </button>
        <button
          onClick={() =>
            executeAttack('boss', 'Roundhouse Kick.fbx', 15, 'kick')
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Kick
        </button>
        <button
          onClick={() => executeAttack('boss', 'Fist Fight A.fbx', 18, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Uppercut
        </button>
        <button
          onClick={() =>
            executeAttack('boss', 'Knee Kick Lead.fbx', 14, 'kick')
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Knee Strike
        </button>
      </div>

      {/* Boss special controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '200px',
          left: '20%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          SPECIAL
        </div>
        <button
          onClick={() => toggleBlock('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          {gameRef.current.blocking.boss ? 'Stop Blocking' : 'Block'}
        </button>
        <button
          onClick={() => dodge('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Dodge
        </button>
        <button
          onClick={() => taunt('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Taunt
        </button>
        <button
          onClick={() => specialMove('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Special Move
        </button>
      </div>

      {/* Boss combos */}
      <div
        style={{
          position: 'absolute',
          bottom: '150px',
          left: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          COMBOS
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <button
          onClick={() =>
            executeCombo('boss', [
              { animation: 'Punching.fbx', damage: 8, type: 'punch' },
              { animation: 'Hook Punch.fbx', damage: 10, type: 'punch' },
              { animation: 'Fist Fight A.fbx', damage: 15, type: 'punch' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Devastator
        </button>
        <button
          onClick={() =>
            executeCombo('boss', [
              { animation: 'Roundhouse Kick.fbx', damage: 12, type: 'kick' },
              { animation: 'Knee Kick Lead.fbx', damage: 10, type: 'kick' },
              { animation: 'Hurricane Kick.fbx', damage: 20, type: 'kick' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Whirlwind
        </button>
      </div>

      {/* Remy controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '200px',
          right: '20%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          REMY CONTROLS
        </div>
        <button
          onClick={() => executeAttack('remy', 'Punching.fbx', 8, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Jab
        </button>
        <button
          onClick={() => executeAttack('remy', 'Hook Punch.fbx', 12, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Hook
        </button>
        <button
          onClick={() =>
            executeAttack('remy', 'Roundhouse Kick.fbx', 15, 'kick')
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Kick
        </button>
        <button
          onClick={() => executeAttack('remy', 'Fist Fight A.fbx', 18, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Uppercut
        </button>
        <button
          onClick={() =>
            executeAttack('remy', 'Knee Kick Lead.fbx', 14, 'kick')
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Knee Strike
        </button>
      </div>

      {/* Remy special controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '200px',
          right: '10%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          SPECIAL
        </div>
        <button
          onClick={() => toggleBlock('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          {gameRef.current.blocking.remy ? 'Stop Blocking' : 'Block'}
        </button>
        <button
          onClick={() => dodge('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Dodge
        </button>
        <button
          onClick={() => taunt('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Taunt
        </button>
        <button
          onClick={() => specialMove('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Special Move
        </button>
      </div>

      {/* Remy combos */}
      <div
        style={{
          position: 'absolute',
          bottom: '150px',
          right: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          COMBOS
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          right: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <button
          onClick={() =>
            executeCombo('remy', [
              { animation: 'Punching.fbx', damage: 8, type: 'punch' },
              { animation: 'Hook Punch.fbx', damage: 10, type: 'punch' },
              { animation: 'Fist Fight A.fbx', damage: 15, type: 'punch' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Devastator
        </button>
        <button
          onClick={() =>
            executeCombo('remy', [
              { animation: 'Roundhouse Kick.fbx', damage: 12, type: 'kick' },
              { animation: 'Knee Kick Lead.fbx', damage: 10, type: 'kick' },
              { animation: 'Hurricane Kick.fbx', damage: 20, type: 'kick' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Whirlwind
        </button>
      </div>

      {/* Winner announcement */}
      {(bossHealth <= 0 || remyHealth <= 0) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '0 0 10px black',
            zIndex: 20, // On top of everything
            background: 'rgba(0,0,0,0.7)',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          {bossHealth <= 0 ? 'REMY WINS!' : 'BRAD WINS!'}
        </div>
      )}
    </div>
  );
}
