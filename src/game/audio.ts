/* Крошечный WebAudio-синтезатор для игровых эффектов. Без внешних файлов. */

let ctx: AudioContext | null = null;
let muted = false;

try {
  muted = localStorage.getItem("snake-muted") === "1";
} catch {
  muted = false;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  slide?: number;
  delay?: number;
}

function tone(freq: number, dur: number, opts: ToneOpts = {}) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const { type = "sine", gain = 0.06, slide = 0, delay = 0 } = opts;
  try {
    const t0 = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch {
    /* звук — не повод падать */
  }
}

export const sound = {
  get muted() {
    return muted;
  },
  toggle(): boolean {
    muted = !muted;
    try {
      localStorage.setItem("snake-muted", muted ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (!muted) tone(540, 0.08, { type: "triangle", gain: 0.05 });
    return muted;
  },
  unlock() {
    ac();
  },
  eat() {
    tone(500, 0.09, { type: "square", gain: 0.042, slide: 190 });
    tone(760, 0.08, { type: "square", gain: 0.028, slide: 140, delay: 0.055 });
  },
  bonus() {
    tone(660, 0.1, { type: "triangle", gain: 0.06 });
    tone(880, 0.12, { type: "triangle", gain: 0.06, delay: 0.08 });
    tone(1320, 0.18, { type: "triangle", gain: 0.05, delay: 0.16 });
  },
  die() {
    tone(300, 0.5, { type: "sawtooth", gain: 0.055, slide: -240 });
    tone(150, 0.6, { type: "square", gain: 0.04, slide: -100, delay: 0.09 });
  },
  tick() {
    tone(840, 0.07, { type: "square", gain: 0.038 });
  },
  go() {
    tone(880, 0.12, { type: "square", gain: 0.05 });
    tone(1175, 0.16, { type: "square", gain: 0.045, delay: 0.1 });
  },
  click() {
    tone(340, 0.06, { type: "triangle", gain: 0.04 });
  },
};
