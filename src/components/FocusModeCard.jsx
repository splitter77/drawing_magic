import React, { useEffect } from 'react';
import { Target, Trophy, History, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusModeCard({ flipCount, flipHistory, faceDownDuration, isFaceDownOnTable }) {
  // Total accumulated seconds across all sessions
  const totalSeconds = flipHistory.reduce((acc, curr) => acc + curr.duration, 0) + (isFaceDownOnTable ? faceDownDuration : 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  // Trigger celebration confetti when lifting after at least 15 seconds of focus
  useEffect(() => {
    if (flipHistory.length > 0 && flipHistory[0].duration >= 15 && !isFaceDownOnTable) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#38bdf8', '#6366f1'],
        });
      } catch {
        // Ignore confetti errors if canvas unavailable
      }
    }
  }, [flipHistory, isFaceDownOnTable]);

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '0 16px 20px', borderRadius: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="#10b981" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Statistiques & Mode Focus
          </h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          Session active
        </span>
      </div>

      {/* Quick metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <Trophy size={14} color="#f59e0b" />
            <span>Poses détectées</span>
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {flipCount}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <Sparkles size={14} color="#10b981" />
            <span>Temps face contre table</span>
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds % 60}s` : `${totalSeconds}s`}
          </div>
        </div>
      </div>

      {/* Recent History List */}
      {flipHistory.length > 0 ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
            <History size={13} />
            <span>Dernières poses enregistrées</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
            {flipHistory.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{item.timestamp}</span>
                <span className="font-mono-num" style={{ color: '#34d399', fontWeight: 600 }}>
                  {item.duration >= 60 ? `${Math.floor(item.duration / 60)}m ${item.duration % 60}s` : `${item.duration} sec`}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
        }}>
          Posez votre smartphone face en bas sur la table pour démarrer votre première session.
        </div>
      )}
    </div>
  );
}
