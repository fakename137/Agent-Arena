// components/GameUI.js (or wherever your GameUI component is defined)
import React from 'react';

export function GameUI({
  bossHealth,
  remyHealth,
  combatLog,
  loading,
  progress,
  onSkipLoading,
  characterManager,
  combatSystem,
  onDamage,
  isGameOver,
  getWinner,
  onStartAutoCombat,
  onStopAutoCombat,
  isAutoCombatActive,
}) {
  const winner = getWinner();

  // Loading screen
  if (loading) {
  return (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>
          Loading Battle...
        </div>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>
          Brad: {progress.boss}% | Remy: {progress.remy}%
          </div>
          <button
            onClick={onSkipLoading}
            style={{
              padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
          Skip Loading
          </button>
        </div>
    );
  }

  return (
    <>
      {/* Health bars */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '20px',
          justifyContent: 'space-around',
          width: '50%',
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
              border: '1px solid #ff0000',
            }}
          >
            <div
              style={{
                width: `${bossHealth}%`,
                height: '100%',
                background: 'linear-gradient(to right, #cc0000, #ff0000)',
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
          maxHeight: '100px',
          overflowY: 'auto',
          padding: '5px',
          boxSizing: 'border-box',
        }}
      >
        {combatLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

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
