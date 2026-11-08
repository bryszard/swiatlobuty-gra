import { MIDI } from "./midiData";

/* ---------- Standard MIDI File parser (format 0/1, one tempo, markers start/loop/end) ---------- */
export type MNote = { t: number; d: number; ch: number; n: number; v: number; prog: number };
export type Song = { notes: MNote[]; bpm: number; loopT: number; endT: number };

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export function parseSMF(data: Uint8Array): Song {
  let p = 0;
  const u32 = () => ((data[p++] << 24) | (data[p++] << 16) | (data[p++] << 8) | data[p++]) >>> 0;
  const u16 = () => (data[p++] << 8) | data[p++];
  const vlq = () => { let v = 0, b; do { b = data[p++]; v = (v << 7) | (b & 127); } while (b & 128); return v; };
  p += 4; u32(); u16(); const ntrk = u16(); const div = u16();
  let tempo = 500000; const marks: Record<string, number> = {};
  const raw: { tick: number; dtick: number; ch: number; n: number; v: number; prog: number }[] = [];
  for (let k = 0; k < ntrk; k++) {
    p += 4; const len = u32(); const end = p + len;
    let tick = 0, run = 0; const prog: number[] = new Array(16).fill(0); const open = new Map<number, { tick: number; v: number; prog: number }>();
    while (p < end) {
      tick += vlq();
      let st = data[p];
      if (st === 0xff) {
        p++; const type = data[p++]; const l = vlq();
        if (type === 0x51) tempo = (data[p] << 16) | (data[p + 1] << 8) | data[p + 2];
        if (type === 0x06) marks[String.fromCharCode(...data.slice(p, p + l))] = tick;
        p += l; continue;
      }
      if (st === 0xf0 || st === 0xf7) { p++; p += vlq(); continue; }
      if (st & 0x80) { run = st; p++; } else st = run;
      const ch = st & 15, hi = st >> 4;
      if (hi === 0xc || hi === 0xd) { const a = data[p++]; if (hi === 0xc) prog[ch] = a; continue; }
      const a = data[p++], b = data[p++];
      const key = ch * 128 + a;
      if (hi === 9 && b > 0) open.set(key, { tick, v: b, prog: prog[ch] });
      else if (hi === 8 || hi === 9) { const o = open.get(key); if (o) { raw.push({ tick: o.tick, dtick: tick - o.tick, ch, n: a, v: o.v, prog: o.prog }); open.delete(key); } }
    }
    p = end;
  }
  const spb = tempo / 1e6, tps = div;
  const sec = (tk: number) => (tk / tps) * spb;
  const notes = raw.map((r) => ({ t: sec(r.tick), d: sec(r.dtick), ch: r.ch, n: r.n, v: r.v / 127, prog: r.prog })).sort((x, y) => x.t - y.t);
  return { notes, bpm: 60 / spb, loopT: sec(marks.loop ?? 0), endT: sec(marks.end ?? 0) };
}

/* ---------- WebAudio synth ---------- */
const mtof = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

class Engine {
  ctx: AudioContext | null = null;
  master!: GainNode; music!: GainNode; sfxBus!: GainNode;
  noise!: AudioBuffer;
  songs = new Map<string, Song>();
  cur: { name: string; song: Song; base: number; idx: number; loop: boolean; gain: GainNode; dead?: boolean; onEnd?: () => void } | null = null;
  timer = 0;
  muted = false;
  musicVol = 0.8;

  unlock() {
    if (this.ctx) { if (this.ctx.state !== "running") void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = (this.ctx = new AC());
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.55;
    this.music = ctx.createGain(); this.music.gain.value = this.musicVol;
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = 0.9;
    this.music.connect(this.master); this.sfxBus.connect(this.master); this.master.connect(comp); comp.connect(ctx.destination);
    const len = ctx.sampleRate; this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.timer = window.setInterval(() => this.pump(), 40);
  }
  setMuted(m: boolean) { this.muted = m; if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.05); }
  song(name: string) { let s = this.songs.get(name); if (!s) { s = parseSMF(b64(MIDI[name])); this.songs.set(name, s); } return s; }

