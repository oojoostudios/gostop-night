// Lightweight Web Audio synthesizers for the yut throw simulator.
// No external audio assets — generated on the fly via OscillatorNode.

let cached: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!cached) {
    type WindowWithWebkit = typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const w = window as WindowWithWebkit;
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    cached = new Ctor();
  }
  return cached;
}

/** Whoosh + low rumble for the moment of throwing. */
export function playThrow() {
  const ac = ctx();
  if (!ac) return;
  const now = ac.currentTime;

  // Low rumble
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.45);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.45);

  // Higher whoosh layered on top
  const osc2 = ac.createOscillator();
  const gain2 = ac.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(400, now);
  osc2.frequency.exponentialRampToValueAtTime(180, now + 0.3);
  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc2.connect(gain2).connect(ac.destination);
  osc2.start(now);
  osc2.stop(now + 0.3);
}

/** Short wooden clack. */
export function playClack(volume = 0.18) {
  const ac = ctx();
  if (!ac) return;
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "triangle";
  // Slight pitch variation per call so sticks don't all sound identical.
  const pitch = 180 + Math.random() * 80;
  osc.frequency.setValueAtTime(pitch, now);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.06);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

/** Bright ding when the result reveals. */
export function playResult() {
  const ac = ctx();
  if (!ac) return;
  const now = ac.currentTime;

  // Two-note arpeggio: G6 → C7
  const notes: { freq: number; offset: number }[] = [
    { freq: 1568, offset: 0 },
    { freq: 2093, offset: 0.08 },
  ];

  for (const note of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note.freq, now + note.offset);
    gain.gain.setValueAtTime(0.0001, now + note.offset);
    gain.gain.exponentialRampToValueAtTime(0.12, now + note.offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + note.offset + 0.5);
    osc.connect(gain).connect(ac.destination);
    osc.start(now + note.offset);
    osc.stop(now + note.offset + 0.55);
  }
}

/** Resume the audio context after a user gesture. Browsers require this. */
export function unlockAudio() {
  const ac = ctx();
  if (ac && ac.state === "suspended") {
    ac.resume();
  }
}
