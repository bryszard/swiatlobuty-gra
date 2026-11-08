import React from "react";
import { interpolateColors } from "remotion";
import { INK, useOut } from "./ink";
import { Twinkle } from "./shapes";
import { clamp, keyed, rand, satAt } from "../data";

export const roomLight = (t: number) => keyed(t, [[0, 0], [8, 0.03], [16, 0.12], [24, 0.32], [32, 0.54], [40, 0.78], [46, 1], [213, 0.55], [232, 0], [255, 0]]);
/** 0 asleep .. 1 awake (sleep -> wake pose mix) */
export const wakeAt = (t: number) => keyed(t, [[0, 0], [17, 0], [34, 1], [213, 1], [222, 0], [255, 0]]);

/** 0 closed .. 1 wide open (Ala flies out at ~44s) */
export const winOpenAt = (t: number) => keyed(t, [[0, 0], [41.4, 0], [43.6, 1], [213, 1], [217.5, 0], [255, 0]]);

/** a gust blows in when Ala shoots out of the window (~44.4 s) */
export const gustAt = (t: number) => Math.exp(-(((t - 44.6) / 1.1) ** 2));

export const HIP = { x: 540, y: 690 };

const Sashes: React.FC<{ open: number; o: number }> = ({ open, o }) => {
  const ang = (open * 74 * Math.PI) / 180, c = Math.cos(ang), sn = Math.sin(ang);
  const yT = 168, yB = 632, w = 232, dy = 30 * sn;
  const sash = (hx: number, dir: 1 | -1) => {
    const ox = hx + dir * w * c;
    const pts = `${hx},${yT} ${ox},${yT - dy} ${ox},${yB + dy} ${hx},${yB}`;
    const midY = (yT + yB) / 2;
    return (
      <g>
        <polygon points={pts} fill="rgba(200,230,255,0.22)" stroke={INK} strokeWidth={14 + o * 2} strokeLinejoin="round" />
        <polygon points={pts} fill="none" stroke="#f4efe6" strokeWidth={10} strokeLinejoin="round" />
        <line x1={hx} y1={midY} x2={ox} y2={midY} stroke="#f4efe6" strokeWidth={8} />
        <line x1={hx} y1={midY} x2={ox} y2={midY} stroke={INK} strokeWidth={2} opacity={0.5} />
      </g>
    );
  };
  return <g>{sash(1208, 1)}{sash(1672, -1)}</g>;
};

