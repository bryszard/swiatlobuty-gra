import React from "react";
import { INK, PAL, useOut, useSway, star4 } from "./ink";
import { clamp, rand } from "../data";
import { Shoe, Wing } from "./Ala";
import { fontFamily } from "../font";

export type PropDef =
  | { type: "birds"; n: number; y: number; dir: 1 | -1; speed: number; s?: number }
  | { type: "sparks"; x: number; y: number; n?: number; spread?: number; rise?: number }
  | { type: "toys"; cx: number; cy: number; r: number; spin?: number }
  | { type: "stickers"; cx: number; cy: number; r: number }
  | { type: "lanterns"; n: number; x0?: number; x1?: number }
  | { type: "splash"; x: number; y: number }
  | { type: "shootingStars"; n: number }
  | { type: "fireworks"; n: number }
  | { type: "floorShoes"; x: number; y: number }
  | { type: "embers"; x: number; y: number; n?: number }
  | { type: "map"; x0: number; y0: number; x1: number; y1: number; s0: number; s1: number }
  | { type: "balloon5"; x: number; y: number }
  | { type: "bubbles"; n: number };

const COLS = [PAL.pink, PAL.yellow, PAL.cyan, "#ffffff", "#8cf0a8"];

const Bird: React.FC<{ x: number; y: number; s: number; flap: number; dir: number }> = ({ x, y, s, flap, dir }) => {
  const o = useOut(0.9);
  const w = Math.sin(flap) * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      <path d={`M-34,${-w} Q-16,${-30 - w} 0,0 Q16,${-30 - w} 34,${-w} Q16,${-14} 0,8 Q-16,-14 -34,${-w}Z`} fill="#fff" stroke={INK} strokeWidth={o / s} strokeLinejoin="round" />
      <path d="M0,0 l14,4 l-14,6Z" fill="#ffb02e" stroke={INK} strokeWidth={o / s * 0.6} strokeLinejoin="round" />
    </g>
  );
};

const Sparks: React.FC<{ x: number; y: number; t: number; n: number; spread: number; rise: number }> = ({ x, y, t, n, spread, rise }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const per = 1.4 + rand(i) * 1.4, ph = ((t + rand(i + 3) * per) % per) / per;
      const px = x + (rand(i + 7) - 0.5) * spread + Math.sin(t * 2 + i) * 14;
      const py = y - ph * rise * (0.6 + rand(i + 9) * 0.6);
      const sz = (10 + rand(i + 11) * 22) * Math.sin(ph * Math.PI);
      return <path key={i} d={star4} transform={`translate(${px} ${py}) rotate(${ph * 140}) scale(${sz})`} fill={COLS[i % 5]} stroke={INK} strokeWidth={0.1} opacity={0.95} />;
    })}
  </g>
);

const Toy: React.FC<{ kind: number }> = ({ kind }) => {
  const o = useOut(0.9);
  if (kind === 0) return <g><rect x={-34} y={-26} width={68} height={52} rx={6} fill="#4fa3ff" stroke={INK} strokeWidth={o} /><rect x={-28} y={-20} width={56} height={40} fill="#fff6e6" stroke={INK} strokeWidth={o * 0.6} /><path d="M0,-20 L0,20" stroke={INK} strokeWidth={o * 0.7} /></g>;
  if (kind === 1) return <g><circle r={30} fill="#ff7ad9" stroke={INK} strokeWidth={o} /><path d="M-26,-6 Q0,-22 26,-6" fill="none" stroke="#fff" strokeWidth={6} /></g>;
  if (kind === 2) return <g><circle cx={0} cy={6} r={32} fill="#c98a4e" stroke={INK} strokeWidth={o} /><circle cx={-22} cy={-22} r={14} fill="#c98a4e" stroke={INK} strokeWidth={o} /><circle cx={22} cy={-22} r={14} fill="#c98a4e" stroke={INK} strokeWidth={o} /><circle cx={-10} cy={0} r={4} fill={INK} /><circle cx={10} cy={0} r={4} fill={INK} /><ellipse cx={0} cy={14} rx={10} ry={7} fill="#f3d3a0" stroke={INK} strokeWidth={o * 0.6} /></g>;
  if (kind === 3) return <path d={star4} transform="scale(40)" fill={PAL.yellow} stroke={INK} strokeWidth={0.07} />;
  return <path d="M-40,0 L40,-20 L10,0 L40,20Z" fill="#fff" stroke={INK} strokeWidth={o} strokeLinejoin="round" />;
};

