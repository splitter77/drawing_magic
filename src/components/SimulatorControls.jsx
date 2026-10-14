import React, { useState } from 'react';
import { Sliders, RefreshCw, ArrowDown, ArrowUp, Hand, Waves, Check } from 'lucide-react';

export default function SimulatorControls({
  isSimulated,
  setIsSimulated,
  setSimulatedPreset,
  updateCustomAngle,
  orientation,
  hasRealSensors,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '0 16px 16px', borderRadius: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
      onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Simulateur & Tests de Détection
          </h3>
          {isSimulated && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}>
              SIMULÉ
            </span>
          )}
        </div>

        <button
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? 'Masquer' : 'Ouvrir les contrôles'}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Testez instantanément chaque état sans bouger votre appareil :
          </p>

          {/* Quick preset action buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '8px',
            marginBottom: '16px',
          }}>
            <button
              onClick={() => setSimulatedPreset('face_down')}
              className="btn-secondary"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              <ArrowDown size={16} />
              <span>Face en bas</span>
            </button>

            <button
              onClick={() => setSimulatedPreset('face_up')}
              className="btn-secondary"
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontWeight: 600,
              }}
            >
              <ArrowUp size={16} />
              <span>Face en haut</span>
            </button>

            <button
              onClick={() => setSimulatedPreset('in_hand')}
              className="btn-secondary"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                color: '#fcd34d',
                fontWeight: 600,
              }}
            >
              <Hand size={16} />
              <span>En main (45°)</span>
            </button>

            <button
              onClick={() => setSimulatedPreset('moving')}
              className="btn-secondary"
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
                fontWeight: 600,
              }}
            >
              <Waves size={16} />
              <span>Secousses</span>
            </button>
          </div>

          {/* Manual Fine-tuning Sliders */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Angle Avant/Arrière (Beta)</span>
                <span className="font-mono-num" style={{ color: '#ffffff', fontWeight: 600 }}>{orientation.beta}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={orientation.beta}
                onChange={(e) => updateCustomAngle(Number(e.target.value), orientation.gamma)}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Angle Gauche/Droite (Gamma)</span>
                <span className="font-mono-num" style={{ color: '#ffffff', fontWeight: 600 }}>{orientation.gamma}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                value={orientation.gamma}
                onChange={(e) => updateCustomAngle(orientation.beta, Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Reset button back to real hardware */}
          {isSimulated && (
            <button
              onClick={() => setIsSimulated(false)}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px', fontSize: '0.8rem', justifyContent: 'center' }}
            >
              <RefreshCw size={14} />
              <span>Revenir aux capteurs physiques du téléphone</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
