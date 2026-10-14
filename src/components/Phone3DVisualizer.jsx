import React from 'react';
import { Smartphone, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Phone3DVisualizer({
  orientation,
  isFaceDownOnTable,
  deviceState,
  onFlipToggle,
}) {
  const { beta, gamma, alpha } = orientation;

  // Compute CSS 3D transformation
  // Limit extreme jumps for smooth visual rendering
  let rotX = beta;
  let rotY = -gamma;

  // When face down on table, lock to perfect flat orientation against table
  const isLyingFlat = deviceState === 'FACE_DOWN_TABLE';
  const translateY = isLyingFlat ? 32 : -10;
  const shadowScale = isLyingFlat ? 1.25 : 0.85;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
      padding: '10px 0 20px',
    }}>
      <div className="scene-3d" onClick={onFlipToggle} style={{ cursor: 'pointer' }} title="Cliquez pour simuler le retournement">
        {/* Contact ripples when face down on table */}
        {isFaceDownOnTable && (
          <>
            <div className="ripple-effect" style={{ animationDelay: '0s' }} />
            <div className="ripple-effect" style={{ animationDelay: '0.6s' }} />
          </>
        )}

        {/* Table Surface / Base Contact Shadow */}
        <div className={`table-surface ${isFaceDownOnTable ? 'active-contact' : ''}`} style={{
          transform: `rotateX(65deg) scale(${shadowScale})`,
        }} />

        {/* 3D Phone Chassis */}
        <div
          className="phone-object"
          style={{
            transform: `translateY(${translateY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(0deg)`,
          }}
        >
          {/* Front Face: Screen side */}
          <div className="phone-face phone-front">
            {/* Dynamic Island / Speaker notch */}
            <div style={{
              width: '50px',
              height: '14px',
              background: '#000000',
              borderRadius: '20px',
              margin: '8px auto 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 2px rgba(255,255,255,0.2)',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1e293b' }} />
            </div>

            {/* Simulated Screen Content */}
            <div style={{
              flex: 1,
              padding: '12px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: 'linear-gradient(180deg, #090d1a 0%, #030712 100%)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              }}>
                <Smartphone size={20} color="#818cf8" />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
                Écran Face Avant
              </span>
              <span style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '4px' }}>
                {Math.round(beta)}° / {Math.round(gamma)}°
              </span>
            </div>

            {/* Bottom home indicator line */}
            <div style={{
              width: '44px',
              height: '3px',
              background: '#475569',
              borderRadius: '3px',
              margin: '0 auto 6px',
            }} />
          </div>

          {/* Back Face: Camera lenses & frosted glass (Visible when face down!) */}
          <div className="phone-face phone-back">
            {/* Triple Camera Island */}
            <div className="camera-bump">
              <div className="camera-lens" />
              <div className="camera-lens-sm" />
              <div className="camera-lens" />
              <div className="camera-flash" />
            </div>

            {/* Matte Back finish logo */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isFaceDownOnTable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isFaceDownOnTable ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}>
                {isFaceDownOnTable ? (
                  <CheckCircle2 size={22} color="#10b981" />
                ) : (
                  <Smartphone size={20} color="#94a3b8" />
                )}
              </div>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: isFaceDownOnTable ? '#34d399' : '#64748b',
                marginTop: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {isFaceDownOnTable ? 'Face en bas' : 'Dos du téléphone'}
              </span>
            </div>
          </div>

          {/* Left Frame Side */}
          <div className="phone-side-left" />
          {/* Right Frame Side */}
          <div className="phone-side-right" />
        </div>
      </div>

      <p style={{
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        marginTop: '-5px',
        textAlign: 'center',
        userSelect: 'none',
      }}>
        {isFaceDownOnTable
          ? '✨ Posé sur la surface • Écran contre table'
          : '💡 Déplacez ou retournez votre smartphone, ou touchez pour simuler'}
      </p>
    </div>
  );
}
