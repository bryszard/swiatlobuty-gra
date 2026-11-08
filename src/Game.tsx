import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { Ala, AlaDefs } from "./art/Ala";
import { mixPose, POSES } from "./art/poses";
import { BeatCtx, INK, star4 } from "./art/ink";
import { SeoulBack } from "./art/Seoul";
import { SpainBack } from "./art/Spain";
import { RabkoBack } from "./art/Rabko";
import { KrakowBack, DragonStatue } from "./art/Krakow";
import { audio } from "./audio";
import { Ent, generate, LevelDef, LevelId, levelLength } from "./levels";
import { Bolt, Bonus, Bumper, Goal, Jet, Kite, Lift, Pigeon, RingBack, RingFront, Spark, Warn } from "./entities";
import { Clouds, Strip } from "./strips";
import { clamp } from "./data";
import { fontFamily } from "./font";

export type Result = { sparks: number; total: number; stars: number; time: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; c: string };
type Popup = { x: number; y: number; t: number; text: string };

const Backdrop = React.memo(({ id, t, scroll }: { id: LevelId; t: number; scroll: number }) => {
  const p = { t, scroll, pulse: 0 };
  return id === "krakow" ? <KrakowBack {...p} /> : id === "korea" ? <SeoulBack {...p} /> : id === "spain" ? <SpainBack {...p} /> : <RabkoBack {...p} />;
});