const Sticker: React.FC<{ kind: number }> = ({ kind }) => {
  const o = useOut(0.9);
  return (
    <g>
      <circle r={62} fill="#fff" stroke={INK} strokeWidth={o * 1.2} />
      {kind === 0 && <g><path d="M-44,8 Q-30,-8 -22,-22 L22,-22 Q30,-8 44,8 Q0,18 -44,8Z" fill="#3f8a92" stroke={INK} strokeWidth={o} strokeLinejoin="round" /><rect x={-26} y={8} width={52} height={28} fill="#e0b080" stroke={INK} strokeWidth={o} /><rect x={-8} y={16} width={16} height={20} fill="#2b2438" /></g>}
      {kind === 1 && <g><rect x={-26} y={-6} width={52} height={40} fill="#f2c56a" stroke={INK} strokeWidth={o} /><path d="M-32,-6 L0,-30 L32,-6Z" fill="#c4583a" stroke={INK} strokeWidth={o} strokeLinejoin="round" /><rect x={-5} y={14} width={10} height={20} fill="#6b4226" /></g>}
      {kind === 2 && <g><circle r={36} fill="none" stroke={INK} strokeWidth={o * 3} /><circle r={36} fill="none" stroke="#ffd34d" strokeWidth={5} /><path d="M-36,0H36M0,-36V36M-26,-26L26,26M26,-26L-26,26" stroke="#4a6fc9" strokeWidth={4} /><circle r={8} fill="#ff5fa2" stroke={INK} strokeWidth={o * 0.7} /></g>}
    </g>
  );
};

export const Lantern: React.FC<{ x: number; y: number; c: string; s: number }> = ({ x, y, c, s }) => {
  const o = useOut(0.9);
  const sw = useSway(x * 0.01);
  return (
    <g transform={`translate(${x} ${y}) rotate(${sw * 7}) scale(${s * (1 + sw * 0.03)})`}>
      <circle r={70} fill={c} opacity={0.28} />
      <rect x={-8} y={-52} width={16} height={12} fill="#7a4b2e" stroke={INK} strokeWidth={o / s} />
      <ellipse cx={0} cy={0} rx={36} ry={44} fill={c} stroke={INK} strokeWidth={o / s} />
      <path d="M-20,-40 Q-30,0 -20,40 M0,-44 L0,44 M20,-40 Q30,0 20,40" fill="none" stroke={INK} strokeWidth={o / s * 0.6} />
      <rect x={-22} y={42} width={44} height={10} fill="#ffd34d" stroke={INK} strokeWidth={o / s * 0.8} />
      <path d="M-8,52 L-12,86 M0,52 L0,92 M8,52 L12,86" stroke="#ffd34d" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

const Burst: React.FC<{ x: number; y: number; p: number; c: string }> = ({ x, y, p, c }) => (
  <g transform={`translate(${x} ${y})`} opacity={1 - p * p}>
    {Array.from({ length: 18 }).map((_, i) => {
      const a = (i / 18) * Math.PI * 2, r0 = 40 + p * 150, r1 = r0 + 70 * (1 - p * 0.6);
      return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0 + p * p * 60} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1 + p * p * 60} stroke={c} strokeWidth={9 * (1 - p * 0.6)} strokeLinecap="round" />;
    })}
    <circle r={10 * (1 - p)} fill="#fff" />
  </g>
);

const Map2: React.FC<{ spin: number }> = ({ spin }) => {
  const o = useOut(1);
  return (
    <g transform={`rotate(${spin})`}>
      <path d="M-120,-80 L-40,-90 L40,-78 L120,-88 L124,78 L40,90 L-40,78 L-124,86Z" fill="#f6e3b0" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-40,-90 L-40,78 M40,-78 L40,90" stroke="#d9c186" strokeWidth={5} />
      <path d="M-96,40 Q-60,-40 -10,10 T70,-20 T100,30" fill="none" stroke="#d7403f" strokeWidth={6} strokeDasharray="12 10" strokeLinecap="round" />
      <path d="M80,18 l24,24 M104,18 l-24,24" stroke="#d7403f" strokeWidth={9} strokeLinecap="round" />
      <circle cx={-96} cy={42} r={8} fill="#4a6fc9" stroke={INK} strokeWidth={o * 0.7} />
      <path d="M-70,-50 l14,-20 l14,20Z M-30,-44 l10,-14 l10,14Z" fill="#8c93a6" stroke={INK} strokeWidth={o * 0.6} strokeLinejoin="round" />
    </g>
  );
};

