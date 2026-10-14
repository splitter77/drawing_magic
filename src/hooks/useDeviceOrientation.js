import { useState, useEffect, useRef, useCallback } from 'react';
import { playFaceDownChime, playLiftChime, triggerHaptic } from '../utils/audio';

// Helper to calculate variance of array
function getVariance(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
}

export function useDeviceOrientation() {
  // Sensor raw values
  const [orientation, setOrientation] = useState({
    alpha: 0, // Compass direction 0 - 360
    beta: 0,  // Tilt front/back -180 to 180
    gamma: 0, // Tilt left/right -90 to 90
  });

  const [motion, setMotion] = useState({
    accelWithGravity: { x: 0, y: 0, z: 9.8 },
    accelPure: { x: 0, y: 0, z: 0 },
    stabilityScore: 100, // 0 to 100%
  });

  // Detection states
  // 'FACE_DOWN_TABLE' | 'FACE_UP_TABLE' | 'IN_HAND' | 'MOVING'
  const [deviceState, setDeviceState] = useState('FACE_UP_TABLE');
  const [isFaceDownOnTable, setIsFaceDownOnTable] = useState(false);
  const [faceDownDuration, setFaceDownDuration] = useState(0); // in seconds
  const [flipCount, setFlipCount] = useState(0);
  const [flipHistory, setFlipHistory] = useState([]);

  // iOS Permissions & Capability
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [hasRealSensors, setHasRealSensors] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false); // Default silent for mentalism trick
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Audio / sound & haptic refs to avoid stale closures
  const soundEnabledRef = useRef(soundEnabled);
  const hapticEnabledRef = useRef(hapticEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { hapticEnabledRef.current = hapticEnabled; }, [hapticEnabled]);

  // Buffer for stability calculation (last 15 frames)
  const zBufferRef = useRef([]);
  const magBufferRef = useRef([]);
  const stableSinceRef = useRef(null);
  const faceDownStartRef = useRef(null);
  const previousStateRef = useRef('FACE_UP_TABLE');

  // Check if browser requires permission (iOS 13+)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const needsPermission =
      (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') ||
      (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function');

    if (needsPermission) {
      setPermissionState('prompt');
    } else if ('DeviceOrientationEvent' in window) {
      // Standard Android / Chrome / Firefox
      setPermissionState('granted');
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  // Request iOS permission on user action
  const requestPermission = useCallback(async () => {
    try {
      let orientationGranted = true;
      let motionGranted = true;

      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const orientationRes = await DeviceOrientationEvent.requestPermission();
        orientationGranted = orientationRes === 'granted';
      }

      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        const motionRes = await DeviceMotionEvent.requestPermission();
        motionGranted = motionRes === 'granted';
      }

      if (orientationGranted || motionGranted) {
        setPermissionState('granted');
        setHasRealSensors(true);
        return true;
      } else {
        setPermissionState('denied');
        return false;
      }
    } catch (err) {
      console.warn('Sensor permission error:', err);
      setPermissionState('denied');
      return false;
    }
  }, []);

  // Evaluation algorithm to detect if device is face down on a table
  const evaluateState = useCallback((beta, gamma, accelZ, accelX, accelY, accelPureMag) => {
    // 1. Face-down angle check
    // Beta is near +/- 180° when screen is pointing towards ground/table
    const absBeta = Math.abs(beta);
    const absGamma = Math.abs(gamma);

    // Standard face-down: beta between 150° and 180°, gamma between -35° and +35°
    // OR gravity Z is strongly negative (towards -9.8 m/s²)
    const isAngleFaceDown =
      (absBeta >= 150 && absGamma <= 35) ||
      (absGamma >= 150) ||
      (accelZ !== null && accelZ <= -7.2);

    // Standard face-up: beta between -30° and +30°, gamma between -30° and +30°
    // OR gravity Z is strongly positive (+9.8 m/s²)
    const isAngleFaceUp =
      (absBeta <= 30 && absGamma <= 30) ||
      (accelZ !== null && accelZ >= 7.2);

    // 2. Stillness / Stability check (posé sur une surface fixe)
    // Add to sliding window buffers
    if (accelZ !== null) {
      zBufferRef.current.push(accelZ);
      if (zBufferRef.current.length > 15) zBufferRef.current.shift();
    }

    const currentMag = Math.hypot(accelX || 0, accelY || 0, accelZ || 9.8);
    magBufferRef.current.push(currentMag);
    if (magBufferRef.current.length > 15) magBufferRef.current.shift();

    const zVariance = getVariance(zBufferRef.current);
    const magVariance = getVariance(magBufferRef.current);
    const totalVariance = zVariance + magVariance;

    // Stability score 0 - 100%
    const stability = Math.max(0, Math.min(100, Math.round(100 - (totalVariance * 40 + accelPureMag * 30))));

    // Is device resting still on a table?
    // Low variance and table is roughly horizontal (X and Y acceleration small)
    const isHorizontalRest = Math.hypot(accelX || 0, accelY || 0) < 3.2;
    const isStationary = totalVariance < 0.25 && accelPureMag < 0.8 && isHorizontalRest;

    // Determine target classification
    let calculatedState = 'IN_HAND';

    if (totalVariance > 0.8 || accelPureMag > 1.8) {
      calculatedState = 'MOVING';
    } else if (isAngleFaceDown && isStationary) {
      calculatedState = 'FACE_DOWN_TABLE';
    } else if (isAngleFaceUp && isStationary) {
      calculatedState = 'FACE_UP_TABLE';
    } else if (isAngleFaceDown) {
      // Facing down, but being held in hand or moving
      calculatedState = 'IN_HAND';
    }

    return { calculatedState, stability };
  }, []);

  // Main listener for real hardware sensors
  useEffect(() => {
    if (isSimulated || permissionState === 'denied') return;

    let latestBeta = 0;
    let latestGamma = 0;
    let latestAlpha = 0;
    let latestAccelZ = 9.8;
    let latestAccelX = 0;
    let latestAccelY = 0;
    let latestPureMag = 0;

    const handleOrientation = (e) => {
      if (e.beta === null && e.gamma === null) return;
      setHasRealSensors(true);
      setPermissionState('granted');

      latestBeta = e.beta || 0;
      latestGamma = e.gamma || 0;
      latestAlpha = e.alpha || 0;

      setOrientation({
        alpha: Math.round(latestAlpha),
        beta: Math.round(latestBeta),
        gamma: Math.round(latestGamma),
      });

      processUpdate();
    };

    const handleMotion = (e) => {
      setHasRealSensors(true);
      setPermissionState('granted');
      const withGrav = e.accelerationIncludingGravity;
      const pure = e.acceleration;

      if (withGrav) {
        latestAccelX = withGrav.x || 0;
        latestAccelY = withGrav.y || 0;
        latestAccelZ = withGrav.z || 0;
      }

      if (pure && pure.x !== null) {
        latestPureMag = Math.hypot(pure.x || 0, pure.y || 0, pure.z || 0);
      } else {
        latestPureMag = 0;
      }

      processUpdate();
    };

    function processUpdate() {
      const { calculatedState, stability } = evaluateState(
        latestBeta,
        latestGamma,
        latestAccelZ,
        latestAccelX,
        latestAccelY,
        latestPureMag
      );

      setMotion({
        accelWithGravity: {
          x: Number(latestAccelX.toFixed(2)),
          y: Number(latestAccelY.toFixed(2)),
          z: Number(latestAccelZ.toFixed(2)),
        },
        accelPure: {
          x: Number((latestPureMag).toFixed(2)),
          y: 0,
          z: 0,
        },
        stabilityScore: stability,
      });

      // Handle debounce & state transitions
      const now = Date.now();
      const prev = previousStateRef.current;

      if (calculatedState === 'FACE_DOWN_TABLE') {
        if (!stableSinceRef.current) {
          stableSinceRef.current = now;
        } else if (now - stableSinceRef.current > 250) {
          // Debounce confirmed face down on table!
          if (prev !== 'FACE_DOWN_TABLE') {
            previousStateRef.current = 'FACE_DOWN_TABLE';
            setDeviceState('FACE_DOWN_TABLE');
            setIsFaceDownOnTable(true);
            faceDownStartRef.current = now;
            setFlipCount((c) => c + 1);

            // Audio & Haptic feedback
            if (soundEnabledRef.current) playFaceDownChime();
            if (hapticEnabledRef.current) triggerHaptic('faceDown');
          }
        }
      } else {
        stableSinceRef.current = null;
        if (prev === 'FACE_DOWN_TABLE') {
          // Lifted from table!
          previousStateRef.current = calculatedState;
          setDeviceState(calculatedState);
          setIsFaceDownOnTable(false);

          const durationSec = faceDownStartRef.current
            ? Math.round((now - faceDownStartRef.current) / 1000)
            : 0;

          if (durationSec > 0) {
            setFlipHistory((hist) => [
              {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                duration: durationSec,
              },
              ...hist.slice(0, 9),
            ]);
          }

          faceDownStartRef.current = null;

          // Sound on lift
          if (soundEnabledRef.current) playLiftChime();
          if (hapticEnabledRef.current) triggerHaptic('lift');
        } else {
          setDeviceState(calculatedState);
          previousStateRef.current = calculatedState;
        }
      }
    }

    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('devicemotion', handleMotion, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [isSimulated, permissionState, evaluateState]);

  // Tick timer for duration spent face down
  useEffect(() => {
    let interval = null;
    if (isFaceDownOnTable) {
      interval = setInterval(() => {
        if (faceDownStartRef.current) {
          setFaceDownDuration(Math.floor((Date.now() - faceDownStartRef.current) / 1000));
        }
      }, 500);
    } else {
      setFaceDownDuration(0);
    }
    return () => clearInterval(interval);
  }, [isFaceDownOnTable]);

  // Simulation Controls for Desktop / Testing
  const setSimulatedPreset = useCallback((preset) => {
    setIsSimulated(true);

    let targetBeta = 0;
    let targetGamma = 0;
    let targetAlpha = 45;
    let targetAccelZ = 9.8;
    let targetVariance = 0.02;
    let pureMag = 0.05;

    if (preset === 'face_down') {
      targetBeta = 180;
      targetGamma = 0;
      targetAccelZ = -9.8;
      targetVariance = 0.02;
    } else if (preset === 'face_up') {
      targetBeta = 0;
      targetGamma = 0;
      targetAccelZ = 9.8;
      targetVariance = 0.02;
    } else if (preset === 'in_hand') {
      targetBeta = 55;
      targetGamma = 18;
      targetAccelZ = 6.2;
      targetVariance = 0.45;
      pureMag = 0.6;
    } else if (preset === 'moving') {
      targetBeta = 110;
      targetGamma = -40;
      targetAccelZ = -2.5;
      targetVariance = 1.8;
      pureMag = 2.4;
    }

    setOrientation({
      alpha: targetAlpha,
      beta: targetBeta,
      gamma: targetGamma,
    });

    const { calculatedState, stability } = evaluateState(
      targetBeta,
      targetGamma,
      targetAccelZ,
      0,
      0,
      pureMag
    );

    setMotion({
      accelWithGravity: { x: 0, y: 0, z: targetAccelZ },
      accelPure: { x: pureMag, y: 0, z: 0 },
      stabilityScore: stability,
    });

    const now = Date.now();
    const prev = previousStateRef.current;

    if (calculatedState === 'FACE_DOWN_TABLE') {
      if (prev !== 'FACE_DOWN_TABLE') {
        previousStateRef.current = 'FACE_DOWN_TABLE';
        setDeviceState('FACE_DOWN_TABLE');
        setIsFaceDownOnTable(true);
        faceDownStartRef.current = now;
        setFlipCount((c) => c + 1);

        if (soundEnabledRef.current) playFaceDownChime();
        if (hapticEnabledRef.current) triggerHaptic('faceDown');
      }
    } else {
      if (prev === 'FACE_DOWN_TABLE') {
        previousStateRef.current = calculatedState;
        setDeviceState(calculatedState);
        setIsFaceDownOnTable(false);

        const durationSec = faceDownStartRef.current
          ? Math.round((now - faceDownStartRef.current) / 1000)
          : 0;

        if (durationSec > 0) {
          setFlipHistory((hist) => [
            {
              id: Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              duration: durationSec,
            },
            ...hist.slice(0, 9),
          ]);
        }

        faceDownStartRef.current = null;
        if (soundEnabledRef.current) playLiftChime();
        if (hapticEnabledRef.current) triggerHaptic('lift');
      } else {
        setDeviceState(calculatedState);
        previousStateRef.current = calculatedState;
      }
    }
  }, [evaluateState]);

  // Manual tilt slider adjustment
  const updateCustomAngle = useCallback((newBeta, newGamma) => {
    setIsSimulated(true);
    setOrientation((prev) => ({ ...prev, beta: newBeta, gamma: newGamma }));

    // Estimate gravity Z based on cosine of beta
    const radBeta = (newBeta * Math.PI) / 180;
    const estZ = Number((Math.cos(radBeta) * 9.8).toFixed(2));

    const { calculatedState, stability } = evaluateState(newBeta, newGamma, estZ, 0, 0, 0.05);

    setMotion((m) => ({
      ...m,
      accelWithGravity: { x: 0, y: 0, z: estZ },
      stabilityScore: stability,
    }));

    const now = Date.now();
    const prev = previousStateRef.current;

    if (calculatedState === 'FACE_DOWN_TABLE') {
      if (prev !== 'FACE_DOWN_TABLE') {
        previousStateRef.current = 'FACE_DOWN_TABLE';
        setDeviceState('FACE_DOWN_TABLE');
        setIsFaceDownOnTable(true);
        faceDownStartRef.current = now;
        setFlipCount((c) => c + 1);
        if (soundEnabledRef.current) playFaceDownChime();
        if (hapticEnabledRef.current) triggerHaptic('faceDown');
      }
    } else {
      if (prev === 'FACE_DOWN_TABLE') {
        previousStateRef.current = calculatedState;
        setDeviceState(calculatedState);
        setIsFaceDownOnTable(false);
        faceDownStartRef.current = null;
        if (soundEnabledRef.current) playLiftChime();
        if (hapticEnabledRef.current) triggerHaptic('lift');
      } else {
        setDeviceState(calculatedState);
        previousStateRef.current = calculatedState;
      }
    }
  }, [evaluateState]);

  return {
    orientation,
    motion,
    deviceState,
    isFaceDownOnTable,
    faceDownDuration,
    flipCount,
    flipHistory,
    permissionState,
    hasRealSensors,
    isSimulated,
    setIsSimulated,
    requestPermission,
    setSimulatedPreset,
    updateCustomAngle,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
  };
}