const FAST = new URLSearchParams(window.location.search).get("fast") ? 6 : 1;
const PAD = typeof window !== "undefined" && (window.matchMedia?.("(pointer: coarse)").matches || new URLSearchParams(window.location.search).get("pad") !== null);
const COLS = ["#ff7ad9", "#ffe14d", "#7ae7ff", "#ffffff", "#8cf0a8"];
const KEYS: Record<string, string> = { ArrowUp: "u", w: "u", W: "u", ArrowDown: "d", s: "d", S: "d", ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r" };

type GS = { keys: Set<string>; kt: Record<string, number>; target: number | null; ents: Ent[]; cam: number; ax: number; ay: number; time: number };
const press = (s: GS, k: string) => { if (!s.keys.has(k)) { s.kt[k] = s.time; s.keys.add(k); if (k === "u" || k === "d") s.target = null; } };
/** A quick tap on up/down glides Ala to the height of the next star or bonus above/below her. */
const release = (s: GS, k: string) => {
  if (!s.keys.delete(k)) return;
  if ((k !== "u" && k !== "d") || s.time - (s.kt[k] ?? -9) > 0.4) return;
  const ay = s.ay - 22, ax = s.cam + s.ax + 34;
  let best: Ent | null = null;
  for (const e of s.ents) {
    if (e.done || e.taken || (e.kind !== "spark" && e.kind !== "bonus" && e.kind !== "ring")) continue;
    if (e.x < ax + 40 || e.x > ax + 1100) continue;
    if (k === "u" ? e.y > ay - 70 : e.y < ay + 70) continue;
    if (!best || e.x < best.x) best = e;
  }
  s.target = best ? best.y : Math.max(150, Math.min(900, ay + (k === "u" ? -260 : 260)));
};
export const Game: React.FC<{ def: LevelDef; first: boolean; onDone: (r: Result) => void }> = ({ def, first, onDone }) => {
  const [, force] = useReducer((x: number) => x + 1, 0);
  const world = useMemo(() => generate(def), [def]);
  const L = levelLength(def);
  const root = useRef<HTMLDivElement>(null);
  const S = useRef({
    cam: 0, time: 0, ax: 420, ay: 520, vx: 0, vy: 0, bump: 0, slow: 0, sparks: 0, combo: 0, comboT: -9, happy: 0, boostOn: false, target: null as null | number, kt: {} as Record<string, number>, boost: 0, dcam: 0,
    keys: new Set<string>(), ptr: null as null | { x: number; y: number }, parts: [] as Particle[], pops: [] as Popup[],
    ents: world.ents.map((e) => ({ ...e })), phase: "play" as "play" | "finish" | "done", finT: 0, paused: false, emit: 0, fin0: { x: 0, y: 0 }, doneCalled: false,
  });
  const bpm = useMemo(() => audio.song(def.music).bpm, [def]);

  useEffect(() => {
    audio.play(def.music, { loop: true });
    let raf = 0, last = performance.now();
    const s = S.current;
    const toStage = (ev: PointerEvent) => { const r = root.current!.getBoundingClientRect(); return { x: ((ev.clientX - r.left) * 1920) / r.width, y: ((ev.clientY - r.top) * 1080) / r.height }; };
    const kd = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") { togglePause(); return; }
      if (e.key === " " || e.code === "Space") { e.preventDefault(); if (!s.boostOn) { s.boostOn = true; audio.whoosh(); } return; }
      const k = KEYS[e.key]; if (k) { press(s, k); e.preventDefault(); }
    };
    const ku = (e: KeyboardEvent) => { if (e.key === " " || e.code === "Space") s.boostOn = false; const k = KEYS[e.key]; if (k) release(s, k); };
    let steerId = -1;
    const onCtl = (e: PointerEvent) => !!(e.target as Element | null)?.closest?.("[data-ctl],button");
    const pd = (e: PointerEvent) => { if (onCtl(e)) return; steerId = e.pointerId; s.ptr = toStage(e); };
    const pm = (e: PointerEvent) => { if (e.pointerId === steerId && (e.buttons || e.pointerType === "touch")) s.ptr = toStage(e); };
    const pu = (e: PointerEvent) => { if (e.pointerId === steerId) { s.ptr = null; steerId = -1; } };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const el = root.current!; el.addEventListener("pointerdown", pd); window.addEventListener("pointermove", pm); window.addEventListener("pointerup", pu); window.addEventListener("pointercancel", pu);
    const togglePause = () => { s.paused = !s.paused; if (audio.ctx) void (s.paused ? audio.ctx.suspend() : audio.ctx.resume()); force(); };
    (window as unknown as { __pause: () => void }).__pause = togglePause;

    const burst = (x: number, y: number, n: number, speed = 260, life = 0.7) => {
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = speed * (0.4 + Math.random() * 0.8); s.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life, max: life, s: 8 + Math.random() * 12, c: COLS[i % 5] }); }
    };
    const collect = (value: number, x: number, y: number, bonus: boolean) => {
      s.sparks += value;
      s.combo = s.time - s.comboT < 1.1 ? s.combo + 1 : 0; s.comboT = s.time;
      if (bonus) { audio.bonus(); s.happy = 1.2; s.pops.push({ x, y: y - 40, t: 0, text: `+${value}` }); burst(x, y, 16, 340, 0.8); } else { audio.collect(s.combo); burst(x, y, 4, 150, 0.45); }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (s.paused) return;
      s.time += dt; s.happy -= dt; s.bump -= dt; s.slow -= dt;
      const k = s.keys;
      let tvx = 0, tvy = 0; const VM = 560;
      if (s.phase === "play") {
        if (k.has("l")) tvx -= VM; if (k.has("r")) tvx += VM; if (k.has("u")) tvy -= VM; if (k.has("d")) tvy += VM;
        if (s.ptr && !k.size) { const cx = s.ax + 30, cy = s.ay - 20; tvx = clamp((s.ptr.x - cx) * 4.2, -VM, VM); tvy = clamp((s.ptr.y - cy) * 4.2, -VM, VM); if (Math.hypot(s.ptr.x - cx, s.ptr.y - cy) < 14) { tvx = 0; tvy = 0; } }
        if (s.target !== null) {
          const diff = s.target - (s.ay - 22);
          if (k.has("u") || k.has("d") || s.ptr || Math.abs(diff) < 10) s.target = null;
          else tvy = clamp(diff * 5, -VM, VM);
        }
        if (s.target === null && !s.ptr && !k.size) {
          // full autopilot: fly to the next star, bonus or ring ahead
          const wx = s.cam + s.ax + 34, wy = s.ay - 22;
          let best: Ent | null = null, bs = 1e9;
          for (const e of s.ents) {
            if (e.done || e.taken || (e.kind !== "spark" && e.kind !== "bonus" && e.kind !== "ring")) continue;
            const ahead = e.x - wx; if (ahead < -10 || ahead > 1000) continue;
            const sc = ahead - (e.kind === "spark" ? 0 : 260) + Math.abs(e.y - wy) * 0.25;
            if (sc < bs) { bs = sc; best = e; }
          }
          const gy = best ? best.y : 500;
          tvy = clamp((gy - wy) * 4.5, -VM, VM);
          tvx = clamp((430 - s.ax) * 2, -300, 300);
        }
        const sm = s.slow > 0 ? 0.45 : 1;
        s.boost += ((s.boostOn ? 1 : 0) - s.boost) * Math.min(1, dt * 6);
        s.dcam = def.speed * sm * (1 + 0.9 * s.boost) * dt * FAST;
        s.cam += s.dcam;
      } else {
        // finish: float to the centre and cheer
        s.finT += dt; const p = clamp(s.finT / 1.4); const e = p * p * (3 - 2 * p);
        s.ax = s.fin0.x + (860 - s.fin0.x) * e; s.ay = s.fin0.y + (560 - s.fin0.y) * e;
        if (Math.random() < 0.5) burst(s.ax + 40 + (Math.random() - 0.5) * 500, s.ay - 160 + (Math.random() - 0.5) * 300, 3, 200, 1.1);
        if (s.finT > 4.2 && !s.doneCalled) { s.doneCalled = true; s.phase = "done"; const tot = world.sparkTotal, fr = tot ? s.sparks / tot : 1; onDone({ sparks: s.sparks, total: tot, stars: fr >= 0.7 ? 3 : fr >= 0.4 ? 2 : 1, time: s.time }); }
      }
      if (s.phase === "play") {
        const ac = Math.min(1, dt * 9);
        s.vx += (tvx - s.vx) * ac; s.vy += (tvy - s.vy) * ac;
        // gentle bob so Ala never feels frozen
        const prevX = s.ax;
        s.ax = clamp(s.ax + s.vx * dt, 200, 1500); s.ay = clamp(s.ay + (s.vy + Math.sin(s.time * 3.2) * 18) * dt, 150, 900);
        const ax = s.cam + s.ax + 34, ay = s.ay - 22, prevWX = s.cam - s.dcam + prevX + 34;
        for (const e of s.ents) {
          if (e.done) continue;
          const sx0 = e.x - s.cam;
          if (sx0 > 2300 || sx0 < -700) { if (e.kind === "bolt" || sx0 >= -700) continue; }
          if (e.t0 === undefined && sx0 < 2100) e.t0 = s.time;
          const lt = s.time - (e.t0 ?? s.time);
          if (e.kind === "pigeon") { e.cx = e.x + (e.v ?? 0) * lt; e.cy = e.y + Math.sin(lt * 6.283 / (e.per ?? 2) + e.ph) * (e.amp ?? 0); }
          else if (e.kind === "kite" || e.kind === "bumper") { e.cx = e.x; e.cy = e.y + Math.sin(lt * 6.283 / (e.per ?? 2) + e.ph) * (e.amp ?? 0); }
          else { e.cx = e.x; e.cy = e.y; }
          const dx = ax - (e.cx ?? e.x), dy = ay - (e.cy ?? e.y), d = Math.hypot(dx, dy);
          switch (e.kind) {
            case "spark": if (!e.taken && d < e.r + 74) { e.taken = true; collect(1, (e.cx ?? 0) - s.cam, e.cy ?? 0, false); } break;
            case "bonus": if (!e.taken && d < e.r + 76) { e.taken = true; collect(e.v ?? 3, (e.cx ?? 0) - s.cam, e.cy ?? 0, true); } break;
            case "ring": if (!e.taken && prevWX < e.x && ax >= e.x && Math.abs(dy) < 104) { e.taken = true; collect(e.v ?? 3, e.x - s.cam, e.y, true); } break;
            case "lift": if (Math.abs(dx) < 100 && ay < e.y + 40 && ay > e.y - (e.h ?? 600)) { if (e.st === undefined || s.time - e.st > 1) audio.boing(); e.st = s.time; s.vy = Math.min(s.vy, -430); s.ay -= 330 * dt; if (Math.random() < 0.5) burst(e.x - s.cam + (Math.random() - 0.5) * 120, s.ay + 60, 1, 60, 0.5); } break;
            case "jet": { const u = ((s.time + e.ph) / (e.per ?? 3.4)) % 1; if (u > 0.66 && u < 0.9 && Math.abs(dx) < 110 && ay > 1000 - (e.h ?? 300) - 40 && s.bump <= 0) hit(0, -1, 520); break; }
            case "pigeon": case "kite": if (d < e.r + (e.kind === "kite" ? 62 : 44) && s.bump <= 0) hit(dx, dy, 560); break;
            case "bumper": if (d < e.r + 52 && s.bump <= 0) { audio.boing(); s.bump = 0.35; s.slow = 0.25; const n = Math.hypot(dx, dy) || 1; s.vx = (dx / n) * 700; s.vy = (dy / n) * 700; burst(s.ax + 60, s.ay - 20, 8, 240, 0.5); } break;
            case "bolt": {
              if (e.st === undefined) { if (sx0 < 1500) { e.st = s.time; } else break; }
              const w = s.time - e.st;
              if (w < 1.3) { e.cx = s.cam + 1840; e.cy = e.y; } // warning phase (drawn as arrow)
              else { const sx = 2050 - (w - 1.3) * 1100; e.cx = s.cam + sx; e.cy = e.y; if (sx < -300) { e.done = true; break; }
                const bd = Math.hypot(ax - e.cx, ay - e.cy); if (bd < 62 + 60 && s.bump <= 0) hit(ax - e.cx, ay - e.cy, 620); }
              break;
            }
          }
        }
        if (s.cam + s.ax + 34 >= L - 20) { s.phase = "finish"; s.fin0 = { x: s.ax, y: s.ay }; s.finT = 0; audio.play("clear", { loop: false }); audio.sparkle(); for (let i = 0; i < 6; i++) burst(s.ax + 40, s.ay - 40, 14, 420, 1.2); }
        // shoe trail
        s.emit -= dt; if (s.emit <= 0) { s.emit = 0.035 - 0.015 * s.boost; s.parts.push({ x: s.ax - 80, y: s.ay + 28 + (Math.random() - 0.5) * 20, vx: -120 - Math.random() * 80 - 500 * s.boost, vy: (Math.random() - 0.5) * 60, life: 0.55, max: 0.55, s: 7 + Math.random() * 8, c: COLS[Math.floor(Math.random() * 5)] }); }
      }
      for (const p of s.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; }
      s.parts = s.parts.filter((p) => p.life > 0).slice(-160);
      for (const p of s.pops) p.t += dt; s.pops = s.pops.filter((p) => p.t < 1);
      force();
    };
    const hit = (dx: number, dy: number, push: number) => {
      s.bump = 1.1; s.slow = 0.8; s.combo = 0; audio.bump();
      const n = Math.hypot(dx, dy) || 1; s.vx = (dx / n) * push; s.vy = (dy / n) * push - 120;
      s.pops.push({ x: s.ax + 40, y: s.ay - 150, t: 0, text: "Ups!" });
      for (let i = 0; i < 8; i++) s.parts.push({ x: s.ax + 40, y: s.ay - 30, vx: (Math.random() - 0.5) * 400, vy: (Math.random() - 0.5) * 400, life: 0.6, max: 0.6, s: 9, c: "#ffffff" });
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); el.removeEventListener("pointerdown", pd); window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", pu); window.removeEventListener("pointercancel", pu); if (audio.ctx?.state === "suspended") void audio.ctx.resume(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def]);

  const s = S.current;
  const phase = (s.time * bpm / 60) % 1;
  const finishing = s.phase !== "play";
  const flick = s.bump > 0 && Math.floor(s.time * 14) % 2 === 0;
  const rot = clamp(s.vy / 560, -1, 1) * 24 - (s.vx > 200 ? 6 : 0);
  const pose = finishing ? mixPose("fly", "cheer", clamp(s.finT / 0.8)) : s.bump > 0.6 ? mixPose("fly", "fly", 0) : POSES.fly;
  const tq = Math.floor(s.time * 10) / 10, sq = Math.floor(s.cam / 14) * 14;
  const tint = def.id === "spain" ? "#5a4a96" : "#ffffff";
  const vis = s.ents.filter((e) => { const sx = (e.cx ?? e.x) - s.cam; return !e.done && sx > -300 && sx < 2200; });

  return (
    <div ref={root} style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <AlaDefs />
        <BeatCtx.Provider value={phase}>
          <Backdrop id={def.id} t={tq} scroll={sq} />
          <Clouds off={s.cam * 0.25} tint={tint} />
          {def.id === "krakow" ? null : null}
          {/* entities behind Ala */}
          {vis.map((e) => {
            const x = (e.cx ?? e.x) - s.cam, y = e.cy ?? e.y;
            switch (e.kind) {
              case "lift": return <g key={e.id} transform={`translate(${x} ${y})`}><Lift t={s.time} h={e.h ?? 600} ph={e.ph} /></g>;
              case "ring": return <g key={e.id} transform={`translate(${x} ${y})`}><RingBack t={s.time} taken={!!e.taken} /></g>;
              case "pigeon": return <g key={e.id} transform={`translate(${x} ${y}) scale(-1 1)`}><Pigeon t={s.time} ph={e.ph} /></g>;
              case "kite": return <g key={e.id} transform={`translate(${x} ${y})`}><Kite t={s.time} ph={e.ph} /></g>;
              case "bumper": return <g key={e.id} transform={`translate(${x} ${y})`}><Bumper t={s.time} ph={e.ph} /></g>;
              default: return null;
            }
          })}
          <Strip id={def.id} off={s.cam} />
          {vis.map((e) => e.kind === "jet" ? <g key={e.id} transform={`translate(${e.x - s.cam} ${e.y})`}><Jet t={s.time} u={((s.time + e.ph) / (e.per ?? 3.4)) % 1} h={e.h ?? 300} /></g> : null)}
          {/* goal gate */}
          {L - s.cam < 2300 ? <g transform={`translate(${L - s.cam} 520)`}><Goal t={s.time} lvl={def.id} /></g> : null}
          {vis.map((e) => {
            const x = (e.cx ?? e.x) - s.cam, y = e.cy ?? e.y;
            if (e.taken && e.kind !== "ring") return null;
            if (e.kind === "spark") return <g key={e.id} transform={`translate(${x} ${y})`}><Spark t={s.time} ph={e.ph} /></g>;
            if (e.kind === "bonus") return <g key={e.id} transform={`translate(${x} ${y})`}><Bonus level={def.id} t={s.time} ph={e.ph} /></g>;
            return null;
          })}
          {s.boost > 0.05 ? Array.from({ length: 9 }, (_, i) => { const y = 120 + ((i * 197 + 61) % 840), x = ((i * 523 - s.cam * 2.4) % 2200 + 2200) % 2200 - 200; return <rect key={i} x={x} y={y} width={220 * s.boost} height={6} rx={3} fill="#fff" opacity={0.45 * s.boost} />; }) : null}
          {/* Ala */}
          <g opacity={flick ? 0.45 : 1}>
            <Ala pose={pose} outfit={def.outfit} t={s.time} x={s.ax} y={s.ay} scale={0.62} rot={finishing ? 0 : rot} trail={finishing ? 0 : 0.6 + 0.5 * s.boost} glow={1.1} beat={phase} eyes={s.happy > 0 || finishing ? "happy" : "open"} />
          </g>
          {vis.map((e) => (e.kind === "ring" ? <g key={e.id} transform={`translate(${e.x - s.cam} ${e.y})`}><RingFront taken={!!e.taken} /></g> : null))}
          {vis.map((e) => {
            if (e.kind !== "bolt" || e.st === undefined) return null;
            const w = s.time - e.st;
            return w < 1.3 ? <g key={e.id} transform={`translate(1800 ${e.y})`}><Warn t={s.time} /></g> : <g key={e.id} transform={`translate(${(e.cx ?? 0) - s.cam} ${e.cy})`}><Bolt t={s.time} /></g>;
          })}
          {s.parts.map((p, i) => <path key={i} d={star4} transform={`translate(${p.x} ${p.y}) scale(${p.s * (p.life / p.max)})`} fill={p.c} stroke={INK} strokeWidth={0.12} opacity={clamp(p.life / p.max * 1.4)} />)}
          {s.pops.map((p, i) => <text key={i} x={p.x} y={p.y - p.t * 80} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={64} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke fill" opacity={1 - p.t * p.t}>{p.text}</text>)}
        </BeatCtx.Provider>
      </svg>
      {/* HUD */}
      <div style={{ position: "absolute", left: 36, top: 24, display: "flex", gap: 18, alignItems: "center", fontFamily, fontWeight: 800 }}>
        <div style={{ background: "rgba(26,18,38,.78)", border: "5px solid #1a1226", borderRadius: 40, padding: "6px 28px 6px 18px", color: "#ffe14d", fontSize: 54, display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="56" height="56" viewBox="-1 -1 2 2"><path d={star4} fill="#ffe14d" stroke="#fff6b0" strokeWidth={0.1} /></svg>{s.sparks}
        </div>
        <div style={{ color: "#fff", fontSize: 40, textShadow: "0 0 8px #1a1226, 0 0 3px #1a1226, 3px 3px 0 #1a1226" }}>{def.n}. {def.name}</div>
      </div>
      <div style={{ position: "absolute", left: 560, right: 560, top: 40, height: 22, background: "rgba(26,18,38,.7)", border: "4px solid #1a1226", borderRadius: 14 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${clamp(s.cam / (L - 1000)) * 100}%`, background: `linear-gradient(90deg, ${def.accent}, #ffe14d)`, borderRadius: 10 }} />
        <svg style={{ position: "absolute", left: `calc(${clamp(s.cam / (L - 1000)) * 100}% - 24px)`, top: -22, overflow: "visible" }} width="48" height="48" viewBox="-1 -1 2 2"><path d={star4} fill="#fff" stroke="#1a1226" strokeWidth={0.14} /></svg>
      </div>
      {PAD ? (() => {
        const base = { position: "absolute", width: 150, height: 150, borderRadius: 40, border: "8px solid #1a1226", boxShadow: "0 8px 0 #1a1226", display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 800, color: "#1a1226", userSelect: "none", touchAction: "none", cursor: "pointer", WebkitUserSelect: "none" } as React.CSSProperties;
        const key = (k: string, label: string, right: number, bottom: number) => {
          const on = s.keys.has(k);
          const dn = (e: React.PointerEvent) => { e.stopPropagation(); e.preventDefault(); press(s, k); };
          const up = () => { release(s, k); };
          return <div key={k} onPointerDown={dn} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} onContextMenu={(e) => e.preventDefault()} style={{ ...base, right, bottom, fontSize: 80, background: on ? "#ffe14d" : "rgba(255,255,255,.82)", transform: on ? "translateY(6px)" : undefined }}>{label}</div>;
        };
        const tb = s.boost > 0.3;
        return (<>
          <div data-ctl="1" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); if (!s.boostOn) audio.whoosh(); s.boostOn = true; }} onPointerUp={() => { s.boostOn = false; }} onPointerLeave={() => { s.boostOn = false; }} onPointerCancel={() => { s.boostOn = false; }} onContextMenu={(e) => e.preventDefault()} style={{ ...base, left: 36, bottom: 40, width: 230, height: 230, borderRadius: 115, fontSize: 52, background: tb ? "#ffe14d" : "#ff7ad9", transform: tb ? "translateY(6px)" : undefined }}>TURBO</div>
        </>);
      })() : null}
      <div style={{ position: "absolute", right: 36, top: 24, display: "flex", gap: 14 }}>
        <Btn onClick={() => (window as unknown as { __pause: () => void }).__pause()} label={s.paused ? "▶" : "❚❚"} />
      </div>
      {s.time < 4.5 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily, fontWeight: 800, opacity: clamp(1 - (s.time - 3.2) / 1.3), pointerEvents: "none" }}>
          <div style={{ fontSize: 40, color: def.accent, textShadow: "3px 3px 0 #1a1226, -2px -2px 0 #1a1226, 2px -2px 0 #1a1226, -2px 2px 0 #1a1226" }}>Poziom {def.n}</div>
          <div style={{ fontSize: 130, lineHeight: 1, color: "#fff", WebkitTextStroke: "12px #1a1226", paintOrder: "stroke fill" }}>{def.name}</div>
          <div style={{ fontSize: 44, color: "#fff", marginTop: 10, WebkitTextStroke: "8px #1a1226", paintOrder: "stroke fill" }}>{def.sub}</div>
          <div style={{ fontSize: 40, color: "#ffe14d", marginTop: 26, WebkitTextStroke: "8px #1a1226", paintOrder: "stroke fill" }}>{def.hint}</div>
        </div>
      ) : null}
      {first && s.time > 4.8 && s.time < 11 ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontFamily, fontWeight: 800, fontSize: 44, color: "#fff", WebkitTextStroke: "9px #1a1226", paintOrder: "stroke fill", opacity: clamp((11 - s.time) / 1.5), pointerEvents: "none" }}>Ala leci sama i zbiera gwiazdki · Turbo = szybciej</div> : null}
      {s.paused ? <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,24,.55)", display: "grid", placeItems: "center", fontFamily, fontWeight: 800, fontSize: 120, color: "#fff", WebkitTextStroke: "12px #1a1226", paintOrder: "stroke fill" }} onPointerDown={(e) => { e.stopPropagation(); (window as unknown as { __pause: () => void }).__pause(); }}>Pauza</div> : null}
    </div>
  );
};

export const Btn: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button onPointerDown={(e) => e.stopPropagation()} onClick={onClick} style={{ width: 80, height: 80, borderRadius: 40, border: "5px solid #1a1226", background: "rgba(255,255,255,.92)", fontSize: 34, fontFamily, fontWeight: 800, color: "#1a1226", cursor: "pointer" }}>{label}</button>
);
export { DragonStatue };
