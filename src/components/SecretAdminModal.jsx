import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  Sliders,
  Smartphone,
  Vibrate,
  PenTool,
  RotateCcw,
  Zap,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { PRESETS } from '../utils/presets';
import { TRICK_STAGES } from '../hooks/useMagicTrick';

export default function SecretAdminModal({
  isOpen,
  onClose,
  trickStage,
  isArmed,
  setIsArmed,
  selectedPreset,
  applyPresetSecret,
  secretDrawing,
  setSecretDrawing,
  spectatorDrawing,
  resetTrick,
  manualTriggerFlip1,
  manualTriggerFlip2,
  orientation,
  isFaceDownOnTable,
  stealthHaptic,
  setStealthHaptic,
  hasRealSensors,
  permissionState,
  requestPermission,
}) {
  const [tab, setTab] = useState('presets'); // 'presets' | 'custom'
  const customCanvasRef = useRef(null);
  const [customDrawingActive, setCustomDrawingActive] = useState(false);

  // Custom canvas drawing state
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (tab === 'custom' && customCanvasRef.current) {
      const canvas = customCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0f172a';
    }
  }, [tab]);

  const handleCustomPointerDown = (e) => {
    const canvas = customCanvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleCustomPointerMove = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = customCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleCustomPointerUp = () => {
    isDrawingRef.current = false;
  };

  const saveCustomDrawingAsSecret = () => {
    const canvas = customCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setSecretDrawing(dataUrl);
    setCustomDrawingActive(true);
  };

  const clearCustomCanvas = () => {
    const canvas = customCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCustomDrawingActive(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px',
    }}>
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Panneau Secret du Magicien
              </h2>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Configuration & contrôle furtif du tour
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Diagnostic & Activation Capteurs iOS */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '16px',
            background: hasRealSensors
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(245, 158, 11, 0.14)',
            border: `1.5px solid ${hasRealSensors ? '#10b981' : '#f59e0b'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color={hasRealSensors ? '#10b981' : '#fbbf24'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  Capteurs de Mouvement (Gyroscope)
                </span>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: hasRealSensors ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                color: hasRealSensors ? '#34d399' : '#fbbf24',
              }}>
                {hasRealSensors ? 'ACTIFS ✓' : 'EN ATTENTE D\'AUTORISATION'}
              </span>
            </div>

            {!hasRealSensors && (
              <button
                onClick={async () => {
                  if (requestPermission) {
                    await requestPermission();
                  }
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                }}
              >
                <ShieldCheck size={16} />
                <span>Autoriser les capteurs (Dialogue Système Safari)</span>
              </button>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span>Angle actuel : Beta = {orientation?.beta || 0}°</span>
              <span>Face contre table : <strong style={{ color: isFaceDownOnTable ? '#34d399' : '#e2e8f0' }}>{isFaceDownOnTable ? 'OUI ✓' : 'NON'}</strong></span>
            </div>
          </div>

          {/* Current Trick Status Banner */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '16px',
            background: trickStage === TRICK_STAGES.SECRET_ACTIVE
              ? 'rgba(16, 185, 129, 0.15)'
              : trickStage === TRICK_STAGES.RESTORED
              ? 'rgba(56, 189, 248, 0.15)'
              : 'rgba(99, 102, 241, 0.12)',
            border: `1.5px solid ${
              trickStage === TRICK_STAGES.SECRET_ACTIVE
                ? '#10b981'
                : trickStage === TRICK_STAGES.RESTORED
                ? '#38bdf8'
                : '#6366f1'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                État Actuel du Tour
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '2px', color: '#ffffff' }}>
                {trickStage === TRICK_STAGES.SPECTATOR && '🟢 Dessin Spectateurs (Prêt à basculer)'}
                {trickStage === TRICK_STAGES.SECRET_ACTIVE && '✨ Prédiction Secrète Active !'}
                {trickStage === TRICK_STAGES.RESTORED && '🔄 Dessin d\'Origine Restauré (Propre)'}
              </div>
            </div>

            {/* Arm toggle */}
            <button
              onClick={() => setIsArmed(!isArmed)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: isArmed ? '#10b981' : '#334155',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isArmed ? 'ARMÉ ✓' : 'DÉSARMÉ'}
            </button>
          </div>

          {/* Quick Simulation Buttons for Rehearsal */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '14px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
              Répétition manuelle (sans poser le téléphone) :
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={manualTriggerFlip1}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                }}
              >
                <Zap size={14} />
                <span>Poser 1 : Basculer vers Secret</span>
              </button>

              <button
                onClick={manualTriggerFlip2}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                }}
              >
                <RefreshCw size={14} />
                <span>Poser 2 : Restaurer l'Original</span>
              </button>
            </div>

            <button
              onClick={resetTrick}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '8px', fontSize: '0.72rem', padding: '6px' }}
            >
              <RotateCcw size={13} />
              <span>Réinitialiser pour un nouveau spectateur</span>
            </button>
          </div>

          {/* Selection of the Secret Prediction */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Choix de la Prédiction / Dessin Forcé :
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setTab('presets')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: 'none',
                    background: tab === 'presets' ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Préréglages
                </button>
                <button
                  onClick={() => setTab('custom')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: 'none',
                    background: tab === 'custom' ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Dessin Libre
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            {tab === 'presets' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPresetSecret(p.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      background: selectedPreset === p.id && !customDrawingActive
                        ? 'rgba(56, 189, 248, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: selectedPreset === p.id && !customDrawingActive
                        ? '1.5px solid #38bdf8'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{p.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom Canvas */}
            {tab === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Dessinez votre propre prédiction (symbole, mot, dessin spécifique) :
                </p>
                <div style={{
                  background: '#fcfbf7',
                  borderRadius: '12px',
                  height: '160px',
                  position: 'relative',
                  overflow: 'hidden',
                  touchAction: 'none',
                }}>
                  <canvas
                    ref={customCanvasRef}
                    width={350}
                    height={160}
                    onPointerDown={handleCustomPointerDown}
                    onPointerMove={handleCustomPointerMove}
                    onPointerUp={handleCustomPointerUp}
                    style={{ width: '100%', height: '100%', touchAction: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={saveCustomDrawingAsSecret}
                    className="btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}
                  >
                    Enregistrer comme Prédiction
                  </button>
                  <button
                    onClick={clearCustomCanvas}
                    className="btn-secondary"
                    style={{ padding: '8px', fontSize: '0.75rem' }}
                  >
                    Effacer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Secret Preview Box */}
          {secretDrawing && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              padding: '10px 14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: '#fcfbf7',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img src={secretDrawing} alt="Secret Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#38bdf8' }}>Prédiction Préparée</div>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '2px' }}>
                  Sera injectée automatiquement dès que le téléphone est posé face en bas sur la table.
                </div>
              </div>
            </div>
          )}

          {/* Stealth Haptic Vibration Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Vibrate size={16} color="#10b981" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Vibration Furtive en Main</span>
            </div>
            <input
              type="checkbox"
              checked={stealthHaptic}
              onChange={(e) => setStealthHaptic(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* Physical Sensor Feedback */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#64748b',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '10px',
          }}>
            <span>Capteur : Beta={orientation.beta}°</span>
            <span>Sur table : {isFaceDownOnTable ? 'OUI (Face en bas)' : 'NON'}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
        }}>
          <button
            onClick={async () => {
              if (window.confirm('Vider tout le cache et forcer le rechargement de la dernière version ?')) {
                try {
                  if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map((k) => caches.delete(k)));
                  }
                  if ('serviceWorker' in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    for (const reg of regs) {
                      await reg.unregister();
                    }
                  }
                  window.location.href = window.location.origin + window.location.pathname + '?cb=' + Date.now();
                } catch {
                  window.location.reload(true);
                }
              }
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ⚡ Vider Cache & Recharger
          </button>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Fermer et Prêter le Téléphone
          </button>
        </div>
      </div>
    </div>
  );
}
