import React, { useEffect, useReducer, useRef } from "react";
import { Ala, AlaDefs } from "./art/Ala";
import { mixPose } from "./art/poses";
import { RoomBack, RoomBlanket } from "./art/Room";
import { Props, PropDef } from "./art/props";
import { BeatCtx, ZoomCtx } from "./art/ink";
import { audio } from "./audio";
import { clamp, ease, keyed, satAt } from "./data";
import { fontFamily } from "./font";

const BED = { x: 540, y: 690 }, EDGE = { x: 790, y: 650 }, FS = { x: 990, y: 872 };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

type View = { st: number; lt: number; pose: ReturnType<typeof mixPose>; x: number; y: number; scale: number; rot: number; noShoes: boolean; flat: boolean; props: PropDef[]; eyes?: "open" | "closed" | "happy"; beat: number; fade?: number };

/** One drawing of Ala's bedroom at story time `st` (the film's clock: dawn ~16-46 s, dusk ~213-232 s). */
const RoomView: React.FC<{ v: View }> = ({ v }) => {
  const sat = satAt(v.st), s1 = Math.min(sat, 1);
  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <AlaDefs />
      <ZoomCtx.Provider value={1}><BeatCtx.Provider value={v.beat}>
        <g style={{ filter: `saturate(${sat.toFixed(3)}) brightness(${(0.3 + 0.7 * s1).toFixed(3)})` }}><RoomBack t={v.st} /></g>
        <Props defs={v.props} t={v.st} lt={v.lt} u={0} />
        <g style={{ filter: `brightness(${(0.78 + 0.22 * s1).toFixed(3)}) saturate(${(0.7 + 0.4 * Math.min(sat, 1.1)).toFixed(3)})` }}>
          <Ala pose={v.pose} t={v.lt} x={v.x} y={v.y} scale={v.scale} rot={v.rot} glow={1 + (1 - s1) * 0.9} beat={v.beat} shoes={!v.noShoes} eyes={v.eyes ?? "open"} trail={0} />
          <RoomBlanket t={v.st} flat={v.flat} />
        </g>
      </BeatCtx.Provider></ZoomCtx.Provider>
      <rect width={1920} height={1080} fill="#05040f" opacity={v.fade ?? 0} />
    </svg>
  );
};

const textStyle: React.CSSProperties = { fontFamily, fontWeight: 800, color: "#fff", WebkitTextStroke: "10px #1a1226", paintOrder: "stroke fill", textAlign: "center" };

function useScene() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  const ref = useRef({ ph: "", t0: 0, now: 0 });
  useEffect(() => {
    let raf = 0;
    const tick = (n: number) => { ref.current.now = n / 1000; force(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const R = ref.current;
  const go = (ph: string) => { R.ph = ph; R.t0 = R.now; };
  return { R, go, el: R.now - R.t0 };
}

const floorProps = (extra: PropDef[] = []): PropDef[] => [{ type: "floorShoes", x: FS.x, y: FS.y }, { type: "sparks", x: FS.x, y: 850, n: 20, spread: 160, rise: 340 }, ...extra];

/* ---------------- Title (sleeping room) ---------------- */
export const TitleRoom: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { R, go, el } = useScene();
  if (!R.ph) go("t");
  const v: View = { st: 4 + Math.sin(R.now * 0.5) * 0.4, lt: R.now, pose: mixPose("sleep", "sleep", 0), x: BED.x, y: BED.y, scale: 1, rot: 0, noShoes: true, flat: false, props: floorProps(), beat: (R.now * 0.9) % 1, eyes: "closed" };
  void el;
  return (
    <div style={{ position: "absolute", inset: 0 }} onPointerDown={onStart}>
      <RoomView v={v} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, ...textStyle }}>
        <div style={{ fontSize: 40, color: "#ffe14d" }}>przygoda małej Ali</div>
        <div style={{ fontSize: 150, lineHeight: 1, marginTop: 6 }}>Światłobuty</div>
        <div style={{ fontSize: 150, lineHeight: 1, color: "#ff7ad9" }}>skrzydłoloty</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, fontSize: 52, ...textStyle, WebkitTextStroke: "9px #1a1226", opacity: 0.7 + 0.3 * Math.sin(R.now * 4) }}>Naciśnij, aby zagrać</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, fontSize: 28, ...textStyle, WebkitTextStroke: "6px #1a1226", color: "#cfd6ff" }}>strzałki / WASD lub palec · muzyka z piosenki (MIDI)</div>
    </div>
  );
};

