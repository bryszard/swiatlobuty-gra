import React from "react";
import { INK, useOut, Cloud } from "./ink";
import { SceneProps, Twinkle } from "./shapes";
import { rand } from "../data";

const Olive: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const o = useOut(0.8);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14,30 Q-6,-10 -20,-40 Q-6,-30 4,-44 Q8,-10 18,30Z" fill="#7a5530" stroke={INK} strokeWidth={o / s} strokeLinejoin="round" />
      {[[-40, -60, 38], [10, -80, 46], [52, -52, 36], [-6, -50, 40]].map(([cx, cy, r], i) => <circle key={`a${i}`} cx={cx} cy={cy} r={r} fill={INK} stroke={INK} strokeWidth={(o * 2) / s} />)}
      {[[-40, -60, 38], [10, -80, 46], [52, -52, 36], [-6, -50, 40]].map(([cx, cy, r], i) => <circle key={`b${i}`} cx={cx} cy={cy} r={r} fill={i % 2 ? "#8da36e" : "#7a9460"} />)}
    </g>
  );
};

const Agave: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const o = useOut(0.8);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-60, -35, -12, 12, 35, 60].map((a, i) => (
        <path key={i} d={`M0,0 Q${a * 0.5 - 8},-60 ${a * 1.1},-100 Q${a * 0.5 + 10},-50 0,0Z`} fill={i % 2 ? "#5f9a76" : "#4d8a68"} stroke={INK} strokeWidth={o / s} strokeLinejoin="round" />
      ))}
    </g>
  );
};

export const SpainBack: React.FC<SceneProps> = ({ t, scroll }) => {
  const o = useOut(1);
  const px = (k: number) => Math.sin(scroll * 0.002) * k;
  const rays = Array.from({ length: 28 }).map((_, i) => {
    const a = (i / 28) * Math.PI * 2, r1 = i % 2 ? 210 : 330 + Math.sin(t * 1.5 + i) * 18, r2 = 130;
    return `${520 + Math.cos(a - 0.1) * r2},${250 + Math.sin(a - 0.1) * r2} ${520 + Math.cos(a) * r1},${250 + Math.sin(a) * r1} ${520 + Math.cos(a + 0.1) * r2},${250 + Math.sin(a + 0.1) * r2}`;
  });
  return (
    <g>
      <defs>
        <linearGradient id="skyP" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1038" /><stop offset="0.5" stopColor="#3a2a73" /><stop offset="0.8" stopColor="#c8527f" /><stop offset="1" stopColor="#ff9a56" />
        </linearGradient>
        <radialGradient id="corona"><stop offset="0" stopColor="#fff6c8" stopOpacity={0.95} /><stop offset="0.45" stopColor="#ffd26b" stopOpacity={0.45} /><stop offset="1" stopColor="#ffb347" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-1800} y={-1400} width={5600} height={3600} fill="url(#skyP)" />
      <Twinkle n={60} t={t} y0={0} y1={560} />
      {/* eclipse */}
      <g transform={`translate(${px(-10)} 0)`}>
        <circle cx={520} cy={250} r={360} fill="url(#corona)" />
        <polygon points={rays.join(" ")} fill="#ffe9a8" opacity={0.55} />
        <polygon points={rays.map((_, i) => `${520 + Math.cos((i / 28) * Math.PI * 2) * 190},${250 + Math.sin((i / 28) * Math.PI * 2) * 190}`).join(" ")} fill="#fff1c0" opacity={0.5} />
        <circle cx={520} cy={250} r={122} fill="#0a0818" stroke="#ffe9a8" strokeWidth={o * 1.6} />
        <path d="M0,-1 Q0.14,-0.14 1,0 Q0.14,0.14 0,1 Q-0.14,0.14 -1,0 Q-0.14,-0.14 0,-1Z" transform={`translate(${520 + 98} ${250 - 70}) scale(${38 + Math.sin(t * 3) * 6})`} fill="#fff" />
      </g>
      <Cloud x={1100} y={230} s={1} fill="#4a3d86" />
      <Cloud x={1560} y={120} s={0.8} fill="#3d3274" />
      {/* distant mountains + hills */}
      <path d="M-200,700 L180,520 L420,640 L760,470 L1100,660 L1400,540 L1760,680 L2120,600 L2120,900 L-200,900Z" fill="#6d5aa8" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-200,760 Q300,640 700,740 T1500,720 T2120,740 L2120,1000 L-200,1000Z" fill="#c79a45" stroke={INK} strokeWidth={o} />
      {Array.from({ length: 16 }).map((_, i) => <Olive key={i} x={40 + i * 126 + rand(i) * 40} y={800 + rand(i + 4) * 24} s={0.55 + rand(i + 2) * 0.2} />)}
      {/* chapel hill */}
      <g transform={`translate(${px(5)} 0)`}>
        <path d="M640,1000 Q700,640 1080,600 Q1460,620 1560,1000Z" fill="#d6a94c" stroke={INK} strokeWidth={o} />
        <g transform="translate(1040 600)">
          <rect x={-130} y={-190} width={260} height={190} fill="#f2c56a" stroke={INK} strokeWidth={o} />
          {[0, 1, 2, 3, 4].map((r) => Array.from({ length: 6 }).map((_, c) => <rect key={`${r}${c}`} x={-124 + c * 42 + (r % 2 ? 20 : 0)} y={-184 + r * 36} width={38} height={32} fill="none" stroke="rgba(150,100,30,0.45)" strokeWidth={3} />))}
          <path d="M-150,-186 L-80,-262 L150,-262 L150,-186Z" fill="#c4583a" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
          <rect x={-80} y={-340} width={60} height={92} fill="#f2c56a" stroke={INK} strokeWidth={o} />
          <path d="M-84,-340 L-50,-372 L-16,-340Z" fill="#c4583a" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
          <path d="M-66,-286 Q-50,-320 -34,-286Z" fill="#2a1d40" stroke={INK} strokeWidth={o * 0.7} />
          <path d="M-58,-290 q8,-18 16,0z" fill="#ffd34d" stroke={INK} strokeWidth={o * 0.5} />
          <rect x={-53} y={-408} width={6} height={36} fill={INK} /><rect x={-64} y={-398} width={28} height={6} fill={INK} />
          <path d="M-34,0 L-34,-76 Q0,-120 34,-76 L34,0Z" fill="#6b4226" stroke={INK} strokeWidth={o} />
          <path d="M70,-120 Q82,-146 94,-120 L94,-90 L70,-90Z" fill="#2a1d40" stroke={INK} strokeWidth={o * 0.7} />
        </g>
        <Olive x={1300} y={660} s={1.3} />
        <Olive x={830} y={690} s={1.1} />
      </g>
      {/* foreground slope for Ala */}
      <path d="M-200,1100 L-200,900 Q500,780 1100,860 Q1600,900 2120,820 L2120,1100Z" fill="#b8913e" stroke={INK} strokeWidth={o} />
      {Array.from({ length: 30 }).map((_, i) => {
        const x = rand(i) * 1920, y = 880 + rand(i + 3) * 190;
        return <path key={i} d={`M${x},${y} l-6,-24 M${x},${y} l2,-28 M${x},${y} l8,-22`} stroke="#7a5a20" strokeWidth={4} strokeLinecap="round" fill="none" />;
      })}
      <Agave x={150} y={960} s={1.2} />
      <Agave x={1780} y={940} s={1.0} />
    </g>
  );
};
