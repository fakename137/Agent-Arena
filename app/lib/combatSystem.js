// lib/combatSystem.js
import * as THREE from 'three';

export class CombatSystem {
  constructor(characterManager, soundManager, combatLogger) {
    this.characterManager = characterManager;
    this.soundManager = soundManager;
    this.combatLogger = combatLogger;

    // Properties for automated combat
    this.automatedCombatTimeout = null;
    this.isAutomatedCombatActive = false;
  }

  /**
   * Starts a 3-minute automated combat sequence between Brad and Remy.
   * @param {Function} onDamage - Callback to apply damage (character, amount)
   * @param {Function} onGameOver - Callback when the automated sequence ends or a player is KO'd
   * @param {Function} getHealth - Callback to get current health of 'boss' or 'remy' (e.g., () => ({ boss: bossHealth, remy: remyHealth }))
   */
  startAutomatedCombat(onDamage, onGameOver, getHealth) {
    // Ensure any existing automation is stopped
    this.stopAutomatedCombat();

    const durationMs = 3 * 60 * 1000; // 3 minutes in milliseconds
    const startTime = Date.now();
    this.isAutomatedCombatActive = true;

    console.log('Starting 3-minute automated combat sequence...');

    const performTurn = () => {
      if (
        !this.isAutomatedCombatActive ||
        Date.now() - startTime > durationMs
      ) {
        console.log('Automated combat sequence completed or stopped.');
        this.isAutomatedCombatActive = false;
        if (onGameOver) onGameOver("Time's up!");
        return;
      }

      // Check if either character is KO'd before proceeding
      const health = getHealth();
      if (health.boss <= 0 || health.remy <= 0) {
        console.log("A fighter is KO'd. Stopping automated combat.");
        this.isAutomatedCombatActive = false;
        if (onGameOver)
          onGameOver(
            health.boss <= 0 ? 'Remy wins by KO!' : 'Brad wins by KO!'
          );
        return;
      }

      const bradRoll = Math.floor(Math.random() * 11); // 0 to 10 inclusive
      const remyRoll = Math.floor(Math.random() * 11); // 0 to 10 inclusive

      console.log(`[AUTO] Brad rolls ${bradRoll}, Remy rolls ${remyRoll}`);

      let winner = null;
      if (bradRoll > remyRoll) {
        winner = 'boss';
        console.log('[AUTO] Brad wins the roll!');
      } else if (remyRoll > bradRoll) {
        winner = 'remy';
        console.log('[AUTO] Remy wins the roll!');
      } else {
        console.log("[AUTO] It's a tie! No action this turn.");
        // Schedule next turn quickly
        setTimeout(performTurn, 500); // Wait 0.5s before next roll if tie
        return;
      }

      // Define possible actions for the winner
      // Prioritize attacks, include specials, blocks, dodges occasionally
      const actionTypes = [
        'attack',
        'attack',
        'attack',
        'special',
        'block',
        'dodge',
      ]; // Weighted towards attacks
      const chosenActionType =
        actionTypes[Math.floor(Math.random() * actionTypes.length)];

      if (chosenActionType === 'attack') {
        // Select a random basic attack
        const attacks = [
          { anim: 'Punching.fbx', damage: 8, type: 'punch' },
          { anim: 'Hook Punch.fbx', damage: 12, type: 'punch' },
          { anim: 'Roundhouse Kick.fbx', damage: 15, type: 'kick' },
          { anim: 'Knee Kick Lead.fbx', damage: 14, type: 'kick' },
          { anim: 'Fist Fight A.fbx', damage: 18, type: 'punch' }, // Uppercut
        ];
        const chosenAttack =
          attacks[Math.floor(Math.random() * attacks.length)];
        console.log(
          `[AUTO] ${
            winner === 'boss' ? 'Brad' : 'Remy'
          } chooses to attack with ${chosenAttack.anim}`
        );

        // Use the existing executeAttack method for consistency
        this.executeAttack(
          winner,
          chosenAttack.anim,
          chosenAttack.damage,
          chosenAttack.type,
          onDamage
        );

        // Schedule next turn after a delay to allow the attack to complete
        // Adjust delay based on animation length if needed, or use a fixed estimate.
        // A reasonable delay might be the animation length + move time + a bit extra.
        // Let's estimate ~1.5 seconds for a full attack cycle (this can be refined)
        setTimeout(performTurn, 1800); // 1.8s
      } else if (chosenActionType === 'special') {
        console.log(
          `[AUTO] ${
            winner === 'boss' ? 'Brad' : 'Remy'
          } chooses to use a special move!`
        );
        this.specialMove(winner, onDamage);
        // Special moves might take longer, wait ~2.5s
        setTimeout(performTurn, 2500);
      } else if (chosenActionType === 'block') {
        console.log(
          `[AUTO] ${winner === 'boss' ? 'Brad' : 'Remy'} chooses to block.`
        );
        this.toggleBlock(winner); // Start blocking
        // Briefly hold the block, then stop
        setTimeout(() => {
          if (this.characterManager.blocking[winner]) {
            this.toggleBlock(winner); // Stop blocking
          }
          // Schedule next turn after a short delay to allow block animation to finish/reset
          setTimeout(performTurn, 800);
        }, 1200); // Hold block for 1.2 seconds
      } else if (chosenActionType === 'dodge') {
        console.log(
          `[AUTO] ${winner === 'boss' ? 'Brad' : 'Remy'} chooses to dodge.`
        );
        this.dodge(winner);
        // Dodge is quick, next turn soon
        setTimeout(performTurn, 1200);
      }
    };

    performTurn(); // Start the first turn immediately

    // Set a timeout to stop the sequence after 3 minutes
    this.automatedCombatTimeout = setTimeout(() => {
      console.log('3 minutes elapsed. Stopping automated combat.');
      this.isAutomatedCombatActive = false;
      // Ensure the final onGameOver call happens
      if (onGameOver && getHealth().boss > 0 && getHealth().remy > 0) {
        onGameOver("Time's up!");
      } else if (onGameOver) {
        // If a KO happened just before the timer, onGameOver might already be called.
        // This is a simple check, you might refine win condition logic in `performTurn`.
      }
    }, durationMs);
  }