/* ---------------- Intro: getting up ---------------- */
export const Intro: React.FC<{ onDone: () => void; startPhase?: string }> = ({ onDone, startPhase }) => {
  const { R, go, el } = useScene();
  const done = useRef(false);
  const dressed = useRef(false);
  if (!R.ph) { go(startPhase ?? "sleep"); }
  useEffect(() => {
    const act = () => {
      if (R.ph === "sleep") { go("wake"); audio.yawn(); }
      else if (R.ph === "shoes") { go("dress"); audio.click(); }
    };
    const kd = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); act(); } };
    window.addEventListener("keydown", kd); (window as unknown as { __act: () => void }).__act = act;
    return () => window.removeEventListener("keydown", kd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ph = R.ph;
  let st = 6, pose = mixPose("sleep", "sleep", 0), x = BED.x, y = BED.y, scale = 1, rot = 0, flat = false, fade = 0, noShoes = true, eyes: "open" | "closed" | "happy" = "closed";
  let props = floorProps();
  if (ph === "sleep") { st = 6 + Math.sin(R.now * 0.6) * 0.5; if (el > 4) { go("wake"); audio.yawn(); } }
  else if (ph === "wake") {
    const p = clamp(el / 9.5);
    st = 16 + p * 30;
    const a = ease(clamp(p / 0.25)), b = ease(clamp((p - 0.58) / 0.34));
    pose = b > 0 ? mixPose("wake", "edge", b) : mixPose("sleep", "wake", a);
    x = lerp(BED.x, EDGE.x, b); y = lerp(BED.y, EDGE.y, b); flat = p > 0.62; eyes = p < 0.12 ? "closed" : "open";
    if (el > 9.5) go("shoes");
  } else if (ph === "shoes") {
    st = 46; pose = mixPose("edge", "edge", 0); x = EDGE.x; y = EDGE.y + Math.sin(R.now * 2.4) * 4; flat = true; eyes = "open";
    if (el > 2.8) { go("dress"); audio.click(); }
  } else if (ph === "dress") {
    st = 46; flat = true; x = EDGE.x + 10; y = EDGE.y + 6;
    const down = ease(clamp(el / 0.7)), up = ease(clamp((el - 1.0) / 0.6));
    pose = mixPose("edge", "bend", down * (1 - up)); noShoes = el < 0.9; eyes = el > 0.9 ? "happy" : "open";
    if (el >= 0.9 && !dressed.current) { dressed.current = true; audio.sparkle(); }
    if (el >= 0.9) props = [{ type: "sparks", x: 930, y: 780, n: 90, spread: 340, rise: 600 }, ...(el < 0.9 ? floorProps() : [])];
    else props = floorProps([{ type: "sparks", x: FS.x, y: 850, n: 40, spread: 220, rise: 460 }]);
    if (el > 2.0) { go("fly"); audio.whoosh(); }
  } else if (ph === "fly") {
    st = 46; flat = true; noShoes = false; eyes = "happy";
    const p = ease(clamp(el / 2.3));
    pose = mixPose("edge", "fly", clamp(el / 0.5));
    x = lerp(EDGE.x, 1440, p); y = lerp(EDGE.y - 40, 400, p) - Math.sin(p * Math.PI) * 120; scale = lerp(1, 0.45, p); rot = -26 * p;
    props = [{ type: "sparks", x: 930, y: 780, n: 40, spread: 340, rise: 600 }];
    fade = clamp((el - 1.6) / 0.9);
    if (el > 2.7 && !done.current) { done.current = true; queueMicrotask(onDone); }
  }
  const v: View = { st, lt: R.now, pose, x, y, scale, rot, noShoes, flat, props, eyes, beat: (R.now * 1.0) % 1, fade };
  const hintCommon = { position: "absolute", left: 0, right: 0, ...textStyle } as React.CSSProperties;
  return (
    <div style={{ position: "absolute", inset: 0 }} onPointerDown={() => (window as unknown as { __act: () => void }).__act()}>
      <RoomView v={v} />
      {ph === "sleep" ? <div style={{ ...hintCommon, top: 90, fontSize: 64 }}>Ala jeszcze śpi… <span style={{ color: "#ffe14d" }}>Zzz</span><div style={{ fontSize: 46, marginTop: 14, opacity: 0.7 + 0.3 * Math.sin(R.now * 4) }}>Za chwilę się obudzi… (dotknij, żeby przyspieszyć)</div></div> : null}
      {ph === "wake" ? <div style={{ ...hintCommon, top: 90, fontSize: 64 }}>{el < 3 ? "Dzień dobry, słoneczko!" : el < 7 ? "Słońce zagląda przez szyby…" : "Na podłodze czeka cud!"}</div> : null}
      {ph === "shoes" ? <>
        <div style={{ position: "absolute", left: FS.x - 120, top: FS.y - 210, width: 320, height: 240, border: "7px dashed #ffe14d", borderRadius: 120, opacity: 0.55 + 0.4 * Math.sin(R.now * 5), pointerEvents: "none" }} />
        <div style={{ ...hintCommon, top: 90, fontSize: 64 }}>Ala wkłada Światłobuty!</div>
      </> : null}
      {ph === "dress" && el > 1 ? <div style={{ ...hintCommon, top: 100, fontSize: 90, color: "#ffe14d" }}>Błysk!</div> : null}
    </div>
  );
};

