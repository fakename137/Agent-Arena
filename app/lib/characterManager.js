import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export class CharacterManager {
  constructor() {
    // Character references
    this.boss = null;
    this.remy = null;

    // Animation mixers
    this.mixerBoss = null;
    this.mixerRemy = null;

    // Animation actions
    this.actions = { boss: {}, remy: {} };

    // Current playing actions
    this.currentActions = { boss: null, remy: null };

    // Combat state (used by CombatSystem)
    this.attacking = { boss: false, remy: false };
    this.blocking = { boss: false, remy: false };

    // Loader
    this.loader = new FBXLoader();

    // 🎯 30 carefully selected animations (from ANIMATION_ANALYSIS.md)
    this.animationFiles = [
      // 🧍 Idle & Warmup (4)
      'Bouncing Fight Idle.fbx',
      'Fight Idle.fbx',
      'Warming Up.fbx',
      'Action Idle To Fight Idle.fbx',

      // 💪 Punches (6)
      'Punching.fbx',
      'Hook Punch.fbx',
      'Fist Fight A.fbx',
      'Cross Punch.fbx',
      'Elbow Punch.fbx',
      'Headbutt.fbx',

      // 🔗 Combos (5)
      'Jab Cross.fbx',
      'Jab To Elbow Punch.fbx',
      'Punch To Elbow Combo.fbx',
      'Elbow Uppercut Combo.fbx',
      'Quad Punch.fbx',

      // 🦵 Kicks (6)
      'Roundhouse Kick.fbx',
      'Knee Kick Lead.fbx',
      'Hurricane Kick.fbx',
      'Mma Kick.fbx',
      'Leg Sweep.fbx',
      'Chapa-Giratoria.fbx',

      // 🛡️ Dodge & Block (5)
      'Au To Role.fbx',
      'Esquiva 2.fbx',
      'Dodging.fbx',
      'Body Block.fbx',
      'Outward Block.fbx',

      // 😎 Taunt & Special (4)
      'Taunt.fbx',
      'Standing Taunt Battlecry.fbx',
      'Martelo 2.fbx',
      'Surprise Uppercut.fbx',
    ];
  }

  /**
   * Load both characters and their animations
   */
  loadCharacters(scene, onProgress = () => {}, onComplete = () => {}) {
    const loadingStatus = {
      boss: { loaded: 0, total: this.animationFiles.length + 1 },
      remy: { loaded: 0, total: this.animationFiles.length + 1 },
    };

    const checkCompletion = () => {
      if (
        this.boss &&
        this.remy &&
        loadingStatus.boss.loaded >= loadingStatus.boss.total &&
        loadingStatus.remy.loaded >= loadingStatus.remy.total
      ) {
        console.log('✅ Characters and 30 animations loaded successfully!');
        onComplete();
      }
    };

    const onAnimLoad = (character) => {
      loadingStatus[character].loaded++;
      onProgress(
        character,
        loadingStatus[character].loaded,
        loadingStatus[character].total
      );
      checkCompletion();
    };

    const onAnimError = (character, file, error) => {
      console.warn(
        `⚠️ Failed to load animation: ${file} for ${character}`,
        error
      );
      loadingStatus[character].loaded++;
      onProgress(
        character,
        loadingStatus[character].loaded,
        loadingStatus[character].total
      );
      checkCompletion();
    };

    // Load The Boss (Brad)
    this.loader.load(
      '/characters/The Boss.fbx',
      (object) => {
        object.scale.set(0.02, 0.02, 0.02);
        object.position.set(-0.5, -2, 0);
        object.rotation.y = Math.PI / 2;

        // ✅ Ensure all meshes are visible (prevent disappearing)
        object.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(object);
        this.boss = object;
        this.mixerBoss = new THREE.AnimationMixer(object);

        this.loadAnimations('boss', onAnimLoad, onAnimError);
        loadingStatus.boss.loaded++;
        checkCompletion();
      },
      undefined,
      (error) => {
        console.error('❌ Failed to load Brad:', error);
        if (this.remy) onComplete();
      }
    );

    // Load Remy
    this.loader.load(
      '/characters/Remy.fbx',
      (object) => {
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(2.5, 0, 0);
        object.rotation.y = -Math.PI / 2;

        // ✅ Same visibility fix for Remy
        object.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(object);
        this.remy = object;
        this.mixerRemy = new THREE.AnimationMixer(object);

        this.loadAnimations('remy', onAnimLoad, onAnimError);
        loadingStatus.remy.loaded++;
        checkCompletion();
      },
      undefined,
      (error) => {
        console.error('❌ Failed to load Remy:', error);
        if (this.boss) onComplete();
      }
    );
  }

  /**
   * Load all animations for a character
   */
  loadAnimations(character, onLoad, onError) {
    const mixer = character === 'boss' ? this.mixerBoss : this.mixerRemy;
    const actions = this.actions[character];

    this.animationFiles.forEach((file) => {
      this.loader.load(
        `/Animations/${file}`,
        (anim) => {
          if (anim.animations.length > 0) {
            const clip = anim.animations[0];
            const action = mixer.clipAction(clip);
            actions[file] = action;

            // Auto-play idle with loop
            if (file === 'Bouncing Fight Idle.fbx') {
              action.setLoop(THREE.LoopRepeat).play();
              this.currentActions[character] = action;
            }
          }
          onLoad(character);
        },
        undefined,
        (err) => onError(character, file, err)
      );
    });
  }

  /**
   * Play animation with smooth crossfade and auto-return to idle
/**
 * Play animation with smooth crossfade and auto-return to idle
 */
  playAnimation(character, animName, loop = false, duration = 0.2) {
    const actions = this.actions[character];
    const action = actions[animName];
    const mixer = character === 'boss' ? this.mixerBoss : this.mixerRemy;

    if (!action) {
      console.warn(`[CharacterManager] Animation not found: ${animName}`);
      return;
    }

    const currentAction = this.currentActions[character];

    // Prevent redundant playback
    if (currentAction && currentAction._clip.name === animName && !loop) {
      console.warn(
        `[CharacterManager] Animation ${animName} already playing for ${character}`
      );
      return;
    }

    // Fade out current action
    if (currentAction && currentAction !== action) {
      currentAction.fadeOut(duration);
    }

    // Reset and configure new action
    action
      .reset()
      .setLoop(
        loop ? THREE.LoopRepeat : THREE.LoopOnce,
        0
      ).clampWhenFinished = true;

    action.fadeIn(duration).play();
    this.currentActions[character] = action;

    // Mark as attacking if it's a one-shot
    if (!loop) {
      this.attacking[character] = true;
    }

    // Auto-return to idle after non-looping animations
    if (!loop) {
      const clipDuration = action.getClip().duration;
      let finishedCalled = false;

      // ✅ CORRECT WAY: Listen to mixer event and filter by action
      const onFinished = (event) => {
        if (event.action !== action || finishedCalled) return;
        finishedCalled = true;

        mixer.removeEventListener('finished', onFinished);
        this.attacking[character] = false;

        // Only return to idle if this is still the current action
        if (this.currentActions[character] === action) {
          this.crossfadeToIdle(character, duration);
        }
      };

      mixer.addEventListener('finished', onFinished);

      // Safety fallback timeout
      setTimeout(() => {
        if (!finishedCalled && this.currentActions[character] === action) {
          this.attacking[character] = false;
          mixer.removeEventListener('finished', onFinished);
          this.crossfadeToIdle(character, duration);
        }
      }, (clipDuration + 0.5) * 1000);
    }

    // ✅ Fix Y position
    const charObj = character === 'boss' ? this.boss : this.remy;
    if (charObj) {
      charObj.position.y = character === 'boss' ? -2 : 0;
    }
  }

  /**
   * Smoothly crossfade back to idle
   */
  crossfadeToIdle(character, duration = 0.3) {
    const actions = this.actions[character];
    const idleAction = actions['Bouncing Fight Idle.fbx'];
    const currentAction = this.currentActions[character];

    if (!idleAction || currentAction === idleAction) return;

    if (currentAction) {
      currentAction.fadeOut(duration);
    }

    idleAction.reset().setLoop(THREE.LoopRepeat).fadeIn(duration).play();

    this.currentActions[character] = idleAction;
  }

  /**
   * Play a random idle for variety
   */
  playRandomIdle(character) {
    const idles = [
      'Bouncing Fight Idle.fbx',
      'Fight Idle.fbx',
      'Warming Up.fbx',
    ];
    const available = idles.filter((name) => this.actions[character][name]);
    const chosen = available[Math.floor(Math.random() * available.length)];
    this.playAnimation(character, chosen, true, 0.3);
  }

  /**
   * Play a random combo
   */
  playCombo(character) {
    const combos = [
      'Jab Cross.fbx',
      'Punch To Elbow Combo.fbx',
      'Elbow Uppercut Combo.fbx',
      'Quad Punch.fbx',
    ];
    const available = combos.filter((name) => this.actions[character][name]);
    const chosen = available[Math.floor(Math.random() * available.length)];
    this.playAnimation(character, chosen);
  }

  /**
   * Play taunt
   */
  taunt(character) {
    const taunts = ['Taunt.fbx', 'Standing Taunt Battlecry.fbx'];
    const available = taunts.filter((name) => this.actions[character][name]);
    const chosen = available[Math.floor(Math.random() * available.length)];
    this.playAnimation(character, chosen);
  }

  /**
   * Play dodge
   */
  dodge(character) {
    const dodges = ['Au To Role.fbx', 'Esquiva 2.fbx', 'Dodging.fbx'];
    const available = dodges.filter((name) => this.actions[character][name]);
    const chosen = available[Math.floor(Math.random() * available.length)];
    this.playAnimation(character, chosen);
  }

  /**
   * Activate or deactivate block
   */
  block(character, active = true) {
    if (active) {
      this.playAnimation(character, 'Body Block.fbx', true, 0.2);
    } else {
      this.crossfadeToIdle(character, 0.2);
    }
    this.blocking[character] = active;
  }

  /**
   * Play hit reaction based on damage level
   */
  playHitReaction(character, level = 'light') {
    let anim = null;

    switch (level) {
      case 'light':
        anim = 'Light Hit To Head.fbx';
        break;
      case 'medium':
        anim = 'Medium Hit To Head.fbx';
        break;
      case 'heavy':
        anim = 'Big Kidney Hit.fbx';
        break;
      case 'knockdown':
        anim = 'Sweep Fall.fbx';
        break;
      default:
        anim = 'Receive Punch To The Face.fbx';
    }

    if (this.actions[character][anim]) {
      this.playAnimation(character, anim);
    } else {
      this.playAnimation(character, 'Receive Punch To The Face.fbx');
    }
  }

  /**
   * Play special move
   */
  specialMove(character) {
    this.playAnimation(character, 'Martelo 2.fbx');
  }

  /**
   * Surprise attack
   */
  surpriseAttack(character) {
    this.playAnimation(character, 'Surprise Uppercut.fbx');
  }

  /**
   * Update animation mixers every frame
   */
  update(deltaTime) {
    if (this.mixerBoss) this.mixerBoss.update(deltaTime);
    if (this.mixerRemy) this.mixerRemy.update(deltaTime);
  }

  /**
   * Optional: Force Y position correction
   */
  updateCharacterPositions() {
    if (this.boss) this.boss.position.y = -2;
    if (this.remy) this.remy.position.y = 0;
  }
}
