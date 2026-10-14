// Web Audio API Synthesizer & Haptics for TableFlip

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a calm, deep soothing chime when the phone is placed face-down on a table
 */
export function playFaceDownChime(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.35, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    masterGain.connect(ctx.destination);

    // Warm deep tone 1 (G3 / 196Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(196, now);
    osc1.frequency.exponentialRampToValueAtTime(147, now + 0.9); // Slide slightly down into rest
    osc1.connect(masterGain);

    // Harmonic bell layer (D4 / 293.66Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.6, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(293.66, now);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 1.2);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Play a bright ascending chime when the phone is lifted back up
 */
export function playLiftChime(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.25, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    masterGain.connect(ctx.destination);

    // Ascending bright chime (C5 -> G5)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, now); // G4
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.25); // D5
    osc.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Trigger mobile haptic feedback if supported
 */
export function triggerHaptic(type = 'faceDown') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'faceDown') {
        // Deep double pulse
        navigator.vibrate([70, 40, 110]);
      } else if (type === 'lift') {
        // Single light tap
        navigator.vibrate(45);
      } else if (type === 'button') {
        navigator.vibrate(25);
      }
    } catch {
      // Haptics might be blocked by browser policy without user gesture
    }
  }
}