/* ---------------- Outro: back to bed ---------------- */
export const Outro: React.FC<{ onAgain: () => void; startPhase?: string }> = ({ onAgain, startPhase }) => {
  const { R, go, el } = useScene();
  const undressed = useRef(false);
  if (!R.ph) go(startPhase ?? "in");
  useEffect(() => {
    const act = () => { if (R.ph === "shoes") { go("undress"); audio.click(); } else if (R.ph === "end") onAgain(); };
    const kd = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); act(); } };
    window.addEventListener("keydown", kd); (window as unknown as { __act: () => void }).__act = act;
    return () => window.removeEventListener("keydown", kd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ph = R.ph;
  let st = 212, pose = mixPose("fly", "fly", 0), x = EDGE.x, y = EDGE.y, scale = 1, rot = 0, flat = true, noShoes = false, eyes: "open" | "closed" | "happy" = "happy", props: PropDef[] = [], fade = 0;
  if (ph === "in") {
    const p = ease(clamp(el / 3.4));
    pose = mixPose("fly", "edge", clamp((p - 0.55) / 0.45)); x = lerp(1440, EDGE.x, p); y = lerp(400, EDGE.y, p) - Math.sin(p * Math.PI) * 110; scale = lerp(0.45, 1, p); rot = -26 * (1 - p) * (p < 0.7 ? 1 : 0);
    st = 212 + (el > 0 ? 0 : 0); props = [{ type: "sparks", x: 1000, y: 700, n: 30, spread: 500, rise: 500 }];
    if (el > 3.6) go("shoes");
  } else if (ph === "shoes") {
    pose = POSE_EDGE; y = EDGE.y + Math.sin(R.now * 2.4) * 4;
    if (el > 2.8) { go("undress"); audio.click(); }
  } else if (ph === "undress") {
    x = EDGE.x + 10; y = EDGE.y + 6;
    const down = ease(clamp(el / 0.7)), up = ease(clamp((el - 1.0) / 0.6));
    pose = mixPose("edge", "bend", down * (1 - up)); noShoes = el >= 0.9; eyes = "open";
    if (el >= 0.9) { props = floorProps(); if (!undressed.current) { undressed.current = true; audio.sparkle(); } }
    if (el > 2.0) go("lie");
  } else if (ph === "lie" || ph === "end") {
    const e = ph === "end" ? 99 : el;
    noShoes = true; props = floorProps();
    const p = clamp(e / 11);
    st = 212 + p * 21;
    const a = ease(clamp(e / 2.2)), b = ease(clamp((e - 2.6) / 2.4));
    pose = b > 0 ? mixPose("wake", "sleep", b) : mixPose("edge", "wake", a);
    x = lerp(EDGE.x, BED.x, a); y = lerp(EDGE.y, BED.y, a); flat = a < 0.5; eyes = b > 0.4 ? "closed" : "open";
    fade = ph === "end" ? 0.35 : 0;
    if (ph === "lie" && el > 11) go("end");
  }
  const v: View = { st, lt: R.now, pose, x, y, scale, rot, noShoes, flat, props, eyes, beat: (R.now * 0.6) % 1, fade };
  const hint = { position: "absolute", left: 0, right: 0, ...textStyle } as React.CSSProperties;
  return (
    <div style={{ position: "absolute", inset: 0 }} onPointerDown={() => (window as unknown as { __act: () => void }).__act()}>
      <RoomView v={v} />
      {ph === "in" ? <div style={{ ...hint, top: 90, fontSize: 64 }}>Wróciłaś do domu, Alu!</div> : null}
      {ph === "shoes" ? <div style={{ ...hint, top: 90, fontSize: 64 }}>Czas spać. Ala zdejmuje Światłobuty</div> : null}
      {ph === "lie" && el > 5 && el < 10.5 ? <div style={{ ...hint, top: 90, fontSize: 70, opacity: clamp((el - 5) / 1.2) * clamp((10.5 - el) / 1) }}>Dobranoc, świecie…</div> : null}
      {ph === "end" ? (
        <div style={{ ...hint, top: 80 }}>
          <div style={{ fontSize: 130, color: "#ffe14d" }}>Dobranoc!</div>
          <div style={{ fontSize: 56, marginTop: 6 }}>Jutro znów cię pozmieniam…</div>
          <div style={{ fontSize: 40, marginTop: 40, color: "#cfd6ff" }}>Światłobuty skrzydłoloty</div>
          <div style={{ fontSize: 34, color: "#cfd6ff" }}>Kraków · Korea · Hiszpania · Rabkoland</div>
          <div style={{ fontSize: 48, marginTop: 40, opacity: 0.7 + 0.3 * Math.sin(R.now * 4) }}>Naciśnij, aby zagrać jeszcze raz</div>
        </div>
      ) : null}
    </div>
  );
};
const POSE_EDGE = mixPose("edge", "edge", 0);
void keyed;