  play(name: string, opts: { loop?: boolean; onEnd?: () => void } = {}) {
    if (!this.ctx) return;
    if (this.cur?.name === name && !this.cur.dead) return;
    this.stop(0.6);
    const song = this.song(name), ctx = this.ctx;
    const gain = ctx.createGain(); gain.gain.value = 1; gain.connect(this.music);
    this.cur = { name, song, base: ctx.currentTime + 0.08, idx: 0, loop: opts.loop ?? true, gain, onEnd: opts.onEnd };
  }
  stop(fade = 0.5) {
    const c = this.cur; if (!c || !this.ctx) return;
    c.dead = true; c.gain.gain.cancelScheduledValues(this.ctx.currentTime);
    c.gain.gain.setTargetAtTime(0, this.ctx.currentTime, fade / 3);
    window.setTimeout(() => c.gain.disconnect(), fade * 1000 + 800);
    this.cur = null;
  }
  pump() {
    const c = this.cur, ctx = this.ctx; if (!c || !ctx || c.dead) return;
    const horizon = ctx.currentTime + 0.35, S = c.song;
    for (;;) {
      if (c.idx >= S.notes.length || S.notes[c.idx].t >= S.endT - 1e-6) {
        if (ctx.currentTime < c.base + S.endT - 0.05 && horizon < c.base + S.endT) break;
        if (c.loop) { c.base += S.endT - S.loopT; c.idx = S.notes.findIndex((n) => n.t >= S.loopT - 1e-6); if (c.idx < 0) c.idx = 0; continue; }
        if (ctx.currentTime > c.base + S.endT + 1.5) { const f = c.onEnd; this.cur = null; c.dead = true; f?.(); }
        break;
      }
      const n = S.notes[c.idx];
      const at = c.base + n.t;
      if (at > horizon) break;
      if (at >= ctx.currentTime - 0.05) this.voice(n, Math.max(at, ctx.currentTime), c.gain);
      c.idx++;
    }
  }

