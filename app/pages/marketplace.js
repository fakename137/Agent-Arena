import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// Character data for the marketplace
const characters = [
  {
    id: 1,
    name: "Brad 'The Boss'",
    model: 'The Boss.fbx',
    description:
      'A legendary fighter with unmatched strength and technique. Known for devastating uppercuts and iron defense.',
    rarity: 'Legendary',
    attack: 95,
    defense: 88,
    speed: 82,
    special: 'Iron Fist Combo',
    price: '0.01 ETH',
    animations: [
      'Bouncing Fight Idle.fbx',
      'Punching.fbx',
      'Hook Punch.fbx',
      'Fist Fight A.fbx',
      'Martelo 2.fbx',
    ],
  },
  {
    id: 2,
    name: "Remy 'The Shadow'",
    model: 'Remy.fbx',
    description:
      'A swift and agile fighter with lightning-fast reflexes. Master of dodging and counter-attacks.',
    rarity: 'Epic',
    attack: 88,
    defense: 75,
    speed: 95,
    special: 'Shadow Strike',
    price: '0.01 ETH',
    animations: [
      'Bouncing Fight Idle.fbx',
      'Roundhouse Kick.fbx',
      'Knee Kick Lead.fbx',
      'Hurricane Kick.fbx',
      'Au To Role.fbx',
    ],
  },
  {
    id: 3,
    name: "Ch06 'The Warrior'",
    model: 'Ch06_nonPBR.fbx',
    description:
      'A balanced fighter with equal strength and agility. Perfect for beginners and veterans alike.',
    rarity: 'Rare',
    attack: 85,
    defense: 85,
    speed: 85,
    special: "Warrior's Fury",
    price: '0.01 ETH',
    animations: [
      'Bouncing Fight Idle.fbx',
      'Boxing.fbx',
      'Cross Punch.fbx',
      'Elbow Punch.fbx',
      'Body Block.fbx',
    ],
  },
  {
    id: 4,
    name: "Ch33 'The Destroyer'",
    model: 'Ch33_nonPBR.fbx',
    description:
      'A powerhouse fighter with overwhelming strength. Slow but devastating when he connects.',
    rarity: 'Epic',
    attack: 98,
    defense: 92,
    speed: 70,
    special: 'Demolition Strike',
    price: '0.01 ETH',
    animations: [
      'Bouncing Fight Idle.fbx',
      'Headbutt.fbx',
      'Quad Punch.fbx',
      'Surprise Uppercut.fbx',
      'Outward Block.fbx',
    ],
  },
  {
    id: 5,
    name: "Ch42 'The Phantom'",
    model: 'Ch42_nonPBR.fbx',
    description:
      'A mysterious fighter with unpredictable moves. Master of deception and surprise attacks.',
    rarity: 'Legendary',
    attack: 90,
    defense: 80,
    speed: 90,
    special: 'Phantom Combo',
    price: '0.01 ETH',
    animations: [
      'Bouncing Fight Idle.fbx',
      'Chapa-Giratoria.fbx',
      'Jab Cross.fbx',
      'Punch To Elbow Combo.fbx',
      'Dodging.fbx',
    ],
  },
];

