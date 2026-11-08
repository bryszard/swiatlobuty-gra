import React from "react";
import { INK, useOut, Cloud } from "./ink";
import { SceneProps } from "./shapes";

const STONE = "#e6c98a", STONE_D = "#c9a96a", GOLD = "#ffcf4a", ROOFG = "#5f8f8a";

/** Elizabeth Tower ("Big Ben"): clock, belfry, pyramid roof. */
const BigBen: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const o = useOut(1);
  const sec = (t * 6) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-62} y={-300} width={124} height={300} fill={STONE} stroke={INK} strokeWidth={o} />
      {[-30, 30].map((wx) => [-70, -150, -230].map((wy) => <path key={`${wx}${wy}`} d={`M${wx - 10},${wy + 30} L${wx - 10},${wy} Q${wx},${wy - 18} ${wx + 10},${wy} L${wx + 10},${wy + 30}Z`} fill="#8a6a5a" stroke={INK} strokeWidth={o * 0.6} />))}
      <rect x={-72} y={-318} width={144} height={22} fill={STONE_D} stroke={INK} strokeWidth={o} />
      {/* clock block */}
      <rect x={-78} y={-470} width={156} height={156} fill={STONE} stroke={INK} strokeWidth={o} />
      <circle cx={0} cy={-392} r={58} fill="#fffbe8" stroke={INK} strokeWidth={o} />
      <circle cx={0} cy={-392} r={58} fill="none" stroke={GOLD} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={Math.sin((i / 12) * 6.283) * 44} y1={-392 - Math.cos((i / 12) * 6.283) * 44} x2={Math.sin((i / 12) * 6.283) * 52} y2={-392 - Math.cos((i / 12) * 6.283) * 52} stroke={INK} strokeWidth={4} />)}
      <line x1={0} y1={-392} x2={Math.sin(((sec / 60) * Math.PI) / 6) * 26} y2={-392 - Math.cos(((sec / 60) * Math.PI) / 6) * 26} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <line x1={0} y1={-392} x2={Math.sin((sec * Math.PI) / 180) * 40} y2={-392 - Math.cos((sec * Math.PI) / 180) * 40} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {[-70, 70].map((cx) => <rect key={cx} x={cx - 10} y={-480} width={20} height={20} fill={STONE_D} stroke={INK} strokeWidth={o * 0.7} />)}
      {/* belfry + roof */}
      <rect x={-60} y={-560} width={120} height={90} fill={STONE_D} stroke={INK} strokeWidth={o} />
      {[-34, 0, 34].map((wx) => <path key={wx} d={`M${wx - 11},-480 L${wx - 11},-530 Q${wx},-552 ${wx + 11},-530 L${wx + 11},-480Z`} fill="#6a4a4a" stroke={INK} strokeWidth={o * 0.6} />)}
      <path d="M-70,-560 L0,-720 L70,-560Z" fill={ROOFG} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M0,-720 L0,-770" stroke={INK} strokeWidth={o} /><circle cx={0} cy={-776} r={9} fill={GOLD} stroke={INK} strokeWidth={o * 0.8} />
    </g>
  );
};

/** Palace of Westminster: long gothic block with pinnacles. */
const Parliament: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const o = useOut(1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={-190} width={720} height={190} fill={STONE} stroke={INK} strokeWidth={o} />
      <rect x={-10} y={-210} width={740} height={26} fill={STONE_D} stroke={INK} strokeWidth={o} />
      {Array.from({ length: 9 }).map((_, i) => <g key={i}><rect x={20 + i * 78} y={-300} width={26} height={90} fill={STONE} stroke={INK} strokeWidth={o * 0.8} /><path d={`M${14 + i * 78},-300 L${33 + i * 78},-350 L${52 + i * 78},-300Z`} fill={ROOFG} stroke={INK} strokeWidth={o * 0.8} strokeLinejoin="round" /></g>)}
      {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${24 + i * 50},-30 L${24 + i * 50},-120 Q${37 + i * 50},-152 ${50 + i * 50},-120 L${50 + i * 50},-30Z`} fill="#fff4cf" stroke={INK} strokeWidth={o * 0.7} />)}
    </g>
  );
};

const Eye: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const o = useOut(1), R = 235, rot = t * 0.1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0,0 L-70,${R + 150} M0,0 L70,${R + 150}`} stroke={INK} strokeWidth={o * 3} />
      <path d={`M0,0 L-70,${R + 150} M0,0 L70,${R + 150}`} stroke="#e8eef8" strokeWidth={o * 1.5} />
      {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * 6.283 + rot; return <line key={i} x1={0} y1={0} x2={Math.cos(a) * R} y2={Math.sin(a) * R} stroke="#bcd0ea" strokeWidth={3} />; })}
      <circle r={R} fill="none" stroke={INK} strokeWidth={o * 2.6} />
      <circle r={R} fill="none" stroke="#f4f8ff" strokeWidth={o * 1.2} />
      {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * 6.283 + rot; return <g key={i} transform={`translate(${Math.cos(a) * R} ${Math.sin(a) * R})`}><rect x={-14} y={-12} width={28} height={24} rx={10} fill="#8cd3ff" stroke={INK} strokeWidth={o * 0.8} /></g>; })}
      <circle r={16} fill="#fff" stroke={INK} strokeWidth={o} />
    </g>
  );
};

