// File: pages/index.js (or pages/home.js)
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';

export default function HomePageBackground() {
  const mountRef = useRef(null);
  const [environmentLoading, setEnvironmentLoading] = useState(true);
  const [charactersLoaded, setCharactersLoaded] = useState(false);
  const [showReadyText, setShowReadyText] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect(); // Add this line to get the disconnect function

  const displayAddress =
    address && typeof address === 'string'
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : 'Unknown';

  // Ref to hold game state including animation data
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
    // Store loaded animations for cycling
    animations: {
      boss: [],
      remy: [],
    },
    // Track current animation index for each character
    currentAnimationIndex: {
      boss: 0,
      remy: 0,
    },
    // Reference to cycle function for cleanup
    cycleAnimations: null,
  });

  // Main Three.js initialization useEffect
  useEffect(() => {
    console.log('Initializing homepage background...');

    // --- Setup Three.js Scene ---
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
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '2';
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 1s ease-in-out';

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    } else {
      console.error('mountRef is not attached to a DOM element');
      setError('Failed to mount Three.js renderer.');
      return; // Early return if mount point is missing
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    gameRef.current.scene = scene;
    gameRef.current.camera = camera;
    gameRef.current.renderer = renderer;

    // --- Background Iframe ---
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'sketchfab-background-container';
    iframeContainer.style.position = 'fixed';
    iframeContainer.style.top = '0';
    iframeContainer.style.left = '0';
    iframeContainer.style.width = '100%';
    iframeContainer.style.height = '100%';
    iframeContainer.style.zIndex = '1';
    iframeContainer.style.pointerEvents = 'none';

    const iframe = document.createElement('iframe');
    iframe.id = 'sketchfab-frame';
    iframe.title = 'Scary Basement Interior photoscan';
    iframe.src =
      'https://sketchfab.com/models/5887de4f1cf54adeb46b2eab5b92c4a7/embed?autostart=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.mozallowfullscreen = 'true';
    iframe.webkitallowfullscreen = 'true';
    iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    const handleIframeLoad = () => {
      console.log('Sketchfab background iframe loaded successfully.');
      setEnvironmentLoading(false);
    };

    iframe.onload = handleIframeLoad;
    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer);

    // --- Start the 5-second timer regardless of iframe load ---
    console.log('Starting 5-second delay before showing fighters...');
    const initialDelayTimer = setTimeout(() => {
      console.log("5-second delay finished. Showing 'Ready to Fight...'");
      setShowReadyText(true);
      loadCharacters(scene);
    }, 5000); // Note: Comment says 3s, but value is 5000ms = 5s

    // --- Load Characters and Animations ---
    const loadCharacters = (scene) => {
      console.log('Starting to load characters...');
      const loader = new FBXLoader();
      let bossLoaded = false;
      let remyLoaded = false;

      const checkLoadingComplete = () => {
        if (bossLoaded && remyLoaded) {
          console.log(
            'Both characters and animations loaded. Showing fighters.'
          );
          setCharactersLoaded(true);
          if (renderer.domElement) {
            renderer.domElement.style.opacity = '1';
          }
        }
      };

      // List of animations to load for each character
      const animationFiles = [
        'Bouncing Fight Idle.fbx',
        'Boxing (1).fbx',
        'Fist Fight A.fbx',
      ];

      // --- Load Brad ---
      loader.load(
        '/characters/The Boss.fbx',
        (object) => {
          try {
            console.log('Brad loaded successfully');
            object.scale.set(0.02, 0.02, 0.02);
            object.position.set(-1.5, -2, 0);
            object.rotation.y = Math.PI / 2;

            object.traverse((child) => {
              if (child.isMesh) {
                child.visible = true;
              }
            });

            scene.add(object);
            gameRef.current.boss = object;
            gameRef.current.mixerBoss = new THREE.AnimationMixer(object);

            // Load all animations for Brad
            let animationsLoaded = 0;
            animationFiles.forEach((animFile, index) => {
              loader.load(
                `/Animations/${animFile}`,
                (anim) => {
                  if (anim.animations.length > 0) {
                    const action = gameRef.current.mixerBoss.clipAction(
                      anim.animations[0]
                    );
                    gameRef.current.actions.boss[animFile] = action;
                    gameRef.current.animations.boss.push(action);

                    // Play the first animation (idle) immediately
                    if (index === 0) {
                      action.setLoop(THREE.LoopRepeat);
                      action.play();
                      console.log(
                        `Brad ${animFile} animation loaded and playing.`
                      );
                    }
                  } else {
                    console.warn(
                      `Brad ${animFile} animation file found but no animations inside.`
                    );
                  }

                  animationsLoaded++;
                  if (animationsLoaded === animationFiles.length) {
                    bossLoaded = true;
                    checkLoadingComplete();
                  }
                },
                undefined,
                (err) => {
                  console.error(
                    `Error loading Brad ${animFile} animation:`,
                    err
                  );
                  setError(`Failed to load Brad ${animFile} animation.`);
                  animationsLoaded++;
                  if (animationsLoaded === animationFiles.length) {
                    bossLoaded = true;
                    checkLoadingComplete();
                  }
                }
              );
            });
          } catch (e) {
            console.error('Error processing Brad model:', e);
            setError('Failed to process Brad model.');
            bossLoaded = true;
            checkLoadingComplete();
          }
        },
        undefined,
        (error) => {
          console.error('Error loading Brad character:', error);
          setError('Failed to load Brad character.');
          bossLoaded = true;
          checkLoadingComplete();
        }
      );

      // --- Load Remy ---
      loader.load(
        '/characters/Remy.fbx',
        (object) => {
          try {
            console.log('Remy loaded successfully');
            object.scale.set(0.01, 0.01, 0.01);
            object.position.set(1.5, 0, 0);
            object.rotation.y = -Math.PI / 2;

            object.traverse((child) => {
              if (child.isMesh) {
                child.visible = true;
              }
            });

            scene.add(object);
            gameRef.current.remy = object;
            gameRef.current.mixerRemy = new THREE.AnimationMixer(object);

            // Load all animations for Remy
            let animationsLoaded = 0;
            animationFiles.forEach((animFile, index) => {
              loader.load(
                `/Animations/${animFile}`,
                (anim) => {
                  if (anim.animations.length > 0) {
                    const action = gameRef.current.mixerRemy.clipAction(
                      anim.animations[0]
                    );
                    gameRef.current.actions.remy[animFile] = action;
                    gameRef.current.animations.remy.push(action);

                    // Play the first animation (idle) immediately
                    if (index === 0) {
                      action.setLoop(THREE.LoopRepeat);
                      action.play();
                      console.log(
                        `Remy ${animFile} animation loaded and playing.`
                      );
                    }
                  } else {
                    console.warn(
                      `Remy ${animFile} animation file found but no animations inside.`
                    );
                  }

                  animationsLoaded++;
                  if (animationsLoaded === animationFiles.length) {
                    remyLoaded = true;
                    checkLoadingComplete();
                  }
                },
                undefined,
                (err) => {
                  console.error(
                    `Error loading Remy ${animFile} animation:`,
                    err
                  );
                  setError(`Failed to load Remy ${animFile} animation.`);
                  animationsLoaded++;
                  if (animationsLoaded === animationFiles.length) {
                    remyLoaded = true;
                    checkLoadingComplete();
                  }
                }
              );
            });
          } catch (e) {
            console.error('Error processing Remy model:', e);
            setError('Failed to process Remy model.');
            remyLoaded = true;
            checkLoadingComplete();
          }
        },
        undefined,
        (error) => {
          console.error('Error loading Remy character:', error);
          setError('Failed to load Remy character.');
          remyLoaded = true;
          checkLoadingComplete();
        }
      );
    };

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = gameRef.current.clock.getDelta();

      if (gameRef.current.mixerBoss) {
        gameRef.current.mixerBoss.update(delta);
        // Ensure boss position is consistent
        if (gameRef.current.boss) {
          gameRef.current.boss.position.y = -2;
        }
      }

      if (gameRef.current.mixerRemy) {
        gameRef.current.mixerRemy.update(delta);
        // Ensure remy position is consistent
        if (gameRef.current.remy) {
          gameRef.current.remy.position.y = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Animation Cycling Function ---
    const cycleAnimations = (character) => {
      const mixer =
        character === 'boss'
          ? gameRef.current.mixerBoss
          : gameRef.current.mixerRemy;
      const animations =
        character === 'boss'
          ? gameRef.current.animations.boss
          : gameRef.current.animations.remy;

      // Check if animations exist and there's more than one
      if (mixer && animations && animations.length > 1) {
        // Get the index of the currently playing action from our ref
        let currentIndex =
          character === 'boss'
            ? gameRef.current.currentAnimationIndex.boss
            : gameRef.current.currentAnimationIndex.remy;

        // Fade out the current animation
        const currentAction = animations[currentIndex];
        if (currentAction && currentAction.isRunning()) {
          currentAction.fadeOut(0.5);
        }

        // Calculate the next animation index
        const nextIndex = (currentIndex + 1) % animations.length;

        // Play the next animation with a fade in
        const nextAction = animations[nextIndex];
        if (nextAction) {
          nextAction.reset().fadeIn(0.5).setLoop(THREE.LoopRepeat).play();

          // Update the current animation index in our ref
          if (character === 'boss') {
            gameRef.current.currentAnimationIndex.boss = nextIndex;
          } else {
            gameRef.current.currentAnimationIndex.remy = nextIndex;
          }

          console.log(`Cycled ${character} animation to index ${nextIndex}`);
        }
      }
    };

    // Store the cycle function in ref for access by other useEffect or cleanup
    gameRef.current.cycleAnimations = cycleAnimations;

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log('Cleaning up homepage background resources...');
      clearTimeout(initialDelayTimer);
      window.removeEventListener('resize', handleResize);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      const existingIframeContainer = document.getElementById(
        'sketchfab-background-container'
      );
      if (existingIframeContainer && existingIframeContainer.parentNode) {
        existingIframeContainer.parentNode.removeChild(existingIframeContainer);
      }

      renderer.dispose();

      if (gameRef.current.mixerBoss) {
        gameRef.current.mixerBoss.stopAllAction();
        gameRef.current.mixerBoss = null; // Clear reference
      }

      if (gameRef.current.mixerRemy) {
        gameRef.current.mixerRemy.stopAllAction();
        gameRef.current.mixerRemy = null; // Clear reference
      }

      // Cleanup animation intervals will be handled by the second useEffect
    };
  }, []); // Empty dependency array: run once on mount

  // Second useEffect to manage animation cycling intervals
  useEffect(() => {
    let bossCycleInterval = null;
    let remyCycleInterval = null;

    if (charactersLoaded && gameRef.current.cycleAnimations) {
      console.log('Characters loaded, starting animation cycling...');

      // Start cycling animations every 5 seconds for each character
      bossCycleInterval = setInterval(() => {
        if (gameRef.current && gameRef.current.cycleAnimations) {
          gameRef.current.cycleAnimations('boss');
        }
      }, 5000);

      remyCycleInterval = setInterval(() => {
        if (gameRef.current && gameRef.current.cycleAnimations) {
          gameRef.current.cycleAnimations('remy');
        }
      }, 5000);
    }

    // Cleanup intervals on unmount or when charactersLoaded changes
    return () => {
      if (bossCycleInterval) {
        console.log('Clearing Boss animation cycling interval.');
        clearInterval(bossCycleInterval);
      }
      if (remyCycleInterval) {
        console.log('Clearing Remy animation cycling interval.');
        clearInterval(remyCycleInterval);
      }
    };
  }, [charactersLoaded]); // Depend on charactersLoaded state

  // Mock data for live and upcoming battles
  const liveBattle = {
    title: 'LIVE BATTLE: Bitcoin Brad vs. Ethereum Remy',
    left: {
      name: 'Bitcoin Brad',
      avatar: '/characters/bitcoin.png', // Placeholder, use a real image if available
      percent: 75,
      color: '#f2a900',
    },
    right: {
      name: 'Ethereum Remy',
      avatar: '/characters/ethereum.png', // Placeholder
      percent: 25,
      color: '#3c3c3d',
    },
  };

  const upcomingBouts = [
    {
      left: 'Solana Sam',
      right: 'Cardano Ada',
      time: 'Starts in 2h',
      leftAvatar: '/characters/solana.png',
      rightAvatar: '/characters/cardano.png',
    },
    {
      left: 'Dogecoin Duke',
      right: 'Shiba Inu',
      time: 'Tomorrow',
      leftAvatar: '/characters/doge.png',
      rightAvatar: '/characters/shiba.png',
    },
  ];

  // Mock data for timer and events
  const timer = '23:03';
  const upcomingEvent = {
    title: 'SOL VS ETH',
    time: '2 days to go',
  };

  // Determine if the initial loading overlay should be shown
  const showInitialLoading = !showReadyText;

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'Impact, Arial Black, Arial, sans-serif',
      }}
    >
      {/* Three.js Canvas Container - Fighters rendered here */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      />
      {/* Loading Overlay */}
      {showInitialLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Loading Environment...
        </div>
      )}
      {/* "Ready to Fight..." Overlay */}
      {showReadyText && !charactersLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Ready to Fight...
        </div>
      )}
      {/* Header: Fighter Names and Timer/VS */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: 0,
          width: '90%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          padding: '0 48px',
        }}
      >
        {/* Left Fighter Name */}
        <div
          style={{
            color: '#ff9900',
            fontWeight: 900,
            fontSize: 36,
            letterSpacing: 1,
            textShadow: '2px 2px 8px #000',
          }}
        >
          BITCOIN BRAD
        </div>
        {/* Center Timer and VS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              background: '#b30000',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 8,
              padding: '2px 16px',
              marginBottom: 2,
              fontFamily: 'monospace',
              boxShadow: '0 2px 8px #000',
              border: '2px solid #fff',
              textShadow: '1px 1px 2px #000',
            }}
          >
            time left: {timer}
          </div>
          <div
            style={{
              color: '#ff9900',
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: 2,
              textShadow: '2px 2px 8px #000',
            }}
          >
            VS
          </div>
        </div>
        {/* Right Fighter Name */}
        <div
          style={{
            color: '#ff9900',
            fontWeight: 900,
            fontSize: 36,
            letterSpacing: 1,
            textShadow: '2px 2px 8px #000',
          }}
        >
          ETHEREUM REMY
        </div>
      </div>
      {/* ... inside your return statement's JSX, replacing the old connection display and Link ... */}

      {/* Wallet Connection/Disconnection UI */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px', // Add some space between address and button
        }}
      >
        {isConnected ? (
          <>
            <div
              style={{
                background: 'rgba(0, 100, 0, 0.8)', // Dark green background
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '1px solid #0f0', // Green border
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Connected: {displayAddress}
            </div>
            <button
              onClick={() => disconnect()} // Call the disconnect function
              style={{
                background: 'rgba(139, 0, 0, 0.8)', // Dark red background
                color: '#fff',
                fontWeight: 'bold',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #f00', // Red border
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <div
            style={{
              background: 'rgba(100, 100, 0, 0.8)', // Dark yellow/orange background
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '1px solid #ff0', // Yellow border
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Wallet Not Connected
          </div>
        )}
      </div>

      {/* Optional: Remove or hide the old Link if it's not needed on the Arena page itself
  <Link
    href="/arena"
    className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded text-lg"
   >
    Enter the Arena
  </Link>
  */}

      {/* ... rest of your JSX ... */}
      <Link
        href="/arena"
        className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded text-lg"
      >
        Enter the Arena
      </Link>
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 0,
          zIndex: 15,
          background: 'rgba(30,30,30,0.95)',
          borderRadius: '24px',
          width: 260,
          height: 300,
          boxShadow: '0 4px 24px #000',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          border: '2.5px solid #222',
          fontFamily: 'Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            color: '#3cf',
            fontWeight: 300,
            fontSize: 16,
            marginBottom: 12,
            letterSpacing: 1,
            textShadow: '1px 1px 2px #000',
            textAlign: 'center',
          }}
        >
          Rules of The Hash Pit
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: 8,
            scrollbarWidth: 'thin',
            scrollbarColor: '#3cf rgba(30,30,30,0.95)',
          }}
        >
          <div
            style={{
              color: '#fff',
              fontWeight: 300,
              fontSize: 13,
              lineHeight: 1.4,
              textShadow: '1px 1px 2px #000',
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 1:</span>{' '}
              Always talk about The Hash Pit. More buzz, better fights.
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 2:</span>{' '}
              Always talk about The Hash Pit! Transparency rules, the ledger
              never lies.
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 3:</span>{' '}
              No tap out. Surges may knock them down, but no crypto truly dies.
              The victor is decided by market performance.
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 4:</span>{' '}
              Only two crypto champions clash in the pit. One-on-one battles
              only.
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 5:</span>{' '}
              Multiple pits, endless opportunities. Concurrent brawls from Blitz
              Brawls to Market Wars. Pick your battle.
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 6:</span>{' '}
              Fights are judged by raw market data. No rigged games, just pure
              market force. Power-Ups can turn the tide.
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 7:</span>{' '}
              Battles run their course. From 1-minute sprints to 24-hour
              endurance tests, the clock decides the final tally.
            </div>
            <div>
              <span style={{ color: '#ff3333', fontWeight: 300 }}>Rule 8:</span>{' '}
              If it's your first time at The Hash Pit, engage. Witness the data,
              feel the tension, and choose your champion.
            </div>
          </div>
        </div>
      </div>
      {/* Upcoming Events Card (right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          right: 0,
          zIndex: 15,
          background: 'rgba(30,30,30,0.95)',
          borderRadius: '24px',
          width: 260,
          minHeight: 180,
          boxShadow: '0 4px 24px #000',
          padding: '24px 20px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '2.5px solid #222',
        }}
      >
        <div
          style={{
            color: '#3cf',
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 18,
            letterSpacing: 1,
            textShadow: '1px 1px 2px #000',
          }}
        >
          Upcoming Events
        </div>
        <div
          style={{
            color: '#ff3333',
            fontWeight: 900,
            fontSize: 32,
            marginBottom: 10,
            letterSpacing: 2,
            textShadow: '2px 2px 8px #000',
          }}
        >
          {upcomingEvent.title}
        </div>
        <div
          style={{
            background: '#b30000',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 8,
            padding: '4px 18px',
            marginTop: 4,
            fontFamily: 'monospace',
            boxShadow: '0 2px 8px #000',
            border: '2px solid #fff',
            textShadow: '1px 1px 2px #000',
          }}
        >
          {upcomingEvent.time}
        </div>
      </div>
      {/* Battle Now Button (center bottom) */}
      <button
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 80,
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: '#ff9900',
          color: '#222',
          fontWeight: 900,
          fontSize: 32,
          border: '3px solid #fff',
          borderRadius: 16,
          padding: '12px 48px',
          boxShadow: '0 2px 8px #000',
          cursor: 'pointer',
          letterSpacing: 1,
          textShadow: '1px 1px 2px #fff',
        }}
        onClick={() => alert('Battle Now!')}
      >
        Fight Now
      </button>

      {/* Buy Characters Button (top right) */}
      <button
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 20,
          background: '#ff6b35',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          border: '2px solid #fff',
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
          cursor: 'pointer',
          letterSpacing: 0.5,
          textShadow: '1px 1px 2px #000',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#ff8c42';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#ff6b35';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.4)';
        }}
        onClick={() => (window.location.href = '/marketplace')}
      >
        Buy Characters
      </button>
      {/* Fight Club Rules (bottom center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 24,
          transform: 'translateX(-50%)',
          zIndex: 30,
          color: '#ff3333',
          fontWeight: 900,
          fontSize: 16,
          textAlign: 'center',
          letterSpacing: 0.5,
          textShadow: '1px 1px 2px #000',
        }}
      >
        first, you do not talk about Fight Club;
        <br />
        second, you do not talk about Fight Club
      </div>
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'red',
            fontSize: '18px',
            textAlign: 'center',
            zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            padding: '15px',
            borderRadius: '8px',
          }}
        >
          Error: {error}
        </div>
      )}
    </div>
  );
}