export const Balloon5: React.FC<{ x: number; y: number; lt: number }> = ({ x, y, lt }) => {
  const o = useOut(1.1);
  const by = y + Math.sin(lt * 2) * 14;
  return (
    <g transform={`translate(${x} ${by}) rotate(${Math.sin(lt * 1.6) * 5})`}>
      <path d={`M0,150 C-20,200 20,230 0,300`} fill="none" stroke={INK} strokeWidth={6} />
      <ellipse cx={0} cy={0} rx={120} ry={150} fill="#ff5fa2" stroke={INK} strokeWidth={o} />
      <path d="M-70,-90 Q-80,-30 -60,20" fill="none" stroke="#ffb3d6" strokeWidth={14} strokeLinecap="round" />
      <path d="M-14,150 L14,150 L0,168Z" fill="#ff5fa2" stroke={INK} strokeWidth={o * 0.8} strokeLinejoin="round" />
      <text x={0} y={52} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={190} fill="#fff" stroke={INK} strokeWidth={14} paintOrder="stroke fill">5</text>
    </g>
  );
};

const FloorShoes: React.FC<{ x: number; y: number; lt: number }> = ({ x, y, lt }) => {
  const bob = Math.sin(lt * 2.4) * 5;
  const flap = Math.sin(lt * 3) * 6;
  return (
    <g transform={`translate(${x} ${y - 32 + bob})`} style={{ filter: "drop-shadow(0 0 22px rgba(255,214,120,0.95)) drop-shadow(0 0 46px rgba(255,122,217,0.85))" }}>
      <ellipse cx={70} cy={42 - bob} rx={150} ry={16} fill="#000" opacity={0.28} />
      <g transform="translate(120 4) rotate(-5)">
        <Wing at={[0, 0]} angle={228} len={170} flap={flap} />
        <Shoe at={[0, 0]} angle={0} />
      </g>
      <g transform="translate(0 0) rotate(3)">
        <Wing at={[0, 0]} angle={238} len={190} flap={-flap} />
        <Shoe at={[0, 0]} angle={0} />
      </g>
    </g>
  );
};

