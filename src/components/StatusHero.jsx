import React from 'react';
import { CheckCircle2, AlertCircle, Hand, Activity, Sparkles, Clock } from 'lucide-react';

function formatTimer(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function StatusHero({
  deviceState,
  isFaceDownOnTable,
  faceDownDuration,
  stabilityScore,
}) {
  const configs = {
    FACE_DOWN_TABLE: {
      badgeClass: 'status-glow-facedown',
      badgeBorder: '#10b981',
      tagColor: '#34d399',
      tagBg: 'rgba(16, 185, 129, 0.18)',
      tagText: 'DÉTECTION VALIDÉE',
      title: 'Posé Face Contre Table',
      description: 'Le smartphone est posé à plat, écran orienté vers la table et stable.',
      icon: <CheckCircle2 size={32} color="#10b981" />,
    },
    FACE_UP_TABLE: {
      badgeClass: 'status-glow-faceup',
      badgeBorder: '#6366f1',
      tagColor: '#818cf8',
      tagBg: 'rgba(99, 102, 241, 0.18)',
      tagText: 'FACE VERS LE HAUT',
      title: 'Posé Écran vers le Ciel',
      description: 'L\'appareil est à plat sur la table, écran visible vers le haut.',
      icon: <CheckCircle2 size={32} color="#818cf8" />,
    },
    IN_HAND: {
      badgeClass: 'status-glow-inhand',
      badgeBorder: '#f59e0b',
      tagColor: '#fbbf24',
      tagBg: 'rgba(245, 158, 11, 0.18)',
      tagText: 'EN SUSPENSION',
      title: 'Tenu en Main / Incliné',
      description: 'L\'appareil n\'est pas posé face à plat sur une table.',
      icon: <Hand size={32} color="#fbbf24" />,
    },
    MOVING: {
      badgeClass: 'status-glow-moving',
      badgeBorder: '#f43f5e',
      tagColor: '#fb7185',
      tagBg: 'rgba(244, 63, 94, 0.18)',
      tagText: 'AGITATION DÉTECTÉE',
      title: 'En Mouvement / Secousses',
      description: 'Stabilisez le téléphone sur une surface fixe pour valider la pose.',
      icon: <Activity size={32} color="#fb7185" />,
    },
  };

  const current = configs[deviceState] || configs.IN_HAND;

  return (
    <div
      className={`glass-panel ${current.badgeClass}`}
      style={{
        padding: '24px 20px',
        margin: '0 16px',
        borderRadius: '24px',
        border: `1.5px solid ${current.badgeBorder}`,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: current.badgeBorder,
          opacity: 0.15,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Tag & Stability */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: current.tagBg,
          color: current.tagColor,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}>
          {isFaceDownOnTable && <Sparkles size={12} />}
          <span>{current.tagText}</span>
        </div>

        {/* Live Stillness Index */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Stabilité table :</span>
          <span className="font-mono-num" style={{
            fontWeight: 700,
            color: stabilityScore > 80 ? '#34d399' : stabilityScore > 50 ? '#fbbf24' : '#fb7185',
          }}>
            {stabilityScore}%
          </span>
        </div>
      </div>

      {/* Title & Icon Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {current.icon}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {current.title}
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginTop: '6px',
            lineHeight: 1.4,
          }}>
            {current.description}
          </p>
        </div>
      </div>

      {/* If face-down, active focus timer banner */}
      {isFaceDownOnTable && (
        <div style={{
          marginTop: '18px',
          padding: '12px 16px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontSize: '0.85rem' }}>
            <Clock size={16} />
            <span style={{ fontWeight: 600 }}>Temps de concentration</span>
          </div>
          <div className="font-mono-num" style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.05em',
          }}>
            {formatTimer(faceDownDuration)}
          </div>
        </div>
      )}
    </div>
  );
}
