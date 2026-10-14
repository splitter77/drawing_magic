import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Smartphone, Vibrate, VibrateOff, Maximize2, Minimize2, ShieldAlert } from 'lucide-react';

export default function Header({
  permissionState,
  requestPermission,
  soundEnabled,
  setSoundEnabled,
  hapticEnabled,
  setHapticEnabled,
  hasRealSensors,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen not available:', err);
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 10, 19, 0.75)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand logo & status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981, #0284c7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
        }}>
          <Smartphone size={22} color="#ffffff" style={{ transform: 'rotate(180deg)' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              TableFlip
            </h1>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              PWA
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1px' }}>
            Détecteur face contre table
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* iOS / Browser permission request button if needed */}
        {permissionState === 'prompt' && (
          <button
            onClick={requestPermission}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '10px' }}
          >
            <ShieldAlert size={16} />
            <span>Activer Capteurs</span>
          </button>
        )}

        {/* Audio feedback toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`btn-icon ${soundEnabled ? 'active' : ''}`}
          title={soundEnabled ? 'Son activé (bip lors de la pose)' : 'Son désactivé'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Haptic feedback toggle */}
        <button
          onClick={() => setHapticEnabled(!hapticEnabled)}
          className={`btn-icon ${hapticEnabled ? 'active' : ''}`}
          title={hapticEnabled ? 'Vibrations haptiques activées' : 'Vibrations désactivées'}
          aria-label="Toggle Haptics"
        >
          {hapticEnabled ? <Vibrate size={18} /> : <VibrateOff size={18} />}
        </button>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="btn-icon"
          title="Plein écran"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </header>
  );
}
