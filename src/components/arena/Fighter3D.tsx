'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Fighter3DProps {
  id: string;
  name: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  isAttacking?: boolean;
  isDefending?: boolean;
  onHealthChange?: (health: number) => void;
}

export default function Fighter3D({
  id,
  name,
  position,
  health,
  maxHealth,
  isAttacking = false,
  isDefending = false,
  onHealthChange,
}: Fighter3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [animationState, setAnimationState] = useState('idle');

  // Simple animation loop
  useFrame((state) => {
    if (meshRef.current) {
      // Idle animation - slight bobbing
      if (animationState === 'idle') {
        meshRef.current.position.y =
          position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }

      // Attack animation - forward movement
      if (isAttacking) {
        meshRef.current.position.z =
          position[2] + Math.sin(state.clock.elapsedTime * 8) * 0.5;
        meshRef.current.rotation.y =
          Math.sin(state.clock.elapsedTime * 4) * 0.2;
      }

      // Defend animation - slight crouch
      if (isDefending) {
        meshRef.current.scale.y = 0.8;
        meshRef.current.position.y = position[1] - 0.5;
      } else {
        meshRef.current.scale.y = 1;
        meshRef.current.position.y = position[1];
      }
    }
  });

  const healthPercentage = (health / maxHealth) * 100;
  const healthColor =
    healthPercentage > 60
      ? '#22c55e'
      : healthPercentage > 30
      ? '#f59e0b'
      : '#ef4444';

  return (
    <group position={position}>
      {/* Fighter Body - Simple placeholder */}
      <mesh ref={meshRef} castShadow>
        {/* Head */}
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.4, 0.6, 1.2, 8]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.8, 1.2, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.8, 1.2, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.2, 0.3, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 8]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[0.2, 0.3, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 8]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </mesh>

      {/* Health Bar */}
      <group position={[0, 2.5, 0]}>
        {/* Health Bar Background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#374151" />
        </mesh>

        {/* Health Bar Fill */}
        <mesh position={[-(1.2 - (healthPercentage / 100) * 1.2) / 2, 0, 0.01]}>
          <boxGeometry args={[1.2 * (healthPercentage / 100), 0.08, 0.05]} />
          <meshStandardMaterial color={healthColor} />
        </mesh>
      </group>

      {/* Name Tag */}
      <group position={[0, 2.8, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.3, 0.1]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Attack Effect */}
      {isAttacking && (
        <mesh position={[0, 1.2, 1.5]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Defense Effect */}
      {isDefending && (
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
