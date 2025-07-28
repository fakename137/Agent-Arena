// components/BasementBattle.js
import React from 'react';
import style from '../styles/globals.css'; // Assuming you'll move styles here or use global

const BasementBattle = ({
  bossHealth,
  remyHealth,
  combatLog,
  winner,
  executeAttack,
  executeCombo,
  toggleBlock,
  dodge,
  taunt,
  specialMove,
  blocking,
  loading,
}) => {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
            {blocking.boss ? 'BLOCKING' : ''}
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
            {blocking.remy ? 'BLOCKING' : ''}
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
          bottom: '200px',
          left: '10%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          BRAD CONTROLS
        </div>
        <button
          onClick={() => executeAttack('boss', 'Punching.fbx', 8, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Jab
        </button>
        <button
          onClick={() => executeAttack('boss', 'Hook Punch.fbx', 12, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Hook
        </button>
        <button
          onClick={() =>
            executeAttack('boss', 'Roundhouse Kick.fbx', 15, 'kick')
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Kick
        </button>
        <button
          onClick={() => executeAttack('boss', 'Fist Fight A.fbx', 18, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Uppercut
        </button>
        <button
          onClick={() =>
            executeAttack('boss', 'Knee Kick Lead.fbx', 14, 'kick')
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
          bottom: '200px',
          left: '20%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          SPECIAL
        </div>
        <button
          onClick={() => toggleBlock('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          {blocking.boss ? 'Stop Blocking' : 'Block'}
        </button>
        <button
          onClick={() => dodge('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Dodge
        </button>
        <button
          onClick={() => taunt('boss')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Taunt
        </button>
        <button
          onClick={() => specialMove('boss')}
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
          bottom: '150px',
          left: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          COMBOS
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <button
          onClick={() =>
            executeCombo('boss', [
              { animation: 'Punching.fbx', damage: 8, type: 'punch' },
              { animation: 'Hook Punch.fbx', damage: 10, type: 'punch' },
              { animation: 'Fist Fight A.fbx', damage: 15, type: 'punch' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Devastator
        </button>
        <button
          onClick={() =>
            executeCombo('boss', [
              { animation: 'Roundhouse Kick.fbx', damage: 12, type: 'kick' },
              { animation: 'Knee Kick Lead.fbx', damage: 10, type: 'kick' },
              { animation: 'Hurricane Kick.fbx', damage: 20, type: 'kick' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Whirlwind
        </button>
      </div>

      {/* Remy controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '200px',
          right: '20%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          REMY CONTROLS
        </div>
        <button
          onClick={() => executeAttack('remy', 'Punching.fbx', 8, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Jab
        </button>
        <button
          onClick={() => executeAttack('remy', 'Hook Punch.fbx', 12, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Hook
        </button>
        <button
          onClick={() =>
            executeAttack('remy', 'Roundhouse Kick.fbx', 15, 'kick')
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Kick
        </button>
        <button
          onClick={() => executeAttack('remy', 'Fist Fight A.fbx', 18, 'punch')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Uppercut
        </button>
        <button
          onClick={() =>
            executeAttack('remy', 'Knee Kick Lead.fbx', 14, 'kick')
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
          bottom: '200px',
          right: '10%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          SPECIAL
        </div>
        <button
          onClick={() => toggleBlock('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          {blocking.remy ? 'Stop Blocking' : 'Block'}
        </button>
        <button
          onClick={() => dodge('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Dodge
        </button>
        <button
          onClick={() => taunt('remy')}
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Taunt
        </button>
        <button
          onClick={() => specialMove('remy')}
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
          bottom: '150px',
          right: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: '12px',
          }}
        >
          COMBOS
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          right: '15%',
          zIndex: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <button
          onClick={() =>
            executeCombo('remy', [
              { animation: 'Punching.fbx', damage: 8, type: 'punch' },
              { animation: 'Hook Punch.fbx', damage: 10, type: 'punch' },
              { animation: 'Fist Fight A.fbx', damage: 15, type: 'punch' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Devastator
        </button>
        <button
          onClick={() =>
            executeCombo('remy', [
              { animation: 'Roundhouse Kick.fbx', damage: 12, type: 'kick' },
              { animation: 'Knee Kick Lead.fbx', damage: 10, type: 'kick' },
              { animation: 'Hurricane Kick.fbx', damage: 20, type: 'kick' },
            ])
          }
          disabled={loading || bossHealth <= 0 || remyHealth <= 0}
          style={{ padding: '6px 12px', fontSize: '12px', margin: '2px' }}
        >
          Whirlwind
        </button>
      </div>

      {/* Winner announcement */}
      {winner && (
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
          {winner.toUpperCase()} WINS!
        </div>
      )}
    </div>
  );
};

export default BasementBattle;