export const RoomBack: React.FC<{ t: number }> = ({ t }) => {
  const o = useOut(1);
  const sun = roomLight(t);
  const wall = interpolateColors(sun, [0, 0.5, 1], ["#2c3566", "#8d6f9e", "#f2cf9b"]);
  const floor = interpolateColors(sun, [0, 1], ["#3a2f45", "#c08a5a"]);
  const skyTop = interpolateColors(sun, [0, 0.5, 1], ["#0b1033", "#6a5fd0", "#56b8ff"]);
  const skyBot = interpolateColors(sun, [0, 0.5, 1], ["#1b2a63", "#ff8a6b", "#ffe9a0"]);
  // the sun climbs along an arch: left horizon -> up and to the right
  const ph = Math.PI - clamp(sun) * (Math.PI - 1.08);
  const sunX = 1440 + 230 * Math.cos(ph), sunY = 700 - 470 * Math.sin(ph);
  const s1 = Math.min(satAt(t), 1);
  // the scene is globally dimmed while dark; cancel most of that inside the window so the sky itself keeps brightening
  const winFix = 1 / (0.3 + 0.7 * s1);
  const dayGlow = clamp((sun - 0.1) / 0.9);
  const night = clamp(1 - sun * 1.7);
  const open = winOpenAt(t);
  const gust = gustAt(t);
  return (
    <g>
      <defs>
        <linearGradient id="skyRoom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="1" stopColor={skyBot} /></linearGradient>
        <clipPath id="winClip"><rect x={1208} y={168} width={464} height={464} rx={6} /></clipPath>
        <radialGradient id="winGlow"><stop offset="0" stopColor="#ffe9a8" stopOpacity={0.55} /><stop offset="1" stopColor="#ffe9a8" stopOpacity={0} /></radialGradient>
        <linearGradient id="shaftR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b0" stopOpacity={0.55} /><stop offset="1" stopColor="#fff3b0" stopOpacity={0.05} /></linearGradient>
      </defs>
      <rect x={-1800} y={-1400} width={5600} height={2200} fill={wall} />
      <rect x={-1800} y={800} width={5600} height={800} fill={floor} />
      <rect x={-1800} y={776} width={5600} height={34} fill={INK} opacity={0.5} />
      {[860, 940, 1020].map((y) => <line key={y} x1={-1800} x2={3800} y1={y} y2={y} stroke={INK} strokeWidth={5} opacity={0.3} />)}
      {Array.from({ length: 26 }).map((_, i) => <circle key={i} cx={rand(i + 1) * 1100 + 40} cy={rand(i + 50) * 330 + 40} r={5} fill="#fff" opacity={0.1 + 0.1 * night} />)}
      <rect x={1180} y={140} width={520} height={520} rx={14} fill="#f4efe6" stroke={INK} strokeWidth={o * 1.4} />
      <g clipPath="url(#winClip)" style={{ filter: `brightness(${(1 + (winFix - 1) * 0.9).toFixed(3)}) saturate(${(1 + (1 / Math.max(satAt(t), 0.25) - 1) * 0.9).toFixed(3)})` }}>
        <rect x={1208} y={168} width={464} height={464} fill="url(#skyRoom)" />
        <Twinkle n={14} t={t} y0={180} y1={420} w={0} />
        {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={1220 + rand(i + 9) * 440} cy={180 + rand(i + 3) * 250} r={2 + rand(i) * 3} fill="#fff" opacity={night * (0.5 + 0.5 * Math.sin(t * 2 + i))} />)}
        <circle cx={1330} cy={290} r={44} fill="#fffbe0" stroke={INK} strokeWidth={o} opacity={night} />
        <circle cx={1350} cy={278} r={40} fill={skyTop} opacity={night} />
        <circle cx={sunX} cy={sunY} r={150} fill="#ffcf6b" opacity={0.25 + 0.3 * sun} />
        <circle cx={sunX} cy={sunY} r={100} fill="#ffe08a" opacity={0.35 + 0.3 * sun} />
        <circle cx={sunX} cy={sunY} r={56} fill={interpolateColors(sun, [0, 0.5, 1], ["#ff7a2e", "#ffa93a", "#ffe45c"])} stroke={INK} strokeWidth={o} />
        <path d="M1208 600 Q1330 500 1440 560 T1672 540 V632 H1208Z" fill={interpolateColors(sun, [0, 1], ["#10172f", "#4a9a5a"])} stroke={INK} strokeWidth={o} />
      </g>
      <Sashes open={open} o={o} />
      {/* glass sheen on the closed panes */}
      <g clipPath="url(#winClip)" opacity={0.5 * (1 - open)}>
        <polygon points="1260,168 1330,168 1210,420 1208,330" fill="#fff" opacity={0.22} />
        <polygon points="1380,168 1410,168 1290,520 1262,520" fill="#fff" opacity={0.16} />
        <polygon points="1500,632 1580,632 1672,420 1672,350" fill="#fff" opacity={0.12} />
      </g>
      <circle cx={1440} cy={400} r={760} fill="url(#winGlow)" opacity={dayGlow} style={{ mixBlendMode: "screen" }} />
      <path transform={`translate(${-Math.sin(t * 1.7) * 9 * open - gust * 70} 0)`} d={`M1150 120 Q${1215 - gust * 60} 380 ${1170 - gust * 30} 690 L1110 690 Q${1130 - gust * 40} 380 1100 120Z`} fill="#9b4fa8" stroke={INK} strokeWidth={o} />
      <path transform={`translate(${Math.sin(t * 1.7 + 1) * 9 * open - gust * 90} 0)`} d={`M1730 120 Q${1665 - gust * 50} 380 ${1710 - gust * 40} 690 L1770 690 Q${1750 - gust * 40} 380 1780 120Z`} fill="#9b4fa8" stroke={INK} strokeWidth={o} />
      <polygon points="1208,640 1672,640 1560,1080 760,1080" fill="url(#shaftR)" opacity={sun} style={{ mixBlendMode: "screen" }} />
      {/* bed frame, mattress, pillow */}
      <rect x={80} y={420} width={50} height={470} rx={12} fill="#7a4b2e" stroke={INK} strokeWidth={o} />
      <rect x={100} y={730} width={770} height={150} rx={14} fill="#8b5a3c" stroke={INK} strokeWidth={o} />
      <rect x={830} y={840} width={44} height={80} fill="#7a4b2e" stroke={INK} strokeWidth={o} />
      <rect x={110} y={660} width={750} height={90} rx={30} fill="#f3eefb" stroke={INK} strokeWidth={o} />
      <ellipse cx={330} cy={655} rx={130} ry={46} fill="#cfe3ff" stroke={INK} strokeWidth={o} />
      <rect x={-1800} y={-1400} width={5600} height={3600} fill="#ffd9a0" opacity={0.2 * sun} style={{ mixBlendMode: "screen" }} />
    </g>
  );
};

/** Blanket drawn in front of Ala; shoes stick out beyond it. */
export const RoomBlanket: React.FC<{ t: number; flat?: boolean }> = ({ t, flat }) => {
  const o = useOut(1);
  const wake = flat ? 1 : wakeAt(t);
  const drop = wake * 34;
  const L = 390 + wake * 110;
  const breathe = Math.sin(t * 1.6) * 4 * (1 - wake);
  if (flat) {
    return (
      <g>
        <path d={`M390,776 L390,722 Q560,704 780,724 L780,776Z`} fill="#7a3fa0" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
        <path d="M420,740 Q580,724 760,742" fill="none" stroke="#b27fd6" strokeWidth={10} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <path d={`M${L},775 Q${L - 10},${676 + drop} ${L + 80},${672 + drop + breathe} Q540,${650 + drop * 0.6 + breathe} 770,${706}  L780,775Z`} fill="#7a3fa0" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d={`M${L + 100},${712 + drop} Q560,${690 + drop * 0.5} 760,${736}`} fill="none" stroke="#b27fd6" strokeWidth={10} strokeLinecap="round" />
      
    </g>
  );
};