  /* one synth note */
  voice(n: MNote, at: number, dest: AudioNode) {
    const ctx = this.ctx!;
    if (n.ch === 9) return this.drum(n.n, n.v, at, dest);
    const f = mtof(n.n), p = n.prog, v = n.v;
    const g = ctx.createGain(); g.connect(dest);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.connect(g);
    const osc = (type: OscillatorType, freq: number, detune = 0) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = detune; o.connect(lp); o.start(at); return o; };
    const env = (peak: number, a: number, dec: number, sus: number, rel: number) => {
      const end = at + Math.max(n.d, 0.05);
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(peak, at + a);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), at + a + dec);
      g.gain.setTargetAtTime(0.0001, end, rel / 3);
      return end + rel * 1.5;
    };
    let stopAt = at + n.d + 0.5; const oscs: OscillatorNode[] = [];
    if (p === 80) { lp.frequency.value = 3600; oscs.push(osc("square", f), osc("square", f * 1.005)); stopAt = env(0.13 * v, 0.008, 0.12, 0.7, 0.07); }
    else if (p === 81) { lp.frequency.value = 1500; oscs.push(osc("sawtooth", f, -6), osc("sawtooth", f, 6)); stopAt = env(0.07 * v, 0.08, 0.2, 0.8, 0.25); }
    else if (p === 56) { lp.frequency.setValueAtTime(700, at); lp.frequency.linearRampToValueAtTime(3200, at + 0.06); lp.Q.value = 2;
      const o = osc("sawtooth", f); const lfo = ctx.createOscillator(); lfo.frequency.value = 5.5; const lg = ctx.createGain(); lg.gain.value = f * 0.006; lfo.connect(lg); lg.connect(o.frequency); lfo.start(at); oscs.push(o, lfo); stopAt = env(0.12 * v, 0.03, 0.1, 0.8, 0.08); }
    else if (p === 10 || p === 9) { lp.frequency.value = 6000; oscs.push(osc("sine", f), osc("sine", f * (p === 9 ? 4 : 3.01)), osc("sine", f * 2)); stopAt = env(0.2 * v, 0.004, Math.min(1.6, Math.max(0.4, n.d + 0.3)), 0.02, 0.2); }
    else if (p === 6) { lp.frequency.value = 5000; oscs.push(osc("sawtooth", f), osc("square", f * 2)); stopAt = env(0.07 * v, 0.003, 0.3, 0.03, 0.1); }
    else if (p === 24 || p === 25 || p === 46) { lp.frequency.setValueAtTime(4200, at); lp.frequency.exponentialRampToValueAtTime(900, at + 0.35); oscs.push(osc("sawtooth", f), osc("triangle", f * 2)); stopAt = env(0.11 * v, 0.004, 0.45, 0.04, 0.12); }
    else if (p === 107) { lp.frequency.setValueAtTime(3000, at); lp.frequency.exponentialRampToValueAtTime(700, at + 0.5); const o = osc("triangle", f), o2 = osc("square", f * 2.0); o.frequency.setValueAtTime(f * 1.03, at); o.frequency.exponentialRampToValueAtTime(f, at + 0.06); oscs.push(o, o2); stopAt = env(0.15 * v, 0.003, 0.7, 0.05, 0.15); }
    else if (p === 48 || p === 49) { lp.frequency.value = 1300; oscs.push(osc("sawtooth", f, -9), osc("sawtooth", f, 9), osc("triangle", f)); stopAt = env(0.045 * v, 0.25, 0.4, 0.9, 0.5); }
    else if (p === 17 || p === 19) { lp.frequency.value = 5000; oscs.push(osc("sine", f), osc("sine", f * 2), osc("sine", f * 3, 3), osc("square", f * 4)); stopAt = env(0.08 * v, 0.015, 0.05, 0.9, 0.06); }
    else if (p === 32 || p === 33) { lp.frequency.value = 600; oscs.push(osc("triangle", f), osc("sine", f * 2)); stopAt = env(0.28 * v, 0.01, 0.3, 0.5, 0.1); }
    else if (p === 38) { lp.frequency.setValueAtTime(900, at); lp.frequency.exponentialRampToValueAtTime(260, at + 0.2); oscs.push(osc("sawtooth", f), osc("square", f * 0.5)); stopAt = env(0.2 * v, 0.004, 0.25, 0.4, 0.06); }
    else if (p === 58) { lp.frequency.value = 500; oscs.push(osc("triangle", f), osc("square", f)); stopAt = env(0.22 * v, 0.02, 0.15, 0.7, 0.06); }
    else { lp.frequency.value = 3000; oscs.push(osc("triangle", f)); stopAt = env(0.15 * v, 0.01, 0.2, 0.5, 0.1); }
    oscs.forEach((o) => o.stop(stopAt + 0.1));
    window.setTimeout(() => { try { g.disconnect(); } catch { /* ok */ } }, (stopAt - ctx.currentTime + 0.4) * 1000);
  }

  noiseBurst(at: number, dest: AudioNode, o: { f: number; q?: number; type?: BiquadFilterType; dur: number; peak: number }) {
    const ctx = this.ctx!; const s = ctx.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = o.type ?? "bandpass"; fl.frequency.value = o.f; fl.Q.value = o.q ?? 1;
    const g = ctx.createGain(); g.gain.setValueAtTime(o.peak, at); g.gain.exponentialRampToValueAtTime(0.0001, at + o.dur);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(at, Math.random() * 0.5); s.stop(at + o.dur + 0.05);
  }
  tone(at: number, dest: AudioNode, o: { f0: number; f1: number; dur: number; peak: number; type?: OscillatorType }) {
    const ctx = this.ctx!; const os = ctx.createOscillator(); os.type = o.type ?? "sine";
    os.frequency.setValueAtTime(o.f0, at); os.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), at + o.dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(o.peak, at); g.gain.exponentialRampToValueAtTime(0.0001, at + o.dur);
    os.connect(g); g.connect(dest); os.start(at); os.stop(at + o.dur + 0.05);
  }
  drum(note: number, v: number, at: number, dest: AudioNode) {
    switch (note) {
      case 36: this.tone(at, dest, { f0: 160, f1: 42, dur: 0.22, peak: 0.7 * v }); break;
      case 41: this.tone(at, dest, { f0: 130, f1: 60, dur: 0.35, peak: 0.7 * v }); this.noiseBurst(at, dest, { f: 300, dur: 0.1, peak: 0.12 * v }); break;
      case 38: this.noiseBurst(at, dest, { f: 1800, q: 0.7, dur: 0.16, peak: 0.4 * v }); this.tone(at, dest, { f0: 220, f1: 140, dur: 0.1, peak: 0.25 * v, type: "triangle" }); break;
      case 37: this.noiseBurst(at, dest, { f: 2600, q: 3, dur: 0.04, peak: 0.35 * v }); break;
      case 39: for (let i = 0; i < 3; i++) this.noiseBurst(at + i * 0.012, dest, { f: 1500, q: 1.5, dur: 0.07, peak: 0.28 * v }); break;
      case 42: this.noiseBurst(at, dest, { f: 7500, type: "highpass", dur: 0.04, peak: 0.16 * v }); break;
      case 54: this.noiseBurst(at, dest, { f: 6000, type: "highpass", dur: 0.12, peak: 0.16 * v }); break;
      case 76: this.tone(at, dest, { f0: 1100, f1: 1000, dur: 0.07, peak: 0.28 * v, type: "triangle" }); break;
      case 77: this.tone(at, dest, { f0: 780, f1: 700, dur: 0.07, peak: 0.28 * v, type: "triangle" }); break;
      case 85: this.noiseBurst(at, dest, { f: 3800, q: 6, dur: 0.03, peak: 0.34 * v }); this.noiseBurst(at + 0.03, dest, { f: 4200, q: 6, dur: 0.03, peak: 0.26 * v }); break;
      default: this.noiseBurst(at, dest, { f: 2000, dur: 0.05, peak: 0.1 * v });
    }
  }

  /* ---- sound effects ---- */
  private pent = [64, 67, 69, 71, 72, 74, 76, 79]; // E minor-ish: the notes of the hook
  collect(i: number) {
    if (!this.ctx) return; const at = this.ctx.currentTime, m = this.pent[i % this.pent.length];
    this.tone(at, this.sfxBus, { f0: mtof(m + 12), f1: mtof(m + 12), dur: 0.22, peak: 0.16, type: "triangle" });
    this.tone(at + 0.03, this.sfxBus, { f0: mtof(m + 19), f1: mtof(m + 19), dur: 0.2, peak: 0.07, type: "sine" });
  }
  bonus() { if (!this.ctx) return; const at = this.ctx.currentTime; [71, 74, 76, 79, 83].forEach((m, i) => this.tone(at + i * 0.06, this.sfxBus, { f0: mtof(m + 12), f1: mtof(m + 12), dur: 0.3, peak: 0.13, type: "square" })); }
  bump() { if (!this.ctx) return; const at = this.ctx.currentTime; this.tone(at, this.sfxBus, { f0: 300, f1: 90, dur: 0.25, peak: 0.3, type: "triangle" }); this.noiseBurst(at, this.sfxBus, { f: 500, dur: 0.15, peak: 0.2 }); }
  whoosh() { if (!this.ctx) return; const at = this.ctx.currentTime; this.noiseBurst(at, this.sfxBus, { f: 1200, q: 0.8, dur: 0.6, peak: 0.22 }); this.tone(at, this.sfxBus, { f0: 300, f1: 1400, dur: 0.5, peak: 0.08, type: "sine" }); }
  boing() { if (!this.ctx) return; const at = this.ctx.currentTime; this.tone(at, this.sfxBus, { f0: 220, f1: 700, dur: 0.3, peak: 0.25, type: "triangle" }); }
  flap() { if (!this.ctx) return; this.noiseBurst(this.ctx.currentTime, this.sfxBus, { f: 900, q: 0.6, dur: 0.12, peak: 0.07 }); }
  click() { if (!this.ctx) return; this.tone(this.ctx.currentTime, this.sfxBus, { f0: 700, f1: 520, dur: 0.1, peak: 0.18, type: "triangle" }); }
  yawn() { if (!this.ctx) return; const at = this.ctx.currentTime; this.tone(at, this.sfxBus, { f0: 260, f1: 140, dur: 0.9, peak: 0.12, type: "sine" }); }
  sparkle() { if (!this.ctx) return; const at = this.ctx.currentTime; for (let i = 0; i < 9; i++) this.tone(at + i * 0.045, this.sfxBus, { f0: mtof(84 + (i * 5) % 12), f1: mtof(84 + (i * 5) % 12), dur: 0.35, peak: 0.07, type: "sine" }); }
}

export const audio = new Engine();
