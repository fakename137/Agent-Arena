// lib/gameLogic.js
import { useState, useRef } from 'react';
import {
  stopAllAnimations,
  resetToIdle,
  moveTowardsOpponent,
} from './threeSetup'; // Import utilities

export const useGameLogic = (gameRef, setLoading) => {
  const [bossHealth, setBossHealth] = useState(100);
  const [remyHealth, setRemyHealth] = useState(100);
  const [progress, setProgress] = useState({ boss: 0, remy: 0 });
  const [combatLog, setCombatLog] = useState([]);
  const [winner, setWinner] = useState(null); // Track winner

  // --- Sound Effect ---
  const playSound = (soundFile) => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.3;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    }
  };

  // --- Combat Log ---
  const addToCombatLog = (message) => {
    setCombatLog((prev) => [...prev.slice(-4), message]);
  };

  // --- Execute Attack ---
  const executeAttack = (
    attacker,
    attackAnimation,
    damage,
    attackType = 'punch'
  ) => {
    if (bossHealth <= 0 || remyHealth <= 0 || !gameRef || !gameRef.current)
      return;
    const gameData = gameRef.current; // Access the ref's current value

    const isBoss = attacker === 'boss';
    const defender = isBoss ? 'remy' : 'boss';
    const attackerActions = isBoss
      ? gameData.actions.boss
      : gameData.actions.remy;
    const defenderActions = isBoss
      ? gameData.actions.remy
      : gameData.actions.boss;
    const defenderIsBlocking = isBoss
      ? gameData.blocking.remy
      : gameData.blocking.boss;

    gameData.attacking[attacker] = true;

    moveTowardsOpponent(attacker, attackType, gameData, () => {
      // This callback runs after the character returns from the attack movement
      // Reset attacker to idle pose after returning
      resetToIdle(attacker, gameData);
    });

    if (gameData.currentActions[attacker]) {
      gameData.currentActions[attacker].stop();
    }

    const attackAction = attackerActions[attackAnimation];
    if (!attackAction) {
      console.warn(`Animation ${attackAnimation} not found for ${attacker}`);
      gameData.attacking[attacker] = false;
      return;
    }

    if (attackType === 'punch') playSound('punch.mp3');
    else if (attackType === 'kick') playSound('kick.mp3');
    else if (attackType === 'special') playSound('special.mp3');
    attackAction.reset();
    attackAction.setLoop(THREE.LoopOnce);
    attackAction.clampWhenFinished = true;
    attackAction.play();
    gameData.currentActions[attacker] = attackAction;

    const actualDamage = defenderIsBlocking ? Math.floor(damage * 0.3) : damage;
    const damageTime = attackAction.getClip().duration * 0.5;

    setTimeout(() => {
      if (isBoss) {
        setRemyHealth((prev) => {
          const newHealth = Math.max(0, prev - actualDamage);
          if (newHealth <= 0) setWinner('Remy');
          return newHealth;
        });
      } else {
        setBossHealth((prev) => {
          const newHealth = Math.max(0, prev - actualDamage);
          if (newHealth <= 0) setWinner('Brad');
          return newHealth;
        });
      }

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

    setTimeout(() => {
      attackAction.stop();
      // Determine reaction based on blocking and damage
      let reactionAnimation = 'Receive Punch To The Face.fbx';
      if (defenderIsBlocking) {
        reactionAnimation = 'Body Block.fbx';
      } else if (actualDamage >= 20) {
        reactionAnimation = 'Shoved Reaction With Spin.fbx';
      } else if (actualDamage >= 15) {
        reactionAnimation = 'Sweep Fall.fbx';
      }

      const reactionAction = defenderActions[reactionAnimation];
      if (reactionAction) {
        if (gameData.currentActions[defender]) {
          gameData.currentActions[defender].stop();
        }
        reactionAction.reset();
        reactionAction.setLoop(THREE.LoopOnce);
        reactionAction.clampWhenFinished = true;
        reactionAction.play();
        gameData.currentActions[defender] = reactionAction;

        setTimeout(() => {
          reactionAction.stop();
          resetToIdle(defender, gameData);
        }, reactionAction.getClip().duration * 1000);
      }
      // Attacker idle is handled by moveTowardsOpponent callback
    }, attackAction.getClip().duration * 1000);
  };

  // --- Execute Combo ---
  const executeCombo = (attacker, comboMoves) => {
    if (bossHealth <= 0 || remyHealth <= 0 || !gameRef || !gameRef.current)
      return;
    const gameData = gameRef.current;

    const isBoss = attacker === 'boss';
    const defender = isBoss ? 'remy' : 'boss';
    const attackerActions = isBoss
      ? gameData.actions.boss
      : gameData.actions.remy;
    const defenderActions = isBoss
      ? gameData.actions.remy
      : gameData.actions.boss;

    playSound('combo.mp3');
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} performs a combo attack!`);

    let moveIndex = 0;
    const executeNextMove = () => {
      if (
        moveIndex >= comboMoves.length ||
        bossHealth <= 0 ||
        remyHealth <= 0
      ) {
        resetToIdle(attacker, gameData);
        return;
      }

      const move = comboMoves[moveIndex];
      const attackAction = attackerActions[move.animation];
      if (!attackAction) {
        moveIndex++;
        executeNextMove();
        return;
      }

      moveTowardsOpponent(attacker, move.type, gameData, () => {
        // Callback after movement for this specific combo move
        // Reset to idle after this move's animation finishes
        setTimeout(() => {
          resetToIdle(attacker, gameData);
        }, attackAction.getClip().duration * 1000);
      });

      if (move.type === 'punch') playSound('punch.mp3');
      else if (move.type === 'kick') playSound('kick.mp3');

      if (gameData.currentActions[attacker]) {
        gameData.currentActions[attacker].stop();
      }

      attackAction.reset();
      attackAction.setLoop(THREE.LoopOnce);
      attackAction.clampWhenFinished = true;
      attackAction.play();
      gameData.currentActions[attacker] = attackAction;

      const damageTime = attackAction.getClip().duration * 0.5;
      setTimeout(() => {
        if (isBoss) {
          setRemyHealth((prev) => {
            const newHealth = Math.max(0, prev - move.damage);
            if (newHealth <= 0) setWinner('Remy');
            return newHealth;
          });
        } else {
          setBossHealth((prev) => {
            const newHealth = Math.max(0, prev - move.damage);
            if (newHealth <= 0) setWinner('Brad');
            return newHealth;
          });
        }
        if (move.damage > 0) {
          showBloodEffect();
        }
      }, damageTime * 1000);

      setTimeout(() => {
        attackAction.stop();
        moveIndex++;
        executeNextMove();
      }, attackAction.getClip().duration * 1000);
    };
    executeNextMove();
  };

  // --- Blocking ---
  const toggleBlock = (character) => {
    if (bossHealth <= 0 || remyHealth <= 0 || !gameRef || !gameRef.current)
      return;
    const gameData = gameRef.current;
    const isBoss = character === 'boss';
    gameData.blocking[character] = !gameData.blocking[character];

    if (gameData.blocking[character]) {
      const actions = isBoss ? gameData.actions.boss : gameData.actions.remy;
      const blockAction = actions['Body Block.fbx'];
      if (blockAction) {
        if (gameData.currentActions[character]) {
          gameData.currentActions[character].stop();
        }
        blockAction.reset();
        blockAction.setLoop(THREE.LoopRepeat);
        blockAction.play();
        gameData.currentActions[character] = blockAction;
        addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} is blocking!`);
        playSound('block.mp3');
      }
    } else {
      resetToIdle(character, gameData);
      addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} stops blocking`);
    }
  };

  // --- Dodge ---
  const dodge = (character) => {
    if (bossHealth <= 0 || remyHealth <= 0 || !gameRef || !gameRef.current)
      return;
    const gameData = gameRef.current;
    const isBoss = character === 'boss';
    const actions = isBoss ? gameData.actions.boss : gameData.actions.remy;
    const dodgeAction =
      actions['Au To Role.fbx'] ||
      actions['Esquiva 2.fbx'] ||
      actions['Esquiva 5.fbx'];
    if (!dodgeAction) return;

    if (gameData.currentActions[character]) {
      gameData.currentActions[character].stop();
    }

    dodgeAction.reset();
    dodgeAction.setLoop(THREE.LoopOnce);
    dodgeAction.clampWhenFinished = true;
    dodgeAction.play();
    gameData.currentActions[character] = dodgeAction;
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} dodges!`);
    playSound('dodge.mp3');

    setTimeout(() => {
      dodgeAction.stop();
      resetToIdle(character, gameData);
    }, dodgeAction.getClip().duration * 1000);
  };

  // --- Taunt ---
  const taunt = (character) => {
    if (bossHealth <= 0 || remyHealth <= 0 || !gameRef || !gameRef.current)
      return;
    const gameData = gameRef.current;
    const isBoss = character === 'boss';
    const actions = isBoss ? gameData.actions.boss : gameData.actions.remy;
    const tauntAction = actions['Taunt.fbx'];
    if (!tauntAction) return;

    if (gameData.currentActions[character]) {
      gameData.currentActions[character].stop();
    }

    tauntAction.reset();
    tauntAction.setLoop(THREE.LoopOnce);
    tauntAction.clampWhenFinished = true;
    tauntAction.play();
    gameData.currentActions[character] = tauntAction;
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} taunts!`);
    playSound('taunt.mp3');

    setTimeout(() => {
      tauntAction.stop();
      resetToIdle(character, gameData);
    }, tauntAction.getClip().duration * 1000);
  };

  // --- Special Move ---
  const specialMove = (character) => {
    if (bossHealth <= 0 || remyHealth <= 0 || !gameRef || !gameRef.current)
      return;
    const gameData = gameRef.current;
    const isBoss = character === 'boss';
    const attackAnimation = isBoss ? 'Martelo 2.fbx' : 'Hurricane Kick.fbx';
    executeAttack(character, attackAnimation, 25, 'special');
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} uses a special move!`);
  };

  // --- Knockout ---
  const knockout = (character) => {
    if (!gameRef || !gameRef.current) return;
    const gameData = gameRef.current;
    const isBoss = character === 'boss';
    const actions = isBoss ? gameData.actions.boss : gameData.actions.remy;
    const deathAction =
      actions['Death From Right.fbx'] || actions['Defeated.fbx'];
    if (!deathAction) return;

    if (gameData.currentActions[character]) {
      gameData.currentActions[character].stop();
    }

    deathAction.reset();
    deathAction.setLoop(THREE.LoopOnce);
    deathAction.clampWhenFinished = true;
    deathAction.play();
    gameData.currentActions[character] = deathAction;
    playSound('victory.mp3');
    addToCombatLog(`${isBoss ? 'Brad' : 'Remy'} is knocked out!`);
  };

  // --- Blood Effect ---
  const showBloodEffect = () => {
    const bloodOverlay = document.querySelector('.blood-overlay');
    if (bloodOverlay) {
      bloodOverlay.classList.remove('blood-flash');
      void bloodOverlay.offsetWidth;
      bloodOverlay.classList.add('blood-flash');
    }
  };

  // --- Reset Game ---
  const resetGame = () => {
    setBossHealth(100);
    setRemyHealth(100);
    setCombatLog([]);
    setWinner(null);
    if (gameRef.current) {
      gameRef.current.blocking.boss = false;
      gameRef.current.blocking.remy = false;
      // Reset animations to idle if needed, or let Three.js cleanup/re-init handle it
      resetToIdle('boss', gameRef.current);
      resetToIdle('remy', gameRef.current);
    }
    // setLoading(true); // Might need to re-trigger loading if full reset
  };

  return {
    bossHealth,
    remyHealth,
    progress,
    combatLog,
    winner,
    executeAttack,
    executeCombo,
    toggleBlock,
    dodge,
    taunt,
    specialMove,
    knockout,
    resetGame, // Export reset function
    setProgress, // Needed for loading updates from threeSetup
  };
};
