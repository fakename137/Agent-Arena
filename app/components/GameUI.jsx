// components/GameUI.js (or wherever your GameUI component is defined)
import React, { useState } from 'react'; // Import useState

export function GameUI({
  bossHealth,
  remyHealth,
  combatLog,
  loading,
  progress,
  onSkipLoading,
  characterManager, // Ensure this is passed correctly
  combatSystem, // Ensure this is passed correctly
  onDamage,
  isGameOver,
  getWinner,
  onStartAutoCombat,
  onStopAutoCombat,
  isAutoCombatActive,
}) {
  // State to manage the visibility of the animation lists for each character
  const [showBossAnimations, setShowBossAnimations] = useState(false);
  const [showRemyAnimations, setShowRemyAnimations] = useState(false);

  // Helper function to safely get animation groups if characterManager is loaded
  const getAnimationGroups = () => {
    // Check if characterManager has the animationGroups property
    // This assumes the enhanced CharacterManager from previous steps
    if (characterManager && characterManager.animationGroups) {
      return characterManager.animationGroups;
    }
    // Fallback if not yet loaded or different structure
    return {
      idle: ['Bouncing Fight Idle.fbx'],
      punch: ['Punching.fbx', 'Hook Punch.fbx'],
      kick: ['Roundhouse Kick.fbx'],
      combo: [],
      dodge: ['Au To Role.fbx'],
      block: ['Body Block.fbx'],
      taunt: ['Taunt.fbx'],
      death: ['Death From Right.fbx'],
      special: ['Martelo 2.fbx'],
      reaction: ['Receive Punch To The Face.fbx'],
      recovery: [],
      transition: [],
    };
  };

  const animationGroups = getAnimationGroups();

  // Helper to render buttons for a group of animations
  const renderAnimationButtons = (character, groupAnimations) => {
    // Check if actions are loaded for the character
    const actions = characterManager?.actions?.[character];
    if (!actions) return null; // Don't render if actions aren't loaded yet

    return groupAnimations.map((animName) => {
      // Check if this specific animation is loaded/available
      if (!actions[animName]) return null;

      // Extract a display name (remove .fbx)
      const displayName = animName.replace('.fbx', '');

      return (
        <button
          key={`${character}-${animName}`}
          onClick={() => {
            // Use the appropriate method from CombatSystem or CharacterManager
            // For generic animations, we'll call CharacterManager directly.
            // Note: This bypasses CombatSystem's movement/logic for non-attack actions.
            // You might want more specific handlers in CombatSystem for some.
            if (
              characterManager &&
              typeof characterManager.playAnimation === 'function'
            ) {
              characterManager.playAnimation(character, animName);
            } else {
              console.warn(
                `Could not play animation ${animName} for ${character}`
              );
            }
          }}
          disabled={
            loading ||
            bossHealth <= 0 ||
            remyHealth <= 0 ||
            characterManager?.attacking?.[character]
          }
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            margin: '2px',
            backgroundColor: '#555',
            color: 'white',
            border: '1px solid #777',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title={animName} // Show full name on hover
        >
          {displayName}
        </button>
      );
    });
  };

  const winner = getWinner();
  return (
    <>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center',
            zIndex: 100,
            background: 'rgba(0,0,0,0.8)',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          <div>Loading fighters and animations...</div>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>
            {/* Updated progress display to be more generic or reflect actual loading if tracked */}
            Brad: {progress.boss?.loaded ?? progress.boss}/
            {progress.boss?.total ?? '??'} | Remy:{' '}
            {progress.remy?.loaded ?? progress.remy}/
            {progress.remy?.total ?? '??'}
          </div>
          <button
            onClick={onSkipLoading}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Skip Loading (Debug)
          </button>
        </div>
      )}
      {/* Blood overlay */}
      <div
        className="blood-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0,
          zIndex: 5,
          background:
            'radial-gradient(circle, rgba(255,0,0,0.7) 0%, rgba(255,0,0,0) 70%)',
        }}
      ></div>
      {/* Health bars */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          zIndex: 10,
        }}
      >
        <div>
          <div
            style={{ color: 'white', textAlign: 'center', marginBottom: '5px' }}
          >
            BRAD
          </div>
          <div
            style={{
              width: '200px',
              height: '20px',
              background: '#333',
              border: '1px solid #ff6b35',
            }}
          >
            <div
              style={{
                width: `${bossHealth}%`,
                height: '100%',
                background: 'linear-gradient(to right, #ff0000, #ff6b35)',
                transition: 'width 0.3s',
              }}
            ></div>
          </div>
          <div
            style={{ color: 'white', textAlign: 'center', marginTop: '5px' }}
          >
            {characterManager?.blocking?.boss ? 'BLOCKING' : ''}
          </div>
        </div>
        <div>
          <div
            style={{ color: 'white', textAlign: 'center', marginBottom: '5px' }}
          >
            REMY
          </div>
          <div
            style={{
              width: '200px',
              height: '20px',
              background: '#333',
              border: '1px solid #3399ff',
            }}
          >
            <div
              style={{
                width: `${remyHealth}%`,
                height: '100%',
                background: 'linear-gradient(to right, #0066cc, #3399ff)',
                transition: 'width 0.3s',
              }}
            ></div>
          </div>
          <div
            style={{ color: 'white', textAlign: 'center', marginTop: '5px' }}
          >
            {characterManager?.blocking?.remy ? 'BLOCKING' : ''}
          </div>
        </div>
      </div>
      {/* Combat log */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
          color: 'white',
          fontSize: '14px',
          textShadow: '1px 1px 2px black',
          maxHeight: '100px', // Limit log height
          overflowY: 'auto', // Add scrollbar if needed
          padding: '5px',
          boxSizing: 'border-box',
        }}
      >
        {combatLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      {/* Boss controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '280px', // Moved up to make space
          left: '10%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          BRAD CONTROLS
        </div>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'boss',
              'Punching.fbx',
              8,
              'punch',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Jab
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'boss',
              'Hook Punch.fbx',
              12,
              'punch',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Hook
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'boss',
              'Roundhouse Kick.fbx',
              15,
              'kick',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Kick
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'boss',
              'Fist Fight A.fbx',
              18,
              'punch',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Uppercut
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'boss',
              'Knee Kick Lead.fbx',
              14,
              'kick',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Knee Strike
        </button>
      </div>
      {/* Boss special controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '280px', // Moved up to make space
          left: '20%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          SPECIAL
        </div>
        <button
          onClick={() => combatSystem?.toggleBlock('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          {characterManager?.blocking?.boss ? 'Stop Blocking' : 'Block'}
        </button>
        <button
          onClick={() => combatSystem?.dodge('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Dodge
        </button>
        <button
          onClick={() => combatSystem?.taunt('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Taunt
        </button>
        <button
          onClick={() => combatSystem?.specialMove('boss', onDamage)}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Special Move
        </button>
      </div>
      {/* Boss combos */}
      <div
        style={{
          position: 'absolute',
          bottom: '230px', // Moved up to make space
          left: '15%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column', // Stack label and buttons
          gap: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          COMBOS
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {' '}
          {/* Buttons container */}
          <button
            onClick={() =>
              combatSystem?.executeCombo(
                'boss',
                [
                  { animation: 'Punching.fbx', damage: 8, type: 'punch' },
                  { animation: 'Hook Punch.fbx', damage: 10, type: 'punch' },
                  { animation: 'Fist Fight A.fbx', damage: 15, type: 'punch' },
                ],
                onDamage
              )
            }
            disabled={loading || bossHealth <= 0 || remyHealth <= 0}
            style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
          >
            Devastator
          </button>
          <button
            onClick={() =>
              combatSystem?.executeCombo(
                'boss',
                [
                  {
                    animation: 'Roundhouse Kick.fbx',
                    damage: 12,
                    type: 'kick',
                  },
                  { animation: 'Knee Kick Lead.fbx', damage: 10, type: 'kick' },
                  { animation: 'Hurricane Kick.fbx', damage: 20, type: 'kick' },
                ],
                onDamage
              )
            }
            disabled={loading || bossHealth <= 0 || remyHealth <= 0}
            style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
          >
            Whirlwind
          </button>
        </div>
      </div>
      {/* --- New Boss Animation UI Section --- */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px', // Positioned below combos
          left: '10%',
          zIndex: 10,
          width: '250px',
          backgroundColor: 'rgba(40, 40, 40, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
        }}
      >
        <button
          onClick={() => setShowBossAnimations(!showBossAnimations)}
          style={{
            width: '100%',
            background: '#444',
            color: 'white',
            border: 'none',
            padding: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
            fontWeight: 'bold',
          }}
        >
          {showBossAnimations ? '▼ Brad Animations' : '▶ Brad Animations'}
        </button>

        {showBossAnimations && (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {Object.entries(animationGroups).map(([group, animations]) => {
              const buttons = renderAnimationButtons('boss', animations);
              // Only render the group if it has loaded animations
              if (!buttons || buttons.filter((b) => b !== null).length === 0)
                return null;
              return (
                <div key={`boss-${group}`} style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      marginBottom: '3px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {group}:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {buttons}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* --- End New Boss Animation UI Section --- */}
      {/* Remy controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '280px', // Moved up to make space
          right: '20%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          REMY CONTROLS
        </div>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'remy',
              'Punching.fbx',
              8,
              'punch',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Jab
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'remy',
              'Hook Punch.fbx',
              12,
              'punch',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Hook
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'remy',
              'Roundhouse Kick.fbx',
              15,
              'kick',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Kick
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'remy',
              'Fist Fight A.fbx',
              18,
              'punch',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Uppercut
        </button>
        <button
          onClick={() =>
            combatSystem?.executeAttack(
              'remy',
              'Knee Kick Lead.fbx',
              14,
              'kick',
              onDamage
            )
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Knee Strike
        </button>
      </div>
      {/* Remy special controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '280px', // Moved up to make space
          right: '10%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          SPECIAL
        </div>
        <button
          onClick={() => combatSystem?.toggleBlock('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          {characterManager?.blocking?.remy ? 'Stop Blocking' : 'Block'}
        </button>
        <button
          onClick={() => combatSystem?.dodge('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Dodge
        </button>
        <button
          onClick={() => combatSystem?.taunt('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Taunt
        </button>
        <button
          onClick={() => combatSystem?.specialMove('remy', onDamage)}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Special Move
        </button>
      </div>
      {/* Remy combos */}
      <div
        style={{
          position: 'absolute',
          bottom: '230px', // Moved up to make space
          right: '15%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column', // Stack label and buttons
          gap: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          COMBOS
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {' '}
          {/* Buttons container */}
          <button
            onClick={() =>
              combatSystem?.executeCombo(
                'remy',
                [
                  { animation: 'Punching.fbx', damage: 8, type: 'punch' },
                  { animation: 'Hook Punch.fbx', damage: 10, type: 'punch' },
                  { animation: 'Fist Fight A.fbx', damage: 15, type: 'punch' },
                ],
                onDamage
              )
            }
            disabled={loading || bossHealth <= 0 || remyHealth <= 0}
            style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
          >
            Devastator
          </button>
          <button
            onClick={() =>
              combatSystem?.executeCombo(
                'remy',
                [
                  {
                    animation: 'Roundhouse Kick.fbx',
                    damage: 12,
                    type: 'kick',
                  },
                  { animation: 'Knee Kick Lead.fbx', damage: 10, type: 'kick' },
                  { animation: 'Hurricane Kick.fbx', damage: 20, type: 'kick' },
                ],
                onDamage
              )
            }
            disabled={loading || bossHealth <= 0 || remyHealth <= 0}
            style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
          >
            Whirlwind
          </button>
        </div>
      </div>
      {/* --- New Remy Animation UI Section --- */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px', // Positioned below combos
          right: '10%',
          zIndex: 10,
          width: '250px',
          backgroundColor: 'rgba(40, 40, 40, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
        }}
      >
        <button
          onClick={() => setShowRemyAnimations(!showRemyAnimations)}
          style={{
            width: '100%',
            background: '#444',
            color: 'white',
            border: 'none',
            padding: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
            fontWeight: 'bold',
          }}
        >
          {showRemyAnimations ? '▼ Remy Animations' : '▶ Remy Animations'}
        </button>

        {showRemyAnimations && (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {Object.entries(animationGroups).map(([group, animations]) => {
              const buttons = renderAnimationButtons('remy', animations);
              // Only render the group if it has loaded animations
              if (!buttons || buttons.filter((b) => b !== null).length === 0)
                return null;
              return (
                <div key={`remy-${group}`} style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      marginBottom: '3px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {group}:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {buttons}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: '250px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={onStartAutoCombat}
          disabled={loading || isGameOver() || isAutoCombatActive} // Disable if loading, game over, or already active
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          Start Auto Combat
        </button>
        <button
          onClick={onStopAutoCombat}
          disabled={!isAutoCombatActive} // Disable if not active
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          Stop Auto Combat
        </button>
      </div>
      {/* --- End New Remy Animation UI Section --- */}
      {/* Winner announcement */}
      {isGameOver() && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '0 0 10px black',
            zIndex: 20,
            background: 'rgba(0,0,0,0.7)',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          {winner === 'remy' ? 'REMY WINS!' : 'BRAD WINS!'}
        </div>
      )}
    </>
  );
}
