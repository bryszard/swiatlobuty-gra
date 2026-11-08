import React, { useEffect, useLayoutEffect, useState } from "react";
import { audio } from "./audio";
import { Game, Result, Btn } from "./Game";
import { Intro, Outro, TitleRoom } from "./Rooms";
import { LEVELS } from "./levels";
import { fontFamily } from "./font";
import { star4 } from "./art/ink";

type Screen = { k: "title" } | { k: "intro" } | { k: "level"; i: number } | { k: "outro" };

const parseHash = (): Screen | null => {
  const h = window.location.hash.replace("#", "");
  const m = /^level(\d)$/.exec(h);
  if (m) return { k: "level", i: Math.max(0, Math.min(3, Number(m[1]) - 1)) };
  if (h === "intro") return { k: "intro" };
  if (h === "outro") return { k: "outro" };
  return null;
};

export const App: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [screen, setScreen] = useState<Screen>({ k: "title" });
  const [result, setResult] = useState<Result | null>(null);
  const [muted, setMuted] = useState(false);
  const [gen, setGen] = useState(0);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);
  useEffect(() => {
    const h = parseHash();
    if (h) { // debug / direct links: needs one gesture to start audio
      const start = () => { audio.unlock(); setScreen(h); window.removeEventListener("pointerdown", start); window.removeEventListener("keydown", start); };
      window.addEventListener("pointerdown", start); window.addEventListener("keydown", start);
      return () => { window.removeEventListener("pointerdown", start); window.removeEventListener("keydown", start); };
    }
  }, []);
  useEffect(() => { audio.setMuted(muted); }, [muted]);
  useEffect(() => {
    if (screen.k === "title") audio.play("title", { loop: true });
    if (screen.k === "intro") audio.play("intro", { loop: true });
    if (screen.k === "outro") audio.play("outro", { loop: true });
  }, [screen]);

  const startGame = () => { audio.unlock(); audio.click(); audio.play("intro", { loop: true }); setScreen({ k: "intro" }); };
  const nextLevel = () => {
    if (screen.k !== "level") return;
    setResult(null);
    if (screen.i >= LEVELS.length - 1) setScreen({ k: "outro" }); else { setScreen({ k: "level", i: screen.i + 1 }); setGen((g) => g + 1); }
  };
  useEffect(() => {
    if (!result) return;
    const kd = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") nextLevel(); };
    window.addEventListener("keydown", kd); return () => window.removeEventListener("keydown", kd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, screen]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#05040f" }}>
      <div style={{ width: 1920, height: 1080, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, overflow: "hidden" }}>
        {screen.k === "title" && <TitleRoom onStart={startGame} />}
        {screen.k === "intro" && <Intro onDone={() => { audio.stop(0.5); setScreen({ k: "level", i: 0 }); setGen((g) => g + 1); }} startPhase={window.location.hash === "#intro" ? "sleep" : undefined} />}
        {screen.k === "level" && <Game key={`${screen.i}-${gen}`} def={LEVELS[screen.i]} first={screen.i === 0} onDone={setResult} />}
        {screen.k === "outro" && <Outro onAgain={() => { setScreen({ k: "title" }); setGen((g) => g + 1); }} />}
        {result && screen.k === "level" && <Summary r={result} name={LEVELS[screen.i].name} last={screen.i === LEVELS.length - 1} onNext={nextLevel} />}
        <div style={{ position: "absolute", right: screen.k === "level" ? 140 : 36, top: 24 }}><Btn onClick={() => setMuted((m) => !m)} label={muted ? "🔇" : "🔊"} /></div>
      </div>
    </div>
  );
};

const Summary: React.FC<{ r: Result; name: string; last: boolean; onNext: () => void }> = ({ r, name, last, onNext }) => (
  <div onPointerDown={(e) => e.stopPropagation()} style={{ position: "absolute", left: 560, right: 560, top: 150, padding: "30px 40px 40px", background: "rgba(255,255,255,.95)", border: "8px solid #1a1226", borderRadius: 48, textAlign: "center", fontFamily, fontWeight: 800, color: "#1a1226", boxShadow: "0 12px 0 #1a1226" }}>
    <div style={{ fontSize: 68, lineHeight: 1.1 }}>{name}<br />zaliczone!</div>
    <div style={{ display: "flex", justifyContent: "center", gap: 18, margin: "10px 0" }}>
      {[0, 1, 2].map((i) => <svg key={i} width="130" height="130" viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: `rotate(${i === 1 ? 0 : i ? 8 : -8}deg) translateY(${i === 1 ? -10 : 0}px)` }}><path d={star4} fill={i < r.stars ? "#ffe14d" : "#d7d2e6"} stroke="#1a1226" strokeWidth={0.1} strokeLinejoin="round" /></svg>)}
    </div>
    <div style={{ fontSize: 52 }}>Iskry: {r.sparks} / {r.total}</div>
    <button onClick={onNext} style={{ marginTop: 22, fontFamily, fontWeight: 800, fontSize: 56, padding: "6px 46px 10px", borderRadius: 50, border: "6px solid #1a1226", background: "#ff7ad9", color: "#fff", cursor: "pointer", boxShadow: "0 7px 0 #1a1226" }}>{last ? "Do domu →" : "Dalej →"}</button>
    <div style={{ fontSize: 28, marginTop: 14, opacity: 0.6 }}>albo spacja</div>
  </div>
);
