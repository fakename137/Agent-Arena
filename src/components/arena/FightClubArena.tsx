'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import Fighter3D from './Fighter3D';
import BattleControls from './BattleControls';

interface Fighter {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  position: [number, number, number];
  isAttacking: boolean;
  isDefending: boolean;
}

// Underground Basement Arena Component
const UndergroundArena = () => {
  return (
    <group>
      {/* Floor - Concrete basement */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 10, 0]} receiveShadow>
        <boxGeometry args={[20, 0.5, 20]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Fight Club Rules Sign */}
      <mesh position={[-8, 6, -9.5]}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Graffiti on walls */}
      <mesh position={[8, 3, -9.5]}>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>

      {/* Arena Ring - Circular fighting area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3, 4, 32]} />
        <meshStandardMaterial color="#8B0000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// Lighting for underground atmosphere
const UndergroundLighting = () => {
  return (
    <>
      {/* Dim ambient light for underground feel */}
      <ambientLight intensity={0.2} color="#404040" />

      {/* Main spotlight */}
      <spotLight
        position={[0, 8, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#FF6B35"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Secondary lights for atmosphere */}
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#FF4500" />
      <pointLight position={[5, 5, -5]} intensity={0.3} color="#FF4500" />
    </>
  );
};

// Battle System Component
const BattleSystem = () => {
  const [fighters, setFighters] = useState<Fighter[]>([
    {
      id: 'bitcoin',
      name: 'Bitcoin Brawler',
      health: 100,
      maxHealth: 100,
      position: [-2, 0, 0],
      isAttacking: false,
      isDefending: false,
    },
    {
      id: 'ethereum',
      name: 'Ethereum Elite',
      health: 100,
      maxHealth: 100,
      position: [2, 0, 0],
      isAttacking: false,
      isDefending: false,
    },
  ]);

  const [battleState, setBattleState] = useState<
    'waiting' | 'fighting' | 'finished'
  >('fighting');
  const [round, setRound] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Simple AI battle logic
  useEffect(() => {
    if (battleState === 'fighting' && !isPaused) {
      const battleInterval = setInterval(() => {
        setFighters((prev) => {
          const newFighters = [...prev];

          // Fighter 1 attacks
          if (Math.random() > 0.5) {
            newFighters[0].isAttacking = true;
            newFighters[1].isDefending = Math.random() > 0.7;

            setTimeout(() => {
              setFighters((current) => {
                const updated = [...current];
                updated[0].isAttacking = false;
                updated[1].isDefending = false;

                // Calculate damage
                if (!updated[1].isDefending) {
                  const damage = Math.floor(Math.random() * 20) + 10;
                  updated[1].health = Math.max(0, updated[1].health - damage);
                }

                return updated;
              });
            }, 500);
          }

          // Fighter 2 attacks
          if (Math.random() > 0.5) {
            newFighters[1].isAttacking = true;
            newFighters[0].isDefending = Math.random() > 0.7;

            setTimeout(() => {
              setFighters((current) => {
                const updated = [...current];
                updated[1].isAttacking = false;
                updated[0].isDefending = false;

                // Calculate damage
                if (!updated[0].isDefending) {
                  const damage = Math.floor(Math.random() * 20) + 10;
                  updated[0].health = Math.max(0, updated[0].health - damage);
                }

                return updated;
              });
            }, 500);
          }

          return newFighters;
        });

        // Check for battle end
        setFighters((current) => {
          if (current[0].health <= 0 || current[1].health <= 0) {
            setBattleState('finished');
            return current;
          }
          return current;
        });

        setRound((prev) => prev + 1);
      }, 2000);

      return () => clearInterval(battleInterval);
    }
  }, [battleState, isPaused]);

  // Battle control handlers
  const handleAttack = () => {
    if (!isPaused) {
      setFighters((prev) => {
        const newFighters = [...prev];
        newFighters[0].isAttacking = true;

        setTimeout(() => {
          setFighters((current) => {
            const updated = [...current];
            updated[0].isAttacking = false;

            // Manual attack damage
            const damage = Math.floor(Math.random() * 25) + 15;
            updated[1].health = Math.max(0, updated[1].health - damage);

            return updated;
          });
        }, 500);

        return newFighters;
      });
    }
  };

  const handleDefend = () => {
    if (!isPaused) {
      setFighters((prev) => {
        const newFighters = [...prev];
        newFighters[0].isDefending = true;

        setTimeout(() => {
          setFighters((current) => {
            const updated = [...current];
            updated[0].isDefending = false;
            return updated;
          });
        }, 1000);

        return newFighters;
      });
    }
  };

  const handleSpecial = () => {
    if (!isPaused) {
      setFighters((prev) => {
        const newFighters = [...prev];
        newFighters[0].isAttacking = true;

        setTimeout(() => {
          setFighters((current) => {
            const updated = [...current];
            updated[0].isAttacking = false;

            // Special attack - more damage
            const damage = Math.floor(Math.random() * 35) + 25;
            updated[1].health = Math.max(0, updated[1].health - damage);

            return updated;
          });
        }, 800);

        return newFighters;
      });
    }
  };

  const handleReset = () => {
    setFighters([
      {
        id: 'bitcoin',
        name: 'Bitcoin Brawler',
        health: 100,
        maxHealth: 100,
        position: [-2, 0, 0],
        isAttacking: false,
        isDefending: false,
      },
      {
        id: 'ethereum',
        name: 'Ethereum Elite',
        health: 100,
        maxHealth: 100,
        position: [2, 0, 0],
        isAttacking: false,
        isDefending: false,
      },
    ]);
    setBattleState('fighting');
    setRound(1);
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <group>
      {fighters.map((fighter) => (
        <Fighter3D
          key={fighter.id}
          id={fighter.id}
          name={fighter.name}
          position={fighter.position}
          health={fighter.health}
          maxHealth={fighter.maxHealth}
          isAttacking={fighter.isAttacking}
          isDefending={fighter.isDefending}
        />
      ))}

      {/* Battle Controls Overlay */}
      <BattleControls
        onAttack={handleAttack}
        onDefend={handleDefend}
        onSpecial={handleSpecial}
        onReset={handleReset}
        onTogglePause={handleTogglePause}
        isPaused={isPaused}
        round={round}
        maxRounds={5}
        fighter1Health={fighters[0].health}
        fighter2Health={fighters[1].health}
      />
    </group>
  );
};

// Main Arena Component
const FightClubArena = () => {
  const [cameraPosition] = useState([0, 8, 12]);

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas
        camera={{
          position: cameraPosition,
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <UndergroundLighting />
          <UndergroundArena />
          <BattleSystem />

          {/* Environment for reflections */}
          <Environment preset="warehouse" />

          {/* Camera controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default FightClubArena;
