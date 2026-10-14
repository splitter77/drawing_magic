import React from 'react';
import { Compass, Gauge, Activity, Radio } from 'lucide-react';

export default function TelemetryHUD({ orientation, motion, hasRealSensors, isSimulated }) {
  const { beta, gamma, alpha } = orientation;
  const { accelWithGravity, accelPure, stabilityScore } = motion;

  // Normalized progress indicators (0 to 100%)
  // For Beta: target is 180 (or -180) for face down
  const betaDistance = Math.min(Math.abs(180 - Math.abs(beta)), Math.abs(beta));
  const isBetaFaceDown = Math.abs(beta) >= 150;

  // For Gamma: target is 0 for horizontal flat
  const isGammaFlat = Math.abs(gamma) <= 25;

  // For Z gravity: target is -9.8 m/s² for face down
  const isZNegative = accelWithGravity.z <= -7.0;

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '16px', borderRadius: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="#38bdf8" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Télémétrie des Capteurs
          </h3>
        </div>

        <span style={{
          fontSize: '0.7rem',
          padding: '3px 8px',
          borderRadius: '6px',
          background: isSimulated ? 'rgba(245, 158, 11, 0.15)' : hasRealSensors ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
          color: isSimulated ? '#fbbf24' : hasRealSensors ? '#34d399' : '#94a3b8',
          border: '1px solid currentColor',
          fontWeight: 600,
        }}>
          {isSimulated ? 'Mode Simulateur' : hasRealSensors ? 'Capteurs Matériels Actifs' : 'En attente de mouvement'}
        </span>
      </div>

      {/* Grid of Telemetry metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
      }}>
        {/* Metric 1: Beta (Inclinaison Avant/Arrière) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inclinaison (Beta)</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isBetaFaceDown ? '#10b981' : '#64748b',
              boxShadow: isBetaFaceDown ? '0 0 8px #10b981' : 'none',
            }} />
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '6px', color: '#ffffff' }}>
            {beta}°
          </div>
          <div style={{ fontSize: '0.68rem', color: isBetaFaceDown ? '#34d399' : 'var(--text-dim)', marginTop: '4px' }}>
            {isBetaFaceDown ? '✓ Angle Face en bas' : 'Cible: ±180°'}
          </div>
        </div>

        {/* Metric 2: Gamma (Roulis Gauche/Droite) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Roulis (Gamma)</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isGammaFlat ? '#10b981' : '#64748b',
              boxShadow: isGammaFlat ? '0 0 8px #10b981' : 'none',
            }} />
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '6px', color: '#ffffff' }}>
            {gamma}°
          </div>
          <div style={{ fontSize: '0.68rem', color: isGammaFlat ? '#34d399' : 'var(--text-dim)', marginTop: '4px' }}>
            {isGammaFlat ? '✓ Horizontal à plat' : 'Cible: ~0°'}
          </div>
        </div>

        {/* Metric 3: Axe Z Gravity */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gravité Z</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isZNegative ? '#10b981' : '#6366f1',
              boxShadow: isZNegative ? '0 0 8px #10b981' : '0 0 8px #6366f1',
            }} />
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '6px', color: '#ffffff' }}>
            {accelWithGravity.z} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-dim)' }}>m/s²</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: isZNegative ? '#34d399' : 'var(--text-dim)', marginTop: '4px' }}>
            {isZNegative ? '✓ Vecteur vers la table' : 'Écran vers le haut: +9.8'}
          </div>
        </div>

        {/* Metric 4: Stabilité Immobilité */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Immobilité</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: stabilityScore > 80 ? '#10b981' : '#f59e0b',
              boxShadow: stabilityScore > 80 ? '0 0 8px #10b981' : 'none',
            }} />
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '6px', color: '#ffffff' }}>
            {stabilityScore}%
          </div>
          <div style={{ fontSize: '0.68rem', color: stabilityScore > 80 ? '#34d399' : 'var(--text-dim)', marginTop: '4px' }}>
            {stabilityScore > 80 ? '✓ Surface immobile' : 'Mouvements détectés'}
          </div>
        </div>
      </div>
    </div>
  );
}
