// Web Audio API Synthesizers & Voice Simulation
let audioCtx: AudioContext | null = null;
let sirenOsc1: OscillatorNode | null = null;
let sirenOsc2: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: ReturnType<typeof setInterval> | null = null;

let ringtoneInterval: ReturnType<typeof setInterval> | null = null;
let isRingtonePlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Realistic marimba phone ringtone chime using Web Audio API synthesis
 */
export function startPhoneRingtone(): void {
  if (isRingtonePlaying) return;
  isRingtonePlaying = true;

  const playTune = () => {
    try {
      const ctx = getAudioContext();
      const notes = [
        { freq: 659.25, time: 0.0, duration: 0.12 },
        { freq: 783.99, time: 0.14, duration: 0.12 },
        { freq: 987.77, time: 0.28, duration: 0.14 },
        { freq: 1318.51, time: 0.44, duration: 0.25 },
        { freq: 987.77, time: 0.72, duration: 0.14 },
        { freq: 1318.51, time: 0.90, duration: 0.35 },
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0, ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration + 0.05);
      });

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([400, 200, 400]);
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  playTune();
  ringtoneInterval = setInterval(() => {
    if (isRingtonePlaying) {
      playTune();
    }
  }, 2400);
}

export function stopPhoneRingtone(): void {
  isRingtonePlaying = false;
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

/**
 * Loud high-intensity Emergency Siren (undulating dual tone)
 */
export function startEmergencySiren(): void {
  try {
    const ctx = getAudioContext();
    if (sirenGain) return;

    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.35, ctx.currentTime);
    sirenGain.connect(ctx.destination);

    sirenOsc1 = ctx.createOscillator();
    sirenOsc2 = ctx.createOscillator();

    sirenOsc1.type = 'sawtooth';
    sirenOsc2.type = 'sine';

    sirenOsc1.connect(sirenGain);
    sirenOsc2.connect(sirenGain);

    let ascending = true;
    sirenOsc1.frequency.setValueAtTime(650, ctx.currentTime);
    sirenOsc2.frequency.setValueAtTime(750, ctx.currentTime);

    sirenOsc1.start();
    sirenOsc2.start();

    sirenInterval = setInterval(() => {
      if (!sirenGain || !audioCtx) return;
      const now = audioCtx.currentTime;
      if (ascending) {
        sirenOsc1?.frequency.linearRampToValueAtTime(1050, now + 0.45);
        sirenOsc2?.frequency.linearRampToValueAtTime(1150, now + 0.45);
        ascending = false;
      } else {
        sirenOsc1?.frequency.linearRampToValueAtTime(650, now + 0.45);
        sirenOsc2?.frequency.linearRampToValueAtTime(750, now + 0.45);
        ascending = true;
      }
    }, 450);

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([500, 200, 500, 200, 1000]);
      } catch {
        // ignore
      }
    }
  } catch (e) {
    console.warn('Siren start error:', e);
  }
}

export function stopEmergencySiren(): void {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  try {
    if (sirenOsc1) {
      sirenOsc1.stop();
      sirenOsc1.disconnect();
      sirenOsc1 = null;
    }
    if (sirenOsc2) {
      sirenOsc2.stop();
      sirenOsc2.disconnect();
      sirenOsc2 = null;
    }
    if (sirenGain) {
      sirenGain.disconnect();
      sirenGain = null;
    }
  } catch (e) {
    console.warn('Siren stop error:', e);
  }
}

/**
 * Piercing high-frequency whistle for deterrence
 */
export function playWhistleBurst(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(3200, ctx.currentTime + 0.25);
    osc.frequency.linearRampToValueAtTime(2800, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.75);

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {
        // ignore
      }
    }
  } catch (e) {
    console.warn('Whistle error:', e);
  }
}

export function triggerHaptic(pattern: number[] = [80]): void {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

let synthUtterance: SpeechSynthesisUtterance | null = null;

export function speakSimulatedCaller(text: string): void {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    synthUtterance = new SpeechSynthesisUtterance(text);
    synthUtterance.rate = 1.0;
    synthUtterance.pitch = 1.05;
    window.speechSynthesis.speak(synthUtterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

export function stopSimulatedCaller(): void {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      synthUtterance = null;
    } catch {
      // ignore
    }
  }
}