export const Props: React.FC<{ defs: PropDef[]; t: number; lt: number; u: number }> = ({ defs, t, lt, u }) => (
  <g>
    {defs.map((d, k) => {
      switch (d.type) {
        case "birds":
          return <g key={k}>{Array.from({ length: d.n }).map((_, i) => {
            const x = 960 - d.dir * 1300 + d.dir * (lt * d.speed + i * 150) + (rand(i) - 0.5) * 80;
            return <Bird key={i} x={x} y={d.y + (i % 3) * 60 + Math.sin(lt * 2 + i) * 20} s={d.s ?? 1} flap={lt * 10 + i} dir={d.dir} />;
          })}</g>;
        case "sparks":
          return <Sparks key={k} x={d.x} y={d.y} t={t} n={d.n ?? 26} spread={d.spread ?? 260} rise={d.rise ?? 380} />;
        case "toys":
          return <g key={k}>{Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + lt * (d.spin ?? 1.4);
            return <g key={i} transform={`translate(${d.cx + Math.cos(a) * d.r * 1.25} ${d.cy + Math.sin(a) * d.r * 0.8}) rotate(${lt * 90 + i * 40})`}><Toy kind={i % 5} /></g>;
          })}</g>;
        case "stickers":
          return <g key={k}>{[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + lt * 1.1, pop = clamp((lt - i * 0.25) * 4);
            return <g key={i} transform={`translate(${d.cx + Math.cos(a) * d.r * 1.3} ${d.cy + Math.sin(a) * d.r * 0.55}) scale(${pop})`}><Sticker kind={i} /></g>;
          })}</g>;
        case "lanterns":
          return <g key={k}>{Array.from({ length: d.n }).map((_, i) => {
            const per = 7 + rand(i) * 4, ph = ((lt + rand(i + 4) * per) % per) / per;
            return <Lantern key={i} x={(d.x0 ?? 100) + rand(i + 2) * ((d.x1 ?? 1820) - (d.x0 ?? 100)) + Math.sin(lt + i) * 26} y={1200 - ph * 1500} c={["#ff5f6a", "#ffb02e", "#ff7ad9"][i % 3]} s={0.8 + rand(i + 6) * 0.7} />;
          })}</g>;
        case "splash":
          return <g key={k}>{Array.from({ length: 14 }).map((_, i) => {
            const ph = (lt * 1.6 + rand(i) * 0.3) % 1, a = -Math.PI / 2 + (rand(i + 3) - 0.5) * 2.2;
            return <circle key={i} cx={d.x + Math.cos(a) * ph * 160} cy={d.y + Math.sin(a) * ph * 160 + ph * ph * 140} r={9 * (1 - ph)} fill="#bfe8ff" stroke={INK} strokeWidth={2} />;
          })}</g>;
        case "shootingStars":
          return <g key={k}>{Array.from({ length: d.n }).map((_, i) => {
            const ph = (lt * 0.9 + rand(i) * 1) % 1.6;
            const x = 1900 - ph * 1500 + i * 120, y = 100 + rand(i + 2) * 300 + ph * 380;
            return <g key={i} opacity={clamp(1 - ph / 1.4)}><line x1={x} y1={y} x2={x + 220} y2={y - 150} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} /><path d={star4} transform={`translate(${x} ${y}) scale(22)`} fill={PAL.yellow} stroke={INK} strokeWidth={0.1} /></g>;
          })}</g>;
        case "floorShoes":
          return <FloorShoes key={k} x={d.x} y={d.y} lt={lt} />;
        case "embers":
          return <g key={k}>{Array.from({ length: d.n ?? 24 }).map((_, i) => {
            const per = 1.1 + rand(i) * 1.1, ph = ((lt + rand(i + 3) * per) % per) / per;
            const px = d.x + (rand(i + 7) - 0.5) * 340 + Math.sin(lt * 4 + i) * 16, py = d.y - ph * (260 + rand(i + 9) * 260);
            const r = (8 + rand(i + 11) * 12) * (1 - ph * 0.7);
            return <path key={i} d={`M0,${-r * 1.6} Q${r},${-r * 0.2} 0,${r} Q${-r},${-r * 0.2} 0,${-r * 1.6}Z`} transform={`translate(${px} ${py})`} fill={["#ff5a1f", "#ffb02e", "#ffe14d"][i % 3]} stroke={INK} strokeWidth={2} />;
          })}</g>;
        case "map": {
          const e = u * u * (3 - 2 * u);
          return <g key={k} transform={`translate(${d.x0 + (d.x1 - d.x0) * e} ${d.y0 + (d.y1 - d.y0) * e}) scale(${d.s0 + (d.s1 - d.s0) * e})`}><Map2 spin={Math.sin(lt * 3.4) * 14 + u * 120} /></g>;
        }
        case "balloon5":
          return <Balloon5 key={k} x={d.x} y={d.y} lt={lt} />;
        case "bubbles":
          return <g key={k}>{Array.from({ length: d.n }).map((_, i) => {
            const per = 5 + rand(i) * 3, ph = ((lt + rand(i + 4) * per) % per) / per;
            const r = 60 + rand(i + 6) * 50;
            return (
              <g key={i} transform={`translate(${160 + rand(i + 2) * 1600 + Math.sin(lt * 1.5 + i) * 30} ${1180 - ph * 1400}) scale(${r / 62})`}>
                <circle r={62} fill="#bfe8ff" opacity={0.35} stroke={INK} strokeWidth={5} />
                <path d="M-40,-24 Q-30,-44 -8,-48" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
                <g transform="scale(0.55)"><Sticker kind={i % 3} /></g>
              </g>
            );
          })}</g>;
        case "fireworks":
          return <g key={k}>{Array.from({ length: d.n }).map((_, i) => {
            const per = 1.8, ph = ((lt + i * 0.55) % per) / per;
            return <Burst key={i} x={300 + ((i * 397) % 1300)} y={160 + ((i * 211) % 300)} p={ph} c={COLS[i % 5]} />;
          })}</g>;
      }
    })}
  </g>
);
