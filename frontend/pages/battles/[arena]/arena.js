import { useState, useEffect } from 'react';

export default function ArenaBattle() {
  const [bossHealth, setBossHealth] = useState(100);
  const [remyHealth, setRemyHealth] = useState(100);

  const bossPunch = () => {
    setRemyHealth((prev) => Math.max(0, prev - 10));
    showBloodEffect();
  };

  const remyPunch = () => {
    setBossHealth((prev) => Math.max(0, prev - 10));
    showBloodEffect();
  };

  const showBloodEffect = () => {
    const bloodOverlay = document.querySelector('.blood-overlay');
    if (bloodOverlay) {
      bloodOverlay.classList.remove('blood-flash');
      void bloodOverlay.offsetWidth;
      bloodOverlay.classList.add('blood-flash');
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        bossPunch();
      } else if (e.key === 's' || e.key === 'S') {
        remyPunch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="battle-container">
      {/* Blood overlay for visual effects */}
      <div className="blood-overlay"></div>

      {/* Arena environment iframe */}
      <iframe
        id="sketchfab-frame"
        src="https://sketchfab.com/models/5887de4f1cf54adeb46b2eab5b92c4a7/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=1&ui_fullscreen=1&ui_annotations=0"
        frameBorder="0"
        allowFullScreen
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        allow="autoplay; fullscreen; xr-spatial-tracking"
      ></iframe>

      {/* UI Overlay */}
      <div className="battle-title">ARENA BATTLE</div>

      <div className="health-bar-container">
        <div>
          <div className="character-name boss-name">THE BOSS</div>
          <div className="health-bar">
            <div
              className="health-fill boss-health"
              style={{ width: `${bossHealth}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="character-name remy-name">REMY</div>
          <div className="health-bar">
            <div
              className="health-fill remy-health"
              style={{ width: `${remyHealth}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button
          onClick={bossPunch}
          style={{
            marginRight: '20px',
            padding: '10px 20px',
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Boss Punch (A)
        </button>
        <button
          onClick={remyPunch}
          style={{
            padding: '10px 20px',
            background: '#3399ff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Remy Punch (S)
        </button>
      </div>
    </div>
  );
}