  /**
   * Stops the currently running automated combat sequence.
   */
  stopAutomatedCombat() {
    if (this.automatedCombatTimeout) {
      clearTimeout(this.automatedCombatTimeout);
      this.automatedCombatTimeout = null;
    }
    this.isAutomatedCombatActive = false;
    console.log('Automated combat stopped.');
  }

  // --- Existing Methods from Enhanced CombatSystem ---

  /**
   * Move character towards opponent during attack with smoother interpolation.
   * @param {string} attacker - 'boss' or 'remy'
   * @param {string} attackType - Type of attack (affects distance)
   * @param {number} duration - Duration of the forward movement in seconds
   * @returns {Promise<void>} - Resolves when the forward movement is complete
   */
  moveTowardsOpponent(attacker, attackType, duration = 0.15) {
    // Shorter, snappier movement
    return new Promise((resolve) => {
      const isBoss = attacker === 'boss';
      const character = isBoss
        ? this.characterManager.boss
        : this.characterManager.remy;
      const opponent = isBoss
        ? this.characterManager.remy
        : this.characterManager.boss;
      if (!character || !opponent) {
        resolve();
        return;
      }
      const originalY = character.position.y; // Store original Y for correct calculation
      const direction = new THREE.Vector3();
      opponent.getWorldPosition(direction);
      direction.sub(character.position).normalize(); // Direction vector towards opponent
      const moveDistance =
        attackType === 'punch' ? 0.4 : attackType === 'kick' ? 0.6 : 0.3; // Reduced distance
      const targetPosition = character.position
        .clone()
        .add(direction.multiplyScalar(moveDistance));
      targetPosition.y = originalY; // Maintain Y level
      const startPosition = character.position.clone();
      const startTime = performance.now(); // Use performance.now for better precision
      const moveCharacter = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000; // Convert ms to s
        const progress = Math.min(elapsed / duration, 1);
        character.position.lerpVectors(startPosition, targetPosition, progress);
        character.position.y = originalY; // Lock Y
        if (progress < 1) {
          requestAnimationFrame(moveCharacter);
        } else {
          character.position.copy(targetPosition); // Ensure final position is exact
          character.position.y = originalY;
          resolve(); // Resolve when forward movement is done
        }
      };
      requestAnimationFrame(moveCharacter);
    });
  }

  /**
   * Return character to their original position after attack.
   * @param {string} attacker - 'boss' or 'remy'
   * @param {number} duration - Duration of the return movement in seconds
   * @returns {Promise<void>} - Resolves when the return movement is complete
   */
  returnToPosition(attacker, duration = 0.2) {
    // Shorter return
    return new Promise((resolve) => {
      const isBoss = attacker === 'boss';
      const character = isBoss
        ? this.characterManager.boss
        : this.characterManager.remy;
      if (!character) {
        resolve();
        return;
      }
      const originalY = isBoss ? -2 : 0;
      const targetPosition = isBoss
        ? new THREE.Vector3(-0.5, originalY, 0) // Match initial boss position
        : new THREE.Vector3(2.5, originalY, 0); // Match initial remy position
      const startPosition = character.position.clone();
      const startTime = performance.now();
      const returnCharacter = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        character.position.lerpVectors(startPosition, targetPosition, progress);
        character.position.y = originalY; // Lock Y
        if (progress < 1) {
          requestAnimationFrame(returnCharacter);
        } else {
          character.position.copy(targetPosition); // Ensure final position is exact
          character.position.y = originalY;
          resolve(); // Resolve when return is done
        }
      };
      requestAnimationFrame(returnCharacter);
    });
  }

  /**
   * Execute a single attack with integrated movement and smooth animation handling.
   * @param {string} attacker - 'boss' or 'remy'
   * @param {string} attackAnimation - Name of the animation file
   * @param {number} damage - Base damage of the attack
   * @param {string} attackType - Type of attack ('punch', 'kick', 'special')
   * @param {Function} onDamage - Callback to apply damage (defender, actualDamage)
   */
  async executeAttack(
    attacker,
    attackAnimation,
    damage,
    attackType = 'punch',
    onDamage
  ) {
    const isBoss = attacker === 'boss';
    const defender = isBoss ? 'remy' : 'boss';
    const attackerActions = isBoss
      ? this.characterManager.actions.boss
      : this.characterManager.actions.remy;
    const defenderActions = isBoss
      ? this.characterManager.actions.remy
      : this.characterManager.actions.boss;
    const defenderIsBlocking = this.characterManager.blocking[defender];

    // --- FIX: Prevent overlapping attacks ---
    if (this.characterManager.attacking[attacker]) {
      console.warn(`${attacker} is already attacking.`);
      return;
    }
    this.characterManager.attacking[attacker] = true;
    // --- END FIX ---

    const attackerName = isBoss ? 'Brad' : 'Remy';
    const defenderName = isBoss ? 'Remy' : 'Brad';

    try {
      // 1. Play attack sound
      if (attackType === 'punch') this.soundManager.playSound('punch.mp3');
      else if (attackType === 'kick') this.soundManager.playSound('kick.mp3');
      else if (attackType === 'special')
        this.soundManager.playSound('special.mp3');

      // 2. Move attacker forward
      await this.moveTowardsOpponent(attacker, attackType);

      // 3. Play attack animation (via CharacterManager for blending)
      // Note: playAnimation handles stopping previous actions internally
      this.characterManager.playAnimation(
        attacker,
        attackAnimation,
        false,
        0.1
      ); // Short fade for snappiness

      // 4. Calculate damage and apply it at midpoint
      const actualDamage = defenderIsBlocking
        ? Math.floor(damage * 0.3)
        : damage;
      const action = attackerActions[attackAnimation];
      if (action) {
        const damageTime = action.getClip().duration * 0.5;
        setTimeout(() => {
          onDamage(defender, actualDamage);
          this.combatLogger.addToCombatLog(
            `${attackerName} hits ${defenderName} for ${actualDamage} damage${
              defenderIsBlocking ? ' (BLOCKED!)' : ''
            }`
          );
          if (actualDamage > 0) {
            this.showBloodEffect();
          }
        }, damageTime * 1000);
      }

      // 5. Wait for attack animation to finish
      // The CharacterManager's playAnimation handles auto-return to idle and resetting attacking state.
      // We just need to wait for the animation duration and then return the character's position.
      if (action) {
        await new Promise((resolve) =>
          setTimeout(resolve, action.getClip().duration * 1000)
        );
      }

      // 6. Return attacker to original position
      await this.returnToPosition(attacker);

      // 7. Determine and play defender's reaction animation
      let reactionAnimation = 'Receive Punch To The Face.fbx'; // Default fallback
      if (defenderIsBlocking) {
        // If blocking, play a block reaction (can be the same block animation or a specific one)
        // We'll use the dedicated block animation for variety if available, otherwise the idle one is fine.
        // The block state itself is handled by the toggleBlock function.
        // For hit reactions during block, we can still play a short "blocked hit" reaction.
        // Let's use a dedicated light hit for blocked attacks if available.
        reactionAnimation = 'Light Hit To Head.fbx'; // Subtle reaction for blocked hit
        // Or keep it simple and just rely on the block pose holding.
        // reactionAnimation = null; // If you want no reaction on block
      } else {
        // Determine reaction based on damage
        if (actualDamage >= 20) {
          reactionAnimation = 'Big Kidney Hit.fbx'; // Heavy hit
        } else if (actualDamage >= 12) {
          reactionAnimation = 'Medium Hit To Head.fbx'; // Medium hit
        } else if (actualDamage > 0) {
          reactionAnimation = 'Light Hit To Head.fbx'; // Light hit
        } else {
          reactionAnimation = null; // No damage, maybe no reaction or taunt?
        }
        // Optional: Knockdown on high damage
        // if (actualDamage >= 25) { reactionAnimation = 'Sweep Fall.fbx'; }
      }

      // Play the determined reaction animation for the defender
      if (
        reactionAnimation &&
        this.characterManager.actions[defender][reactionAnimation]
      ) {
        this.characterManager.playAnimation(
          defender,
          reactionAnimation,
          false,
          0.15
        ); // Fade in reaction
        // The CharacterManager will auto-return defender to idle after the reaction finishes.
      } else if (!defenderIsBlocking) {
        // If no specific reaction and not blocking, ensure defender is in idle state
        // This covers cases like 0 damage or missing reaction animation
        this.characterManager.crossfadeToIdle(defender, 0.2);
      }
      // If defender is blocking, their block pose should ideally hold, managed by toggleBlock.
      // The reactionAnimation for blocked hits is optional.
    } catch (error) {
      console.error('Error during executeAttack:', error);
    } finally {
      // Ensure attacking state is reset even if an error occurs
      this.characterManager.attacking[attacker] = false;
    }
  }

  /**
   * Execute a combo sequence with integrated movement and smooth transitions.
   * @param {string} attacker - 'boss' or 'remy'
   * @param {Array} comboMoves - Array of move objects { animation, damage, type }
   * @param {Function} onDamage - Callback to apply damage for each move
   */
  async executeCombo(attacker, comboMoves, onDamage) {
    const isBoss = attacker === 'boss';
    const defender = isBoss ? 'remy' : 'boss';
    const attackerName = isBoss ? 'Brad' : 'Remy';

    if (this.characterManager.attacking[attacker]) {
      console.warn(`${attacker} is already attacking.`);
      return;
    }

    this.characterManager.attacking[attacker] = true;

    this.soundManager.playSound('combo.mp3');
    this.combatLogger.addToCombatLog(
      `${attackerName} performs a combo attack!`
    );

    try {
      for (let i = 0; i < comboMoves.length; i++) {
        const move = comboMoves[i];
        const action = this.characterManager.actions[attacker][move.animation];

        if (!action) {
          console.warn(
            `Combo move animation ${move.animation} not found for ${attacker}`
          );
          continue; // Skip to next move if animation is missing
        }

        // 1. Move forward for this combo hit
        await this.moveTowardsOpponent(attacker, move.type, 0.1); // Quick movement per hit

        // 2. Play the combo move animation
        this.characterManager.playAnimation(
          attacker,
          move.animation,
          false,
          0.1
        ); // Snappy fade

        // 3. Play sound for this move
        if (move.type === 'punch') this.soundManager.playSound('punch.mp3');
        else if (move.type === 'kick') this.soundManager.playSound('kick.mp3');

        // 4. Apply damage at midpoint
        const damageTime = action.getClip().duration * 0.5;
        setTimeout(() => {
          onDamage(defender, move.damage);
          if (move.damage > 0) {
            this.showBloodEffect();
          }
        }, damageTime * 1000);

        // 5. Wait for this move's animation to finish
        await new Promise((resolve) =>
          setTimeout(resolve, action.getClip().duration * 1000)
        );

        // 6. Return to position quickly before next move (if not the last)
        if (i < comboMoves.length - 1) {
          await this.returnToPosition(attacker, 0.1); // Quick return
        }
      }
    } catch (error) {
      console.error('Error during combo execution:', error);
    } finally {
      // 7. Final return to original position after combo ends
      await this.returnToPosition(attacker);

      // 8. Reset to idle after combo is fully complete
      this.characterManager.crossfadeToIdle(attacker, 0.2); // Smooth final idle
      this.characterManager.attacking[attacker] = false;
    }
  }

  /**
   * Toggle blocking state for a character.
   * @param {string} character - 'boss' or 'remy'
   */
  toggleBlock(character) {
    const isBoss = character === 'boss';
    const characterName = isBoss ? 'Brad' : 'Remy';

    // Prevent toggling block while attacking
    if (this.characterManager.attacking[character]) {
      console.warn(`${characterName} cannot block while attacking.`);
      return;
    }

    const newState = !this.characterManager.blocking[character];
    this.characterManager.blocking[character] = newState;

    if (newState) {
      // Start blocking
      this.characterManager.block(character, true); // Use CharacterManager's block method
      this.combatLogger.addToCombatLog(`${characterName} is blocking!`);
      this.soundManager.playSound('block.mp3');
    } else {
      // Stop blocking
      this.characterManager.block(character, false); // Use CharacterManager's block method
      this.combatLogger.addToCombatLog(`${characterName} stops blocking`);
    }
  }

  /**
   * Execute a dodge action for a character.
   * @param {string} character - 'boss' or 'remy'
   */
  dodge(character) {
    const isBoss = character === 'boss';
    const characterName = isBoss ? 'Brad' : 'Remy';

    // Prevent dodging while attacking
    if (this.characterManager.attacking[character]) {
      console.warn(`${characterName} cannot dodge while attacking.`);
      return;
    }

    // Use CharacterManager's dodge method which handles animation selection and playback
    this.characterManager.dodge(character);

    this.combatLogger.addToCombatLog(`${characterName} dodges!`);
    this.soundManager.playSound('dodge.mp3');

    // The CharacterManager's dodge method handles returning to idle automatically.
  }

  /**
   * Execute a taunt action for a character.
   * @param {string} character - 'boss' or 'remy'
   */
  taunt(character) {
    const isBoss = character === 'boss';
    const characterName = isBoss ? 'Brad' : 'Remy';

    // Prevent taunting while attacking
    if (this.characterManager.attacking[character]) {
      console.warn(`${characterName} cannot taunt while attacking.`);
      return;
    }

    // Use CharacterManager's taunt method
    this.characterManager.taunt(character);

    this.combatLogger.addToCombatLog(`${characterName} taunts!`);
    this.soundManager.playSound('taunt.mp3');

    // The CharacterManager's taunt method handles returning to idle automatically.
  }

  /**
   * Execute a special move.
   * @param {string} character - 'boss' or 'remy'
   * @param {Function} onDamage - Callback to apply damage
   */
  specialMove(character, onDamage) {
    const isBoss = character === 'boss';
    const attackAnimation = isBoss ? 'Martelo 2.fbx' : 'Hurricane Kick.fbx'; // Or make dynamic
    const characterName = isBoss ? 'Brad' : 'Remy';

    this.combatLogger.addToCombatLog(`${characterName} uses a special move!`);

    // Execute the special attack using the standard attack logic
    this.executeAttack(character, attackAnimation, 25, 'special', onDamage);
  }

  /**
   * Execute a knockout/death animation for a character.
   * @param {string} character - 'boss' or 'remy'
   */
  knockout(character) {
    const isBoss = character === 'boss';
    const characterName = isBoss ? 'Brad' : 'Remy';

    // Ensure any current action stops
    this.characterManager.crossfadeToIdle(character, 0.1); // Fade out current action quickly

    // Play death animation
    // Use CharacterManager's death handling if added, or play directly
    const actions = isBoss
      ? this.characterManager.actions.boss
      : this.characterManager.actions.remy;
    const deathAction =
      actions['Death From Right.fbx'] ||
      actions['Defeated.fbx'] ||
      actions['Knocked Out.fbx'];

    if (deathAction) {
      this.characterManager.playAnimation(
        character,
        deathAction.getClip().name,
        false,
        0.2
      ); // Play once, fade in
    } else {
      console.warn(`No death animation found for ${character}`);
      // Fallback: just stop animations and leave in T-pose or last frame if clamped
      // The playAnimation with clampWhenFinished should handle this.
    }

    this.soundManager.playSound('victory.mp3');
    this.combatLogger.addToCombatLog(`${characterName} is knocked out!`);

    // Attacking/blocking states should be managed by the game logic after KO
  }

  /**
   * Show a blood flash effect on screen.
   */
  showBloodEffect() {
    const bloodOverlay = document.querySelector('.blood-overlay');
    if (bloodOverlay) {
      bloodOverlay.classList.remove('blood-flash');
      // Trigger reflow to restart animation
      void bloodOverlay.offsetWidth;
      bloodOverlay.classList.add('blood-flash');
    }
  }
}
