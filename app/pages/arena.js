import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useAccount } from 'wagmi';

export default function Arena() {
  const mountRef = useRef(null);
  const [environmentLoading, setEnvironmentLoading] = useState(true);
  const [charactersLoaded, setCharactersLoaded] = useState(false);
  const [showReadyText, setShowReadyText] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [battleParams, setBattleParams] = useState({
    betAmount: '',
    duration: '6',
    activeResults: false,
    startTime: '', // Will be set when modal opens
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' only
  const [battleTypeFilter, setBattleTypeFilter] = useState('joining'); // 'joining', 'aboutToStart', 'activeResults'
  const [countdowns, setCountdowns] = useState({}); // Store countdown timers

  const { address, isConnected } = useAccount();

  // Mock battle data
  const existingBattles = [
    {
      id: 1,
      creator: {
        name: 'Bitcoin Brad',
        avatar: '/characters/Brad.fbx',
        address: '0x1234...5678',
      },
      opponent: {
        name: 'Ethereum Remy',
        avatar: '/characters/Remy.fbx',
        address: '0x8765...4321',
      },
      stake: '1 NFT',
      prizePool: '500 USDC',
      duration: '6 hrs',
      deadline: '2024-01-15T15:00:00Z',
      startTime: '2024-01-16T10:00:00Z', // Battle start time
      battleType: 'Active & Results',
      status: 'Waiting for Opponent',
    },
    {
      id: 2,
      creator: {
        name: 'Solana Sam',
        avatar: '/characters/Ch06_nonPBR.fbx',
        address: '0x1111...2222',
      },
      opponent: null,
      stake: '1 NFT',
      prizePool: '1000 USDC',
      duration: '12 hrs',
      deadline: '2024-01-16T10:00:00Z',
      startTime: '2024-01-17T08:00:00Z', // Battle start time
      battleType: 'Joining',
      status: 'Waiting for Opponent',
    },
    {
      id: 3,
      creator: {
        name: 'Cardano Ada',
        avatar: '/characters/Ch33_nonPBR.fbx',
        address: '0x3333...4444',
      },
      opponent: {
        name: 'Polkadot Pete',
        avatar: '/characters/Ch42_nonPBR.fbx',
        address: '0x5555...6666',
      },
      stake: '1 NFT',
      prizePool: '750 USDC',
      duration: '24 hrs',
      deadline: '2024-01-14T20:00:00Z',
      startTime: '2024-01-15T20:00:00Z', // Battle start time
      battleType: 'Active & Results',
      status: 'Active',
    },
    {
      id: 4,
      creator: {
        name: 'Chainlink Larry',
        avatar: '/characters/Brad.fbx',
        address: '0x7777...8888',
      },
      opponent: {
        name: 'Uniswap Ulysses',
        avatar: '/characters/Remy.fbx',
        address: '0x9999...0000',
      },
      stake: '1 NFT',
      prizePool: '1200 USDC',
      duration: '6 hrs',
      deadline: '2024-01-10T12:00:00Z',
      startTime: '2024-01-11T12:00:00Z', // Battle start time
      battleType: 'Active & Results',
      status: 'Completed',
    },
    {
      id: 5,
      creator: {
        name: 'Polygon Pete',
        avatar: '/characters/Ch06_nonPBR.fbx',
        address: '0xaaaa...bbbb',
      },
      opponent: null,
      stake: '1 NFT',
      prizePool: '800 USDC',
      duration: '12 hrs',
      deadline: '2024-01-13T14:00:00Z',
      startTime: '2024-01-14T14:00:00Z',
      battleType: 'Joining',
      status: 'Waiting for Opponent',
    },
    {
      id: 6,
      creator: {
        name: 'Cosmos Carl',
        avatar: '/characters/Ch42_nonPBR.fbx',
        address: '0xeeee...ffff',
      },
      opponent: {
        name: 'Terra Tina',
        avatar: '/characters/Brad.fbx',
        address: '0xgggg...hhhh',
      },
      stake: '1 NFT',
      prizePool: '1500 USDC',
      duration: '24 hrs',
      deadline: '2024-01-08T16:00:00Z',
      startTime: '2024-01-09T16:00:00Z',
      battleType: 'Active & Results',
      status: 'Completed',
    },
  ];

  // Mock user NFTs
  const userNFTs = [
    {
      id: 1,
      name: 'Bitcoin Brad',
      avatar: '/characters/Brad.fbx',
      rarity: 'Legendary',
    },
    {
      id: 2,
      name: 'Ethereum Remy',
      avatar: '/characters/Remy.fbx',
      rarity: 'Epic',
    },
    {
      id: 3,
      name: 'Solana Sam',
      avatar: '/characters/Ch06_nonPBR.fbx',
      rarity: 'Rare',
    },
  ];

  // Game state ref for Three.js
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
    animations: {
      boss: [],
      remy: [],
    },
    currentAnimationIndex: {
      boss: 0,
      remy: 0,
    },
    cycleAnimations: null,
  });

  // Helper functions
  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  // Get current datetime in format for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Filter battles based on selected type
  const filteredBattles = existingBattles.filter((battle) => {
    if (battleTypeFilter === 'joining')
      return battle.status === 'Waiting for Opponent' && !battle.opponent;
    if (battleTypeFilter === 'aboutToStart')
      return battle.status === 'Waiting for Opponent' && battle.startTime;
    if (battleTypeFilter === 'activeResults')
      return battle.status === 'Active' || battle.status === 'Completed';
    return true; // Default to showing all if no filter is selected
  });

  // Three.js initialization useEffect
  useEffect(() => {
    console.log('Initializing arena background...');

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
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 1s ease-in-out';

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    } else {
      console.error('mountRef is not attached to a DOM element');
      setError('Failed to mount Three.js renderer.');
      return;
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
    iframeContainer.id = 'sketchfab-arena-background-container';
    iframeContainer.style.position = 'fixed';
    iframeContainer.style.top = '0';
    iframeContainer.style.left = '0';
    iframeContainer.style.width = '100%';
    iframeContainer.style.height = '100%';
    iframeContainer.style.zIndex = '0';
    iframeContainer.style.pointerEvents = 'none';

    const iframe = document.createElement('iframe');
    iframe.id = 'sketchfab-arena-frame';
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
      console.log('Sketchfab arena background iframe loaded successfully.');
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
    }, 5000);

    // --- Character Loading Function ---
    const loadCharacters = (scene) => {
      const loader = new FBXLoader();
      let loadedCount = 0;
      const totalCharacters = 2;

      const checkLoadingComplete = () => {
        loadedCount++;
        if (loadedCount === totalCharacters) {
          console.log('All characters loaded successfully!');
          setCharactersLoaded(true);
          startAnimation();
        }
      };

      // Load Boss character
      loader.load('/characters/Brad.fbx', (boss) => {
        console.log('Boss character loaded');
        boss.scale.set(0.01, 0.01, 0.01);
        boss.position.set(-2, 0, 0);
        boss.castShadow = true;
        scene.add(boss);

        const mixerBoss = new THREE.AnimationMixer(boss);
        gameRef.current.mixerBoss = mixerBoss;
        gameRef.current.boss = boss;

        // Load animations for boss
        const animationLoader = new FBXLoader();
        const bossAnimations = [
          '/Animations/Fight Idle.fbx',
          '/Animations/Boxing.fbx',
          '/Animations/Taunt.fbx',
        ];

        bossAnimations.forEach((animPath, index) => {
          animationLoader.load(animPath, (anim) => {
            const action = mixerBoss.clipAction(anim.animations[0]);
            gameRef.current.actions.boss[`animation_${index}`] = action;
            gameRef.current.animations.boss.push(action);
          });
        });

        checkLoadingComplete();
      });

      // Load Remy character
      loader.load('/characters/Remy.fbx', (remy) => {
        console.log('Remy character loaded');
        remy.scale.set(0.01, 0.01, 0.01);
        remy.position.set(2, 0, 0);
        remy.castShadow = true;
        scene.add(remy);

        const mixerRemy = new THREE.AnimationMixer(remy);
        gameRef.current.mixerRemy = mixerRemy;
        gameRef.current.remy = remy;

        // Load animations for remy
        const animationLoader = new FBXLoader();
        const remyAnimations = [
          '/Animations/Fight Idle.fbx',
          '/Animations/Boxing.fbx',
          '/Animations/Taunt.fbx',
        ];

        remyAnimations.forEach((animPath, index) => {
          animationLoader.load(animPath, (anim) => {
            const action = mixerRemy.clipAction(anim.animations[0]);
            gameRef.current.actions.remy[`animation_${index}`] = action;
            gameRef.current.animations.remy.push(action);
          });
        });

        checkLoadingComplete();
      });
    };

    // --- Animation Functions ---
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = gameRef.current.clock.getDelta();

      if (gameRef.current.mixerBoss) {
        gameRef.current.mixerBoss.update(delta);
      }
      if (gameRef.current.mixerRemy) {
        gameRef.current.mixerRemy.update(delta);
      }

      renderer.render(scene, camera);
    };

    const cycleAnimations = (character) => {
      const animations = gameRef.current.animations[character];
      const currentIndex = gameRef.current.currentAnimationIndex[character];
      const mixer =
        character === 'boss'
          ? gameRef.current.mixerBoss
          : gameRef.current.mixerRemy;

      if (animations.length > 0) {
        // Stop current animation
        animations[currentIndex].stop();

        // Move to next animation
        const nextIndex = (currentIndex + 1) % animations.length;
        gameRef.current.currentAnimationIndex[character] = nextIndex;

        // Start new animation
        animations[nextIndex].reset().play();
        console.log(`${character} cycling to animation ${nextIndex}`);
      }
    };

    const startAnimation = () => {
      // Start with first animation for each character
      if (gameRef.current.animations.boss.length > 0) {
        gameRef.current.animations.boss[0].play();
      }
      if (gameRef.current.animations.remy.length > 0) {
        gameRef.current.animations.remy[0].play();
      }

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
        console.log('Cleaning up arena background resources...');
        clearTimeout(initialDelayTimer);
        window.removeEventListener('resize', handleResize);

        // Safely remove renderer from mount
        if (mountRef.current && renderer && renderer.domElement) {
          try {
            mountRef.current.removeChild(renderer.domElement);
          } catch (error) {
            console.warn('Error removing renderer from mount:', error);
          }
        }

        // Safely remove iframe container
        try {
          const existingIframeContainer = document.getElementById(
            'sketchfab-arena-background-container'
          );
          if (existingIframeContainer && existingIframeContainer.parentNode) {
            existingIframeContainer.parentNode.removeChild(
              existingIframeContainer
            );
          }
        } catch (error) {
          console.warn('Error removing iframe container:', error);
        }

        // Safely dispose renderer
        if (renderer) {
          try {
            renderer.dispose();
          } catch (error) {
            console.warn('Error disposing renderer:', error);
          }
        }

        // Safely cleanup mixers
        if (gameRef.current.mixerBoss) {
          try {
            gameRef.current.mixerBoss.stopAllAction();
          } catch (error) {
            console.warn('Error stopping boss mixer:', error);
          }
          gameRef.current.mixerBoss = null;
        }

        if (gameRef.current.mixerRemy) {
          try {
            gameRef.current.mixerRemy.stopAllAction();
          } catch (error) {
            console.warn('Error stopping remy mixer:', error);
          }
          gameRef.current.mixerRemy = null;
        }
      };
    };

    animate();
  }, []);

  // Animation cycling useEffect
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
  }, [charactersLoaded]);

  // Countdown timer effect
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      const newCountdowns = {};

      existingBattles.forEach((battle) => {
        if (battle.status === 'Waiting for Opponent' && battle.startTime) {
          const startTime = new Date(battle.startTime).getTime();
          const timeLeft = startTime - now;

          if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor(
              (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            if (hours > 0) {
              newCountdowns[battle.id] = `${hours}hrs: ${minutes}min`;
            } else if (minutes > 0) {
              newCountdowns[battle.id] = `${minutes}min: ${seconds}s`;
            } else {
              newCountdowns[battle.id] = `${seconds}s`;
            }
          } else {
            newCountdowns[battle.id] = 'Starting...';
          }
        }
      });

      setCountdowns(newCountdowns);
    };

    // Update immediately
    updateCountdowns();

    // Update every second
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [existingBattles]);

  const handleCreateBattle = () => {
    setShowCreateModal(true);
    setCreateStep(1);
    setBattleParams({
      betAmount: '',
      duration: '6',
      activeResults: false,
      startTime: getCurrentDateTime(),
    });
  };

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
    setCreateStep(2);
  };

  const handleCreateBattleSubmit = () => {
    // TODO: Add smart contract interaction here
    console.log('Creating battle with params:', { selectedNFT, battleParams });
    setShowCreateModal(false);
    setCreateStep(1);
    setSelectedNFT(null);
    setBattleParams({
      betAmount: '',
      duration: '6',
      activeResults: false,
      startTime: '',
    });
  };

  const handleJoinBattle = (battleId) => {
    // TODO: Add smart contract interaction here
    console.log('Joining battle:', battleId);
  };

  const handleViewBattle = (battleId) => {
    // TODO: Navigate to battle view
    console.log('Viewing battle:', battleId);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Three.js Background */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '20px',
          margin: '20px 0',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              color: '#ff0000',
              fontSize: '48px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              marginBottom: '10px',
            }}
          >
            THE ARENA
          </h1>
          <p style={{ color: '#ccc', fontSize: '18px' }}>
            Stake your NFT fighters and battle for glory
          </p>
        </div>

        {/* Battle Type Toggle and View Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto 30px',
            padding: '0 20px',
          }}
        >
          {/* Battle Type Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span
              style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}
            >
              Battle Type:
            </span>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(30, 0, 0, 0.8)',
                borderRadius: '25px',
                padding: '4px',
                border: '2px solid #8B0000',
              }}
            >
              <button
                onClick={() => setBattleTypeFilter('joining')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor:
                    battleTypeFilter === 'joining' ? '#ff0000' : 'transparent',
                  color: battleTypeFilter === 'joining' ? '#fff' : '#ccc',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                }}
              >
                Joining
              </button>
              <button
                onClick={() => setBattleTypeFilter('aboutToStart')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor:
                    battleTypeFilter === 'aboutToStart'
                      ? '#ff0000'
                      : 'transparent',
                  color: battleTypeFilter === 'aboutToStart' ? '#fff' : '#ccc',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                }}
              >
                About to Start
              </button>
              <button
                onClick={() => setBattleTypeFilter('activeResults')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor:
                    battleTypeFilter === 'activeResults'
                      ? '#ff0000'
                      : 'transparent',
                  color: battleTypeFilter === 'activeResults' ? '#fff' : '#ccc',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                }}
              >
                Active & Results
              </button>
            </div>
          </div>

          {/* Create New Battle Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleCreateBattle}
              style={{
                background:
                  'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
              onMouseEnter={(e) => {
                e.target.style.background =
                  'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
              }}
            >
              Create New Battle
            </button>
          </div>
        </div>

        {/* Existing Battles Section */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              color: '#fff',
              fontSize: '32px',
              marginBottom: '30px',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            Existing Battles ({filteredBattles.length})
          </h2>

          {/* Table View */}
          <div
            style={{
              backgroundColor: 'rgba(30, 0, 0, 0.95)',
              border: '2px solid #8B0000',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(139, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 1fr 120px 100px 120px 120px',
                gap: '15px',
                padding: '15px 20px',
                backgroundColor: 'rgba(139, 0, 0, 0.3)',
                borderBottom: '1px solid #8B0000',
                fontWeight: 'bold',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              <div>#</div>
              <div>Creator</div>
              <div>Opponent</div>
              <div>Prize Pool</div>
              <div>Duration</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {/* Table Rows */}
            {filteredBattles.map((battle) => (
              <div
                key={battle.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 1fr 120px 100px 120px 120px',
                  gap: '15px',
                  padding: '15px 20px',
                  borderBottom: '1px solid rgba(139, 0, 0, 0.3)',
                  alignItems: 'center',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(139, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ color: '#ff0000', fontWeight: 'bold' }}>
                  #{battle.id}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                    }}
                  >
                    🥊
                  </div>
                  <div>
                    <div
                      style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '14px',
                      }}
                    >
                      {battle.creator.name}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      {battle.creator.address}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {battle.opponent ? (
                    <>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                        }}
                      >
                        🥊
                      </div>
                      <div>
                        <div
                          style={{
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '14px',
                          }}
                        >
                          {battle.opponent.name}
                        </div>
                        <div style={{ color: '#ccc', fontSize: '12px' }}>
                          {battle.opponent.address}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        color: '#ccc',
                        fontStyle: 'italic',
                        fontSize: '14px',
                      }}
                    >
                      Waiting...
                    </div>
                  )}
                </div>

                <div style={{ color: '#fff', fontSize: '14px' }}>
                  {battle.prizePool}
                </div>

                <div style={{ color: '#fff', fontSize: '14px' }}>
                  {battle.duration}
                </div>

                <div>
                  {battle.status === 'Waiting for Opponent' ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        {battle.status}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#ff6b6b',
                          fontWeight: 'bold',
                          textAlign: 'center',
                        }}
                      >
                        {countdowns[battle.id] || 'Starting...'}
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor:
                          battle.status === 'Active'
                            ? '#22c55e'
                            : battle.status === 'Completed'
                            ? '#6b7280'
                            : '#f59e0b',
                        color: 'white',
                      }}
                    >
                      {battle.status}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div>
                  {battle.status === 'Waiting for Opponent' && (
                    <button
                      onClick={() => handleJoinBattle(battle.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#16a34a';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#22c55e';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      Join
                    </button>
                  )}
                  {battle.status === 'Active' && (
                    <button
                      onClick={() => handleViewBattle(battle.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      Watch
                    </button>
                  )}
                  {battle.status === 'Completed' && (
                    <button
                      onClick={() => handleViewBattle(battle.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#4b5563';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#6b7280';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Battle Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(30, 0, 0, 0.95)',
              border: '2px solid #8B0000',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(139, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ color: '#ff0000', margin: 0 }}>
                {createStep === 1
                  ? 'Select NFT to Stake'
                  : 'Set Battle Parameters'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ccc',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {createStep === 1 ? (
              <div>
                <p style={{ color: '#ccc', marginBottom: '20px' }}>
                  Choose which NFT fighter you want to stake in this battle:
                </p>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {userNFTs.map((nft) => (
                    <div
                      key={nft.id}
                      onClick={() => handleNFTSelect(nft)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor =
                          'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '8px',
                          marginRight: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        🥊
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>
                          {nft.name}
                        </div>
                        <div style={{ color: '#ccc', fontSize: '14px' }}>
                          {nft.rarity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#ccc', marginBottom: '20px' }}>
                  Selected NFT:{' '}
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {selectedNFT?.name}
                  </span>
                </p>

                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label
                      style={{
                        color: '#fff',
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      Bet Amount (USDC):
                    </label>
                    <input
                      type="number"
                      value={battleParams.betAmount}
                      onChange={(e) =>
                        setBattleParams({
                          ...battleParams,
                          betAmount: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '5px',
                        color: '#fff',
                        fontSize: '16px',
                      }}
                      placeholder="Enter amount..."
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: '#fff',
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      Duration:
                    </label>
                    <select
                      value={battleParams.duration}
                      onChange={(e) =>
                        setBattleParams({
                          ...battleParams,
                          duration: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '5px',
                        color: '#fff',
                        fontSize: '16px',
                      }}
                    >
                      <option value="6">6 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        color: '#fff',
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      Battle Start Time:
                    </label>
                    <input
                      type="datetime-local"
                      value={battleParams.startTime}
                      onChange={(e) =>
                        setBattleParams({
                          ...battleParams,
                          startTime: e.target.value,
                        })
                      }
                      min={getCurrentDateTime()}
                      defaultValue={getCurrentDateTime()}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '5px',
                        color: '#fff',
                        fontSize: '16px',
                      }}
                      required
                    />
                    <small
                      style={{
                        color: '#ccc',
                        fontSize: '12px',
                        marginTop: '5px',
                      }}
                    >
                      Select when you want the battle to start
                    </small>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={battleParams.activeResults}
                      onChange={(e) =>
                        setBattleParams({
                          ...battleParams,
                          activeResults: e.target.checked,
                        })
                      }
                      style={{ marginRight: '10px' }}
                    />
                    <label style={{ color: '#fff', cursor: 'pointer' }}>
                      Active & Results (Live updates and detailed results)
                    </label>
                  </div>

                  <div
                    style={{ display: 'flex', gap: '10px', marginTop: '20px' }}
                  >
                    <button
                      onClick={() => setCreateStep(1)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateBattleSubmit}
                      disabled={
                        !battleParams.betAmount || !battleParams.startTime
                      }
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor:
                          battleParams.betAmount && battleParams.startTime
                            ? '#22c55e'
                            : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor:
                          battleParams.betAmount && battleParams.startTime
                            ? 'pointer'
                            : 'not-allowed',
                        fontSize: '16px',
                      }}
                    >
                      Create Battle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
