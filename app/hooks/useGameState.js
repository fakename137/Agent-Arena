// src/hooks/useGameState.js
import { useState, useEffect } from 'react';

export function useGameState() {
  const [bossHealth, setBossHealth] = useState(100);
  const [remyHealth, setRemyHealth] = useState(100);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ boss: 0, remy: 0 });
  const [combatLog, setCombatLog] = useState([]);

  // Handle damage to characters
  const applyDamage = (character, damage) => {
    if (character === 'boss') {
      setBossHealth((prev) => Math.max(0, prev - damage));
    } else {
      setRemyHealth((prev) => Math.max(0, prev - damage));
    }
  };

  // Update loading progress
  const updateProgress = (character, count) => {
    setProgress((prev) => ({
      ...prev,
      [character]: count,
    }));
  };

  // Add to combat log
  const addToCombatLog = (message) => {
    setCombatLog((prev) => [...prev.slice(-4), message]);
  };

  // Reset game state
  const resetGame = () => {
    setBossHealth(100);
    setRemyHealth(100);
    setLoading(true);
    setProgress({ boss: 0, remy: 0 });
    setCombatLog([]);
  };

  // Check if game is over
  const isGameOver = () => {
    return bossHealth <= 0 || remyHealth <= 0;
  };

  // Get winner
  const getWinner = () => {
    if (bossHealth <= 0) return 'remy';
    if (remyHealth <= 0) return 'boss';
    return null;
  };

  return {
    // State
    bossHealth,
    remyHealth,
    loading,
    progress,
    combatLog,

    // Actions
    setLoading,
    applyDamage,
    updateProgress,
    addToCombatLog,
    resetGame,
    isGameOver,
    getWinner,
  };
}
