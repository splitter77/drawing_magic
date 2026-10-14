import React, { useState, useEffect } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import InnocentToolbar from './components/InnocentToolbar';
import SecretAdminModal from './components/SecretAdminModal';
import { useDeviceOrientation } from './hooks/useDeviceOrientation';
import { useMagicTrick, TRICK_STAGES } from './hooks/useMagicTrick';
import { Sliders, Smartphone, Check, Zap, Eye, RotateCcw } from 'lucide-react';

export default function App() {
  // Drawing Canvas Tools State
  const [strokeColor, setStrokeColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(3.5);
  const [isEraser, setIsEraser] = useState(false);
  const [paperTheme, setPaperTheme] = useState('light'); // 'light' sketchbook | 'dark' studio

  // Secret Magician Modal State
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [showPracticeBar, setShowPracticeBar] = useState(false); // Practice toolbar at bottom

  // Physical sensors hook
  const {
    orientation,
    motion,
    deviceState,
    isFaceDownOnTable,
    permissionState,
    requestPermission,
    hasRealSensors,
    isSimulated,
    setIsSimulated,
    setSimulatedPreset,
    updateCustomAngle,
  } = useDeviceOrientation();

  // Magic trick state machine hook
  const {
    trickStage,
    isArmed,
    setIsArmed,
    spectatorDrawing,
    secretDrawing,
    setSecretDrawing,
    selectedPreset,
    applyPresetSecret,
    resetTrick,
    manualTriggerFlip1,
    manualTriggerFlip2,
    registerCanvasCallbacks,
    stealthHaptic,
    setStealthHaptic,
  } = useMagicTrick({ isFaceDownOnTable });

  // Auto request sensor permission on first user tap (especially for iOS)
  useEffect(() => {
    const handleFirstTouch = () => {
      if (permissionState === 'prompt') {
        requestPermission();
      }
    };
    window.addEventListener('pointerdown', handleFirstTouch, { once: true });
    return () => window.removeEventListener('pointerdown', handleFirstTouch);
  }, [permissionState, requestPermission]);

  // Keyboard shortcut: Press 'M' to open Magician Modal on desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'm' || e.key === 'M') {
        setIsSecretModalOpen((prev) => !prev);
      }
      if (e.key === 'p' || e.key === 'P') {
        setShowPracticeBar((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: paperTheme === 'light' ? '#f5f5f4' : '#07090e',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* 1. Innocent Sketchpad Toolbar (with secret triggers disguised) */}
      <InnocentToolbar
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        paperTheme={paperTheme}
        setPaperTheme={setPaperTheme}
        onOpenSecretModal={() => setIsSecretModalOpen(true)}
        trickStage={trickStage}
      />

      {/* 2. Main Full-Screen Drawing Canvas */}
      <div style={{
        flex: 1,
        padding: '0 12px 12px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: 0,
      }}>
        <DrawingCanvas
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          isEraser={isEraser}
          paperTheme={paperTheme}
          registerCanvasCallbacks={registerCanvasCallbacks}
        />
      </div>

      {/* 3. Collapsible Practice & Simulation Bar (for practicing before show) */}
      {showPracticeBar && (
        <div style={{
          background: 'rgba(13, 19, 34, 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          fontSize: '0.72rem',
          color: '#f8fafc',
          zIndex: 40,
        }}>
          {/* Status info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: trickStage === TRICK_STAGES.SECRET_ACTIVE ? '#10b981' : '#38bdf8',
            }} />
            <span style={{ fontWeight: 700 }}>
              {trickStage === TRICK_STAGES.SPECTATOR && 'Spectateurs'}
              {trickStage === TRICK_STAGES.SECRET_ACTIVE && '✨ Prédiction secrète'}
              {trickStage === TRICK_STAGES.RESTORED && '🔄 Original restauré'}
            </span>
            <span style={{ color: '#94a3b8' }}>
              (Beta: {orientation.beta}°, Table: {isFaceDownOnTable ? 'OUI' : 'NON'})
            </span>
          </div>

          {/* Quick test triggers */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={manualTriggerFlip1}
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid #10b981',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              Pose 1 (Secret)
            </button>
            <button
              onClick={manualTriggerFlip2}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                border: '1px solid #38bdf8',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              Pose 2 (Restaurer)
            </button>
            <button
              onClick={resetTrick}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '0.7rem',
              }}
            >
              Reset
            </button>
            <button
              onClick={() => setShowPracticeBar(false)}
              style={{
                background: 'none',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Secret Magician Setup & Rehearsal Modal */}
      <SecretAdminModal
        isOpen={isSecretModalOpen}
        onClose={() => setIsSecretModalOpen(false)}
        trickStage={trickStage}
        isArmed={isArmed}
        setIsArmed={setIsArmed}
        selectedPreset={selectedPreset}
        applyPresetSecret={applyPresetSecret}
        secretDrawing={secretDrawing}
        setSecretDrawing={setSecretDrawing}
        spectatorDrawing={spectatorDrawing}
        resetTrick={resetTrick}
        manualTriggerFlip1={manualTriggerFlip1}
        manualTriggerFlip2={manualTriggerFlip2}
        orientation={orientation}
        isFaceDownOnTable={isFaceDownOnTable}
        stealthHaptic={stealthHaptic}
        setStealthHaptic={setStealthHaptic}
        hasRealSensors={hasRealSensors}
        permissionState={permissionState}
        requestPermission={requestPermission}
      />
    </div>
  );
}
