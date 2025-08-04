// pages/battles/basement.js (or your actual file name)
import { useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { GameEngine } from '../lib/gameEngine';
import { CharacterManager } from '../lib/characterManager';
import { CombatSystem } from '../lib/combatSystem';
import { SoundManager } from '../lib/soundManager';
import { CombatLogger } from '../lib/combatLogger';
import { useGameState } from '../hooks/useGameState';
import { GameUI } from '../components/GameUI';

export default function StreetBattle() {
  const mountRef = useRef(null);
  const gameEngineRef = useRef(null);
  const characterManagerRef = useRef(null);
  const combatSystemRef = useRef(null);
  const soundManagerRef = useRef(null);
  const combatLoggerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const {
    bossHealth,
    remyHealth,
    loading,
    progress,
    combatLog,
    setLoading,
    applyDamage,
    updateProgress,
    addToCombatLog,
    isGameOver,
    getWinner,
    setBossHealth, // Make sure these setters are available from useGameState
    setRemyHealth,
  } = useGameState();

  // --- New state/functions for automated combat ---
  const isAutoCombatActiveRef = useRef(false); // Track if auto combat is running

  // Create a stable function to get current health for the automated combat system
  const getCurrentHealth = useCallback(
    () => ({
      boss: bossHealth,
      remy: remyHealth,
    }),
    [bossHealth, remyHealth]
  );

  // Handle damage callback (used by both manual and auto combat)
  const handleDamage = useCallback(
    (character, damage) => {
      applyDamage(character, damage);
    },
    [applyDamage]
  );

  // Handle game over callback for automated combat
  const handleAutoCombatGameOver = useCallback((message = 'Game Over') => {
    console.log('[AUTO] Combat Ended:', message);
    isAutoCombatActiveRef.current = false; // Mark as inactive
    // Optional: Add message to combat log or UI
    // addToCombatLog(`[AUTO] ${message}`);
    // Ensure it's stopped in the combat system as well
    if (combatSystemRef.current) {
      combatSystemRef.current.stopAutomatedCombat();
    }
    // You could trigger a UI state change here if needed
  }, []); // Dependencies are empty as it uses refs and global functions

  // Function to start automated combat
  const startAutomatedCombat = useCallback(() => {
    if (isAutoCombatActiveRef.current) {
      console.warn('[AUTO] Combat is already running.');
      return;
    }
    if (loading || isGameOver()) {
      console.warn('[AUTO] Cannot start combat while loading or game is over.');
      return;
    }
    if (!combatSystemRef.current) {
      console.error('[AUTO] CombatSystem is not initialized.');
      return;
    }

    console.log('[AUTO] Initiating combat sequence...');
    isAutoCombatActiveRef.current = true; // Mark as active

    // Call the startAutomatedCombat method on the CombatSystem instance
    combatSystemRef.current.startAutomatedCombat(
      handleDamage, // Callback to apply damage
      handleAutoCombatGameOver, // Callback when combat ends
      getCurrentHealth // Callback to get current health
    );
  }, [
    loading,
    isGameOver,
    handleDamage,
    getCurrentHealth,
    handleAutoCombatGameOver,
  ]);

  // Function to stop automated combat
  const stopAutomatedCombat = useCallback(() => {
    if (!isAutoCombatActiveRef.current) {
      console.warn('[AUTO] Combat is not running.');
      return;
    }
    console.log('[AUTO] Stopping combat sequence...');
    isAutoCombatActiveRef.current = false; // Mark as inactive
    if (combatSystemRef.current) {
      combatSystemRef.current.stopAutomatedCombat();
    }
    // Optional: Add message to combat log
    // addToCombatLog("[AUTO] Combat manually stopped.");
  }, []);
  // --- End new state/functions for automated combat ---

  // Initialize game systems
  useEffect(() => {
    // Initialize managers
    gameEngineRef.current = new GameEngine();
    characterManagerRef.current = new CharacterManager();
    soundManagerRef.current = new SoundManager();
    combatLoggerRef.current = new CombatLogger();

    // Initialize scene
    const scene = gameEngineRef.current.initialize(mountRef.current);

    // Initialize combat system
    combatSystemRef.current = new CombatSystem(
      characterManagerRef.current,
      soundManagerRef.current,
      combatLoggerRef.current
    );

    // Preload sounds
    soundManagerRef.current.preloadAllSounds();

    // Load characters
    characterManagerRef.current.loadCharacters(
      scene,
      (character, count) => {
        updateProgress(character, count);
      },
      () => {
        setLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update character positions
      // Note: With the enhanced CharacterManager, this might be less critical
      // if Y positions are handled correctly in playAnimation.
      // However, it's still good to call it as a safety net.
      characterManagerRef.current.updateCharacterPositions();

      // Animate scene (update mixers)
      gameEngineRef.current.animate({
        boss: characterManagerRef.current.mixerBoss,
        remy: characterManagerRef.current.mixerRemy,
      });
    };
    animate();

    // Cleanup
    return () => {
      // Ensure automated combat is stopped on unmount
      if (isAutoCombatActiveRef.current && combatSystemRef.current) {
        combatSystemRef.current.stopAutomatedCombat();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (gameEngineRef.current) {
        gameEngineRef.current.cleanup();
      }
    };
  }, []); // Empty dependency array is correct for initialization

  // Handle win conditions (moved inside useEffect to run on health changes)
  useEffect(() => {
    if (!loading && !isGameOver()) {
      // Only check if not loading and not already over
      if (bossHealth <= 0 && characterManagerRef.current?.boss) {
        combatSystemRef.current?.knockout('boss');
      }
      if (remyHealth <= 0 && characterManagerRef.current?.remy) {
        combatSystemRef.current?.knockout('remy');
      }
    }
  }, [bossHealth, remyHealth, loading, isGameOver]); // Depend on health and game state

  // --- NEW: Auto-start combat when loading is complete ---
  useEffect(() => {
    if (!loading && !isAutoCombatActiveRef.current && !isGameOver()) {
      // Wait a short moment for everything to be ready, then start combat
      const timer = setTimeout(() => {
        console.log('[AUTO] Auto-starting combat from Watch button...');
        startAutomatedCombat();
      }, 1000); // 1 second delay to ensure everything is ready

      return () => clearTimeout(timer);
    }
  }, [loading, startAutomatedCombat, isGameOver]);

  // Handle skip loading
  const handleSkipLoading = () => {
    setLoading(false);
  };

  // Sync combat log with UI (if needed, though useGameState likely handles this)
  // useEffect(() => {
  //   const logMessages = combatLoggerRef.current?.getLastMessages(4) || [];
  //   // Update the combat log in the UI if needed
  //   // The combat log is already managed by the CombatLogger class and useGameState
  // }, [combatLog]);

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

      {/* Game UI */}
      <GameUI
        bossHealth={bossHealth}
        remyHealth={remyHealth}
        combatLog={combatLog}
        loading={loading}
        progress={progress}
        onSkipLoading={handleSkipLoading}
        characterManager={characterManagerRef.current}
        combatSystem={combatSystemRef.current}
        onDamage={handleDamage}
        isGameOver={isGameOver}
        getWinner={getWinner}
        // --- Pass new functions to GameUI ---
        onStartAutoCombat={startAutomatedCombat}
        onStopAutoCombat={stopAutomatedCombat}
        isAutoCombatActive={isAutoCombatActiveRef.current} // Pass active state if UI needs it
        // ---
      />
    </div>
  );
}