export default function Marketplace() {
  const mountRef = useRef(null);
  const router = useRouter();
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState(characters[0]);

  // Three.js refs
  const sceneRef = useRef(null);
  const characterRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const currentActionRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
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
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '2';

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Background iframe (same as main game)
    const iframeContainer = document.createElement('div');
    iframeContainer.style.position = 'absolute';
    iframeContainer.style.top = '0';
    iframeContainer.style.left = '0';
    iframeContainer.style.width = '100%';
    iframeContainer.style.height = '100%';
    iframeContainer.style.zIndex = '1';
    iframeContainer.style.pointerEvents = 'none';

    const iframe = document.createElement('iframe');
    iframe.title = 'Scary Basement Interior photoscan';
    iframe.src =
      'https://sketchfab.com/models/5887de4f1cf54adeb46b2eab5b92c4a7/embed?autostart=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer);

    sceneRef.current = scene;

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (document.body.contains(iframeContainer)) {
        document.body.removeChild(iframeContainer);
      }
      renderer.dispose();
    };
  }, []);

  // Load character when index changes
  useEffect(() => {
    const loadCharacter = async () => {
      if (!sceneRef.current) return;

      setLoading(true);

      // Remove previous character
      if (characterRef.current) {
        sceneRef.current.remove(characterRef.current);
        characterRef.current = null;
      }
      if (mixerRef.current) {
        mixerRef.current = null;
      }
      actionsRef.current = {};
      currentActionRef.current = null;

      const currentChar = characters[currentCharacterIndex];
      setCharacter(currentChar);

      const loader = new FBXLoader();

      try {
        // Load character model
        const model = await new Promise((resolve, reject) => {
          loader.load(
            `/characters/${currentChar.model}`,
            resolve,
            undefined,
            reject
          );
        });

        model.scale.set(0.02, 0.02, 0.02);
        model.position.set(-3, -2, 0);

        model.castShadow = true;
        model.receiveShadow = true;

        sceneRef.current.add(model);
        characterRef.current = model;

        // Setup animations
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        // Load and setup animations
        const animationPromises = currentChar.animations.map(
          async (animName) => {
            try {
              const animModel = await new Promise((resolve, reject) => {
                loader.load(
                  `/Animations/${animName}`,
                  resolve,
                  undefined,
                  reject
                );
              });

              if (animModel.animations.length > 0) {
                const action = mixer.clipAction(animModel.animations[0]);
                actionsRef.current[animName] = action;
              }
            } catch (error) {
              console.warn(`Failed to load animation: ${animName}`, error);
            }
          }
        );

        await Promise.all(animationPromises);

        // Start idle animation
        const idleAction = actionsRef.current['Bouncing Fight Idle.fbx'];
        if (idleAction) {
          idleAction.play();
          currentActionRef.current = idleAction;
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to load character:', error);
        setLoading(false);
      }
    };

    loadCharacter();
  }, [currentCharacterIndex]);

  // Cycle through animations
  useEffect(() => {
    if (!character || loading) return;

    const cycleAnimations = () => {
      const animations = character.animations.filter(
        (name) => actionsRef.current[name]
      );
      if (animations.length === 0) return;

      const currentIndex = animations.indexOf(
        currentActionRef.current?.getClip()?.name || ''
      );
      const nextIndex = (currentIndex + 1) % animations.length;
      const nextAnimation = animations[nextIndex];

      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.5);
      }

      const nextAction = actionsRef.current[nextAnimation];
      if (nextAction) {
        nextAction.reset().fadeIn(0.5).play();
        currentActionRef.current = nextAction;
      }
    };

    const interval = setInterval(cycleAnimations, 3000);
    return () => clearInterval(interval);
  }, [character, loading]);

  const nextCharacter = () => {
    setCurrentCharacterIndex((prev) => (prev + 1) % characters.length);
  };

  const prevCharacter = () => {
    setCurrentCharacterIndex(
      (prev) => (prev - 1 + characters.length) % characters.length
    );
  };

  const mintNFT = () => {
    // TODO: Implement actual minting logic
    alert(`Minting ${character.name} for ${character.price}...`);
  };

  const goBack = () => {
    router.push('/');
  };

  const goToBattles = () => {
    router.push('/battles');
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#000',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          background:
            'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent)',
        }}
      >
        <button
          onClick={goBack}
          style={{
            background: 'rgba(255, 51, 51, 0.2)',
            color: '#ff3333',
            border: '2px solid #ff3333',
            marginTop: '60px',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 51, 51, 0.4)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 15px rgba(255, 51, 51, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 51, 51, 0.2)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ← Back to Arena
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          paddingTop: '80px',
        }}
      >
        {/* Left Side - 3D Character Viewer */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#000',
          }}
        >
          <div
            ref={mountRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          />

          {/* Navigation Arrows */}
          <button
            onClick={prevCharacter}
            style={{
              position: 'absolute',
              top: '50%',
              left: '20px',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 51, 51, 0.2)',
              color: '#ff3333',
              border: '2px solid #ff3333',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 51, 51, 0.4)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 51, 51, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 51, 51, 0.2)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ‹
          </button>
          <button
            onClick={nextCharacter}
            style={{
              position: 'absolute',
              top: '50%',
              right: '20px',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 51, 51, 0.2)',
              color: '#ff3333',
              border: '2px solid #ff3333',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 51, 51, 0.4)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 51, 51, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 51, 51, 0.2)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ›
          </button>

          {/* Loading Overlay */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid rgba(255, 51, 51, 0.3)',
                  borderTop: '3px solid #ff3333',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '20px',
                }}
              ></div>
              <p>Loading Character...</p>
            </div>
          )}
        </div>

        {/* Right Side - Character Details */}
        <div
          style={{
            width: '30%',
            height: '50%',
            padding: '40px',
            background: 'transparent',
            borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
            border: '2px solid black',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            top: '50%',
            right: '10%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            borderRadius: '10px 0 0 10px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {character && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                  justifyContent: 'space-between',
                  paddingBottom: '20px',
                  borderBottom: '2px solid rgba(255, 51, 51, 0.3)',
                }}
              >
                <h2
                  style={{
                    color: '#ff3333',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    margin: 0,
                    textShadow: '0 0 10px rgba(255, 51, 51, 0.3)',
                  }}
                >
                  {character.name}
                </h2>

                <span
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background:
                      character.rarity === 'Legendary'
                        ? 'linear-gradient(45deg, #ffd700, #ff3333)'
                        : character.rarity === 'Epic'
                        ? 'linear-gradient(45deg, #ff9900, #ff3333)'
                        : 'linear-gradient(45deg, #000000, #ff3333)',
                    color: character.rarity === 'Legendary' ? '#000' : 'white',
                    boxShadow:
                      character.rarity === 'Legendary'
                        ? '0 0 20px rgba(255, 215, 0, 0.5)'
                        : character.rarity === 'Epic'
                        ? '0 0 20px rgba(255, 153, 0, 0.5)'
                        : '0 0 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {character.rarity}
                </span>
              </div>

              <span style={{ fontSize: '16px', color: '#ccc' }}>
                {character.description}
              </span>

              <div style={{ marginBottom: '40px' }}>
                <h3
                  style={{
                    color: '#ff3333',
                    fontSize: '24px',
                    marginBottom: '20px',
                    textShadow: '0 0 10px rgba(255, 51, 51, 0.3)',
                  }}
                >
                  Combat Stats
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    gap: '15px',
                  }}
                >
                  <span
                    style={{ width: '80px', fontWeight: 'bold', color: '#fff' }}
                  >
                    Attack
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 51, 51, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background:
                          'linear-gradient(to right, #ff3333, #ff9900)',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease',
                        boxShadow: '0 0 10px rgba(255, 51, 51, 0.5)',
                        width: `${character.attack}%`,
                      }}
                    ></div>
                  </div>
                  <span
                    style={{
                      width: '40px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#ff3333',
                    }}
                  >
                    {character.attack}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    gap: '15px',
                  }}
                >
                  <span
                    style={{ width: '80px', fontWeight: 'bold', color: '#fff' }}
                  >
                    Defense
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 51, 51, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background:
                          'linear-gradient(to right, #ff3333, #ff9900)',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease',
                        boxShadow: '0 0 10px rgba(255, 51, 51, 0.5)',
                        width: `${character.defense}%`,
                      }}
                    ></div>
                  </div>
                  <span
                    style={{
                      width: '40px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#ff3333',
                    }}
                  >
                    {character.defense}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    gap: '15px',
                  }}
                >
                  <span
                    style={{ width: '80px', fontWeight: 'bold', color: '#fff' }}
                  >
                    Speed
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 51, 51, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background:
                          'linear-gradient(to right, #ff3333, #ff9900)',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease',
                        boxShadow: '0 0 10px rgba(255, 51, 51, 0.5)',
                        width: `${character.speed}%`,
                      }}
                    ></div>
                  </div>
                  <span
                    style={{
                      width: '40px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#ff3333',
                    }}
                  >
                    {character.speed}
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 'auto',
                  padding: '30px',
                  background: 'rgba(255, 51, 51, 0.1)',
                  border: '2px solid #ff3333',
                  borderRadius: '15px',
                  textAlign: 'center',
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <span
                    style={{
                      fontSize: '18px',
                      color: '#ccc',
                      marginRight: '10px',
                    }}
                  >
                    Price:
                  </span>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#ff3333',
                      textShadow: '0 0 10px rgba(255, 51, 51, 0.5)',
                    }}
                  >
                    {character.price}
                  </span>
                </div>
                <button
                  onClick={mintNFT}
                  style={{
                    background: 'linear-gradient(45deg, #ff3333, #ff9900)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 40px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(255, 51, 51, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow =
                      '0 6px 20px rgba(255, 51, 51, 0.5)';
                    e.target.style.background =
                      'linear-gradient(45deg, #ff9900, #ff3333)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow =
                      '0 4px 15px rgba(255, 51, 51, 0.3)';
                    e.target.style.background =
                      'linear-gradient(45deg, #ff3333, #ff9900)';
                  }}
                >
                  Mint NFT
                </button>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  color: '#ff3333',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: 'rgba(0, 0, 0, 0.7)',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 51, 51, 0.3)',
                  zIndex: 10,
                }}
              >
                {currentCharacterIndex + 1} / {characters.length}
              </div>
            </>
          )}
        </div>
        <button
          onClick={goToBattles}
          style={{
            background: 'rgba(255, 153, 0, 0.2)',
            color: '#ff9900',
            border: '2px solid #ff9900',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            padding: '10px 20px',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 153, 0, 0.4)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 15px rgba(255, 153, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 153, 0, 0.2)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Battle Arena →
        </button>
      </div>

      {/* CSS Animation for Spinner */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
