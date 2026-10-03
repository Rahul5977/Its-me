// Tiny synthesized UI sound engine — no audio assets, everything is generated with the Web Audio API.
import { useSyncExternalStore } from "react";

export type SoundName =
  | "hover"
  | "click"
  | "key"
  | "boot"
  | "success"
  | "open"
  | "close"
  | "error"
  | "whoosh"
  | "toggle";

const STORAGE_KEY = "rr-sound";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastPlayed: Partial<Record<SoundName, number>> = {};
  private listeners = new Set<() => void>();
  /** Browsers block audio until a user gesture; stay silent until then. */
  private unlocked = false;
  enabled = true;

  constructor() {
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      this.enabled = true;
    }
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Must be called from a user gesture once so browsers allow audio. */
  unlock() {
    this.unlocked = true;
    this.ensure();
  }

  private tone(
    freq: number,
    duration: number,
    {
      type = "sine",
      gain = 0.2,
      slideTo,
      delay = 0,
      attack = 0.005,
    }: { type?: OscillatorType; gain?: number; slideTo?: number; delay?: number; attack?: number } = {},
  ) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private noise(duration: number, { gain = 0.15, freq = 2000, q = 1, delay = 0, type = "bandpass" as BiquadFilterType } = {}) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(this.master!);
    src.start(t);
  }

  play(name: SoundName) {
    if (!this.enabled || !this.unlocked) return;
    const now = performance.now();
    const minGap = name === "hover" ? 45 : name === "key" ? 25 : 30;
    if (now - (this.lastPlayed[name] ?? 0) < minGap) return;
    this.lastPlayed[name] = now;
    if (!this.ensure()) return;

    switch (name) {
      case "hover":
        this.tone(1800, 0.04, { type: "sine", gain: 0.035 });
        break;
      case "click":
        this.tone(900, 0.06, { type: "square", gain: 0.05, slideTo: 420 });
        this.noise(0.03, { gain: 0.05, freq: 3500 });
        break;
      case "key":
        this.noise(0.025, { gain: 0.08, freq: 2500 + Math.random() * 1500, q: 2 });
        this.tone(140 + Math.random() * 40, 0.03, { type: "triangle", gain: 0.04 });
        break;
      case "toggle":
        this.tone(600, 0.07, { type: "triangle", gain: 0.12 });
        this.tone(900, 0.09, { type: "triangle", gain: 0.12, delay: 0.06 });
        break;
      case "open":
        this.tone(320, 0.18, { type: "sine", gain: 0.12, slideTo: 880 });
        break;
      case "close":
        this.tone(880, 0.16, { type: "sine", gain: 0.1, slideTo: 300 });
        break;
      case "whoosh":
        this.noise(0.35, { gain: 0.09, freq: 900, q: 0.6, type: "lowpass" });
        break;
      case "error":
        this.tone(180, 0.18, { type: "sawtooth", gain: 0.08 });
        this.tone(140, 0.22, { type: "sawtooth", gain: 0.08, delay: 0.1 });
        break;
      case "success":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          this.tone(f, 0.28, { type: "triangle", gain: 0.12, delay: i * 0.07 }),
        );
        break;
      case "boot":
        this.tone(55, 1.2, { type: "sawtooth", gain: 0.06, slideTo: 110, attack: 0.3 });
        [261.63, 392, 523.25, 783.99].forEach((f, i) =>
          this.tone(f, 0.9, { type: "sine", gain: 0.1, delay: 0.15 + i * 0.09, attack: 0.04 }),
        );
        this.noise(0.6, { gain: 0.05, freq: 600, type: "lowpass", delay: 0.05 });
        break;
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      /* storage unavailable — keep in-memory state */
    }
    if (on) this.play("toggle");
    this.listeners.forEach((l) => l());
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
}

export const sound = new SoundEngine();

export function useSoundEnabled() {
  return useSyncExternalStore(sound.subscribe, () => sound.enabled, () => true);
}
