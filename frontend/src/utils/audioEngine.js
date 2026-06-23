let audioCtx = null;
let musicCleanup = null;
let musicRunning = false;
let melodyStep = 0;

const SOFT_MELODY = [196, 220, 247, 262, 247, 220, 196, 175];

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export async function resumeAudio() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    return true;
  } catch {
    return false;
  }
}

function playTone(freq, duration = 0.15, type = 'sine', volume = 0.08) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // audio not available
  }
}

function playMelodyNote(freq) {
  if (!musicRunning) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.5;
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
  } catch {
    // ignore
  }
}

export const sounds = {
  click: () => playTone(520, 0.06, 'sine', 0.04),
  submit: () => { playTone(392, 0.08, 'sine', 0.05); setTimeout(() => playTone(523, 0.1, 'sine', 0.04), 70); },
  vote: () => playTone(440, 0.08, 'sine', 0.04),
  correct: () => { playTone(523, 0.1, 'sine', 0.05); setTimeout(() => playTone(659, 0.12, 'sine', 0.04), 90); },
  roundEnd: () => { playTone(330, 0.12, 'sine', 0.04); setTimeout(() => playTone(262, 0.15, 'sine', 0.03), 120); },
  gameOver: () => { playTone(392, 0.15, 'sine', 0.04); setTimeout(() => playTone(311, 0.2, 'sine', 0.03), 160); },
  notify: () => playTone(523, 0.08, 'sine', 0.03),
  phaseChange: () => playTone(262, 0.12, 'sine', 0.03),
};

export function startMusic() {
  stopMusic();
  musicRunning = true;
  melodyStep = 0;

  try {
    const ctx = getCtx();

    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 98;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.012;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 350;
    pad.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(ctx.destination);
    pad.start();

    playMelodyNote(SOFT_MELODY[0]);
    const melodyTimer = setInterval(() => {
      if (!musicRunning) return;
      melodyStep = (melodyStep + 1) % SOFT_MELODY.length;
      playMelodyNote(SOFT_MELODY[melodyStep]);
    }, 2200);

    musicCleanup = () => {
      clearInterval(melodyTimer);
      try { pad.stop(); } catch { /* */ }
      try { padGain.disconnect(); padFilter.disconnect(); } catch { /* */ }
    };
  } catch {
    musicRunning = false;
  }
}

export function stopMusic() {
  musicRunning = false;
  if (musicCleanup) {
    musicCleanup();
    musicCleanup = null;
  }
}

export function isMusicPlaying() {
  return musicRunning;
}

export function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
