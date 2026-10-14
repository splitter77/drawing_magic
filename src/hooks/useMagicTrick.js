import { useState, useRef, useEffect, useCallback } from 'react';
import { drawPresetToCanvas } from '../utils/presets';

export const TRICK_STAGES = {
  SPECTATOR: 'SPECTATOR',     // Spectators drawing collectively
  SECRET_ACTIVE: 'SECRET',    // Flipped once: Secret drawing is currently visible
  RESTORED: 'RESTORED',       // Flipped twice: Original drawing is back
};

export function useMagicTrick({ isFaceDownOnTable }) {
  // Current stage of the trick
  const [trickStage, setTrickStage] = useState(TRICK_STAGES.SPECTATOR);
  const [isArmed, setIsArmed] = useState(true); // Is the magic switch active?

  // Drawing storage (DataURLs)
  const [spectatorDrawing, setSpectatorDrawing] = useState(null);
  const [secretDrawing, setSecretDrawing] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('star'); // Default prediction

  // Stealth vibration setting
  const [stealthHaptic, setStealthHaptic] = useState(true);

  // References to keep callbacks fresh
  const trickStageRef = useRef(trickStage);
  const isArmedRef = useRef(isArmed);
  const spectatorDrawingRef = useRef(spectatorDrawing);
  const secretDrawingRef = useRef(secretDrawing);
  const stealthHapticRef = useRef(stealthHaptic);

  useEffect(() => { trickStageRef.current = trickStage; }, [trickStage]);
  useEffect(() => { isArmedRef.current = isArmed; }, [isArmed]);
  useEffect(() => { spectatorDrawingRef.current = spectatorDrawing; }, [spectatorDrawing]);
  useEffect(() => { secretDrawingRef.current = secretDrawing; }, [secretDrawing]);
  useEffect(() => { stealthHapticRef.current = stealthHaptic; }, [stealthHaptic]);

  // Canvas imperative switch callback registered by DrawingCanvas
  const canvasRefCallbacks = useRef({
    getCanvasData: null,
    loadCanvasData: null,
  });

  const registerCanvasCallbacks = useCallback(({ getCanvasData, loadCanvasData }) => {
    canvasRefCallbacks.current.getCanvasData = getCanvasData;
    canvasRefCallbacks.current.loadCanvasData = loadCanvasData;
  }, []);

  // Discrete haptic pulses for magician's fingertips
  const triggerStealthHaptic = useCallback((pattern) => {
    if (stealthHapticRef.current && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if blocked
      }
    }
  }, []);

  // Main listener on isFaceDownOnTable transitions
  const prevFaceDownRef = useRef(false);

  useEffect(() => {
    // Detect positive edge: phone just landed face-down on table
    if (isFaceDownOnTable && !prevFaceDownRef.current) {
      if (!isArmedRef.current) {
        prevFaceDownRef.current = true;
        return;
      }

      const currentStage = trickStageRef.current;
      const { getCanvasData, loadCanvasData } = canvasRefCallbacks.current;

      if (currentStage === TRICK_STAGES.SPECTATOR) {
        // FLIP 1: Capture spectator drawing and SWITCH to secret drawing!
        let capturedData = null;
        if (getCanvasData) {
          capturedData = getCanvasData();
          setSpectatorDrawing(capturedData);
          spectatorDrawingRef.current = capturedData;
        }

        // Apply secret drawing
        const secret = secretDrawingRef.current;
        if (secret && loadCanvasData) {
          loadCanvasData(secret);
        }

        setTrickStage(TRICK_STAGES.SECRET_ACTIVE);
        triggerStealthHaptic(40); // 1 discrete buzz = Secret is loaded!
      } else if (currentStage === TRICK_STAGES.SECRET_ACTIVE) {
        // FLIP 2: RESTORE original spectator drawing!
        const original = spectatorDrawingRef.current;
        if (original && loadCanvasData) {
          loadCanvasData(original);
        }

        setTrickStage(TRICK_STAGES.RESTORED);
        triggerStealthHaptic([25, 45, 25]); // 2 discrete buzzes = Original restored!
      }
    }

    prevFaceDownRef.current = isFaceDownOnTable;
  }, [isFaceDownOnTable, triggerStealthHaptic]);

  // Manually generate a secret drawing from a preset
  const applyPresetSecret = useCallback((presetId, strokeColor = '#1e293b') => {
    setSelectedPreset(presetId);
    if (typeof window === 'undefined') return;

    // Render preset onto an offscreen canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 800;
    offCanvas.height = 1000;
    const ctx = offCanvas.getContext('2d');
    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);

    drawPresetToCanvas(ctx, offCanvas.width, offCanvas.height, presetId, strokeColor);
    const dataUrl = offCanvas.toDataURL();
    setSecretDrawing(dataUrl);
    secretDrawingRef.current = dataUrl;
  }, []);

  // Initialize default secret preset (Star) on mount
  useEffect(() => {
    if (!secretDrawing) {
      applyPresetSecret('star');
    }
  }, [secretDrawing, applyPresetSecret]);

  // Reset trick for a new performance
  const resetTrick = useCallback(() => {
    setTrickStage(TRICK_STAGES.SPECTATOR);
    setSpectatorDrawing(null);
    if (canvasRefCallbacks.current.loadCanvasData) {
      canvasRefCallbacks.current.loadCanvasData(null); // Clear canvas
    }
    triggerStealthHaptic(20);
  }, [triggerStealthHaptic]);

  // Manual simulation switches (for magician rehearsing on desktop)
  const manualTriggerFlip1 = useCallback(() => {
    const { getCanvasData, loadCanvasData } = canvasRefCallbacks.current;
    if (getCanvasData) {
      const captured = getCanvasData();
      setSpectatorDrawing(captured);
      spectatorDrawingRef.current = captured;
    }
    if (secretDrawingRef.current && loadCanvasData) {
      loadCanvasData(secretDrawingRef.current);
    }
    setTrickStage(TRICK_STAGES.SECRET_ACTIVE);
    triggerStealthHaptic(40);
  }, [triggerStealthHaptic]);

  const manualTriggerFlip2 = useCallback(() => {
    const { loadCanvasData } = canvasRefCallbacks.current;
    if (spectatorDrawingRef.current && loadCanvasData) {
      loadCanvasData(spectatorDrawingRef.current);
    }
    setTrickStage(TRICK_STAGES.RESTORED);
    triggerStealthHaptic([25, 45, 25]);
  }, [triggerStealthHaptic]);

  return {
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
  };
}
