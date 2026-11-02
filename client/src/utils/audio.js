/**
 * Synthesizes an Apple-grade subtle check-in chime using the Web Audio API.
 * 2-tone melodic chime: D5 (587.33 Hz) -> A5 (880.00 Hz) with exponential decay.
 * Zero external MP3 files needed, 100% resilient, offline-ready.
 */
export function playSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playTone = (freq, startTime, duration, maxGain = 0.18) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Attack
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.02);
      // Exponential decay
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.18, 0.15); // D5
    playTone(880.00, now + 0.09, 0.38, 0.22); // A5
  } catch {
    // If Web Audio is blocked or not supported, fail silently
  }
}