const TowerBridge: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const o = useOut(1), BLUE = "#4d8ad6", TW = "#b9c4d8";
  const tower = (tx: number) => (
    <g transform={`translate(${tx} 0)`}>
      <rect x={-52} y={-360} width={104} height={360} fill={TW} stroke={INK} strokeWidth={o} />
      {[-30, 30].map((wx) => [-120, -200, -280].map((wy) => <path key={`${wx}${wy}`} d={`M${wx - 9},${wy + 30} L${wx - 9},${wy} Q${wx},${wy - 16} ${wx + 9},${wy} L${wx + 9},${wy + 30}Z`} fill="#6a6a8a" stroke={INK} strokeWidth={o * 0.6} />))}
      {[-52, 52].map((cx) => <g key={cx}><rect x={cx - 14} y={-420} width={28} height={64} fill={TW} stroke={INK} strokeWidth={o * 0.8} /><path d={`M${cx - 20},-420 L${cx},-480 L${cx + 20},-420Z`} fill={BLUE} stroke={INK} strokeWidth={o * 0.8} strokeLinejoin="round" /></g>)}
      <path d="M-70,-360 L0,-450 L70,-360Z" fill={BLUE} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* high walkway + chains */}
      <rect x={-200} y={-300} width={400} height={30} fill={BLUE} stroke={INK} strokeWidth={o} />
      <path d="M-440,-60 Q-330,-250 -200,-286 M200,-286 Q330,-250 440,-60" fill="none" stroke={BLUE} strokeWidth={14} strokeLinecap="round" />
      <path d="M-440,-60 Q-330,-250 -200,-286 M200,-286 Q330,-250 440,-60" fill="none" stroke={INK} strokeWidth={4} />
      <rect x={-440} y={-70} width={880} height={26} fill={BLUE} stroke={INK} strokeWidth={o} />
      {tower(-180)}{tower(180)}
    </g>
  );
};

const Terrace: React.FC<{ x: number; w: number; h: number; c: string; seed: number }> = ({ x, w, h, c, seed }) => {
  const o = useOut(0.9);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={-h} width={w} height={h} fill={c} stroke={INK} strokeWidth={o} />
      <rect x={-4} y={-h - 10} width={w + 8} height={14} fill="#ece2d0" stroke={INK} strokeWidth={o * 0.8} />
      {seed % 2 === 0 ? <g><rect x={w * 0.6} y={-h - 52} width={20} height={44} fill="#9a4a3a" stroke={INK} strokeWidth={o * 0.8} /><rect x={w * 0.6 - 3} y={-h - 62} width={26} height={12} fill="#c9533f" stroke={INK} strokeWidth={o * 0.7} /></g> : null}
      {[0, 1].map((r) => [0.2, 0.6].map((cx) => <rect key={`${r}${cx}`} x={w * cx} y={-h + 18 + r * 52} width={w * 0.2} height={34} rx={3} fill="#fff4cf" stroke={INK} strokeWidth={o * 0.6} />))}
    </g>
  );
};

export const LondonBack: React.FC<SceneProps> = ({ t, scroll }) => {
  const o = useOut(1);
  const px = (k: number) => Math.sin(scroll * 0.0015) * k;
  const cols = ["#c9533f", "#b04a3a", "#d8734a", "#a8503f", "#c46a4a"];
  return (
    <g>
      <defs>
        <linearGradient id="skyL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7aa6e8" /><stop offset="0.65" stopColor="#d4e2f8" /><stop offset="1" stopColor="#fdf0e0" /></linearGradient>
      </defs>
      <rect x={-1800} y={-1400} width={5600} height={3600} fill="url(#skyL)" />
      <circle cx={1560} cy={170} r={80} fill="#fff1a8" stroke={INK} strokeWidth={o} />
      <Cloud x={500} y={200} s={1.1} /><Cloud x={1100} y={110} s={0.8} /><Cloud x={1700} y={250} s={1} />
      <g transform={`translate(${px(8)} 0)`}>
        <Eye x={1010} y={500} t={t} />
        <TowerBridge x={1590} y={800} />
      </g>
      <rect x={-200} y={716} width={2400} height={96} fill="#5b9fb0" stroke={INK} strokeWidth={o} />
      {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${60 + i * 170},${742 + (i % 3) * 22} q22,-14 44,0 t44,0`} fill="none" stroke="#cdeef2" strokeWidth={5} strokeLinecap="round" opacity={0.7} />)}
      <g transform={`translate(${px(5)} 0)`}>
        <Parliament x={-60} y={850} />
        <BigBen x={760} y={850} t={t} />
      </g>
      <g transform="translate(0 1010)">
        {Array.from({ length: 14 }).map((_, i) => <Terrace key={i} x={-30 + i * 150} w={140} h={90 + ((i * 37) % 60)} c={cols[i % cols.length]} seed={i} />)}
      </g>
      <rect x={-200} y={1010} width={2400} height={220} fill="#8a8498" stroke={INK} strokeWidth={o} />
    </g>
  );
};
