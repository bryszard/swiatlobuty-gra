import React from "react";
import { INK, useOut, Cloud } from "./ink";
import { SceneProps } from "./shapes";
import { rand } from "../data";

const BRICK = "#c9533f", BRICK_D = "#a63f34", CREAM = "#f6e3a8", GOLD = "#ffcf4a", ROOF = "#b04a3a";

/** St. Mary's Basilica: two towers of different height - the taller one with a spire and gold crown. */
const Mariacki: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const o = useOut(1);
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* nave */}
      <rect x={-120} y={-170} width={240} height={170} fill={BRICK} stroke={INK} strokeWidth={o} />
      <path d={`M-130,-170 L0,-250 L130,-170Z`} fill={ROOF} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      {[-80, -30, 30, 80].map((wx) => <path key={wx} d={`M${wx - 14},-60 L${wx - 14},-120 Q${wx},-150 ${wx + 14},-120 L${wx + 14},-60Z`} fill="#ffe9a8" stroke={INK} strokeWidth={o * 0.7} />)}
      {/* tall tower (left) */}
      <rect x={-196} y={-440} width={70} height={440} fill={BRICK_D} stroke={INK} strokeWidth={o} />
      <rect x={-204} y={-470} width={86} height={34} fill={BRICK} stroke={INK} strokeWidth={o} />
      {[-190, -170, -150, -130].map((bx) => <rect key={bx} x={bx} y={-486} width={10} height={20} fill={BRICK} stroke={INK} strokeWidth={o * 0.7} />)}
      <path d="M-196,-486 L-161,-640 L-126,-486Z" fill="#4a8f8a" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <circle cx={-161} cy={-650} r={9} fill={GOLD} stroke={INK} strokeWidth={o * 0.8} />
      {[-380, -300].map((wy) => <path key={wy} d={`M-174,${wy + 40} L-174,${wy} Q-161,${wy - 24} -148,${wy} L-148,${wy + 40}Z`} fill="#ffe9a8" stroke={INK} strokeWidth={o * 0.7} />)}
      {/* short tower (right) with gold-topped dome helm */}
      <rect x={126} y={-380} width={74} height={380} fill={BRICK_D} stroke={INK} strokeWidth={o} />
      <rect x={120} y={-404} width={86} height={30} fill={BRICK} stroke={INK} strokeWidth={o} />
      <path d="M124,-404 Q163,-520 202,-404Z" fill="#4a8f8a" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M150,-470 Q163,-520 176,-470Z" fill={GOLD} stroke={INK} strokeWidth={o * 0.8} />
      <path d="M163,-512 L163,-550" stroke={INK} strokeWidth={o} /><circle cx={163} cy={-556} r={7} fill={GOLD} stroke={INK} strokeWidth={o * 0.8} />
      {[-300, -220].map((wy) => <path key={wy} d={`M150,${wy + 36} L150,${wy} Q163,${wy - 22} 176,${wy} L176,${wy + 36}Z`} fill="#ffe9a8" stroke={INK} strokeWidth={o * 0.7} />)}
    </g>
  );
};

/** Sukiennice (Cloth Hall): long arcaded hall with a decorated attic. */
const Sukiennice: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const o = useOut(1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-330} y={-130} width={660} height={130} fill={CREAM} stroke={INK} strokeWidth={o} />
      <rect x={-340} y={-176} width={680} height={46} fill="#f0cf86" stroke={INK} strokeWidth={o} />
      {Array.from({ length: 17 }).map((_, i) => <path key={i} d={`M${-330 + i * 40 + 2},-176 q18,-44 36,0Z`} fill="#f6e3a8" stroke={INK} strokeWidth={o * 0.7} />)}
      {Array.from({ length: 11 }).map((_, i) => <path key={i} d={`M${-300 + i * 56},0 L${-300 + i * 56},-60 Q${-286 + i * 56},-96 ${-272 + i * 56},-60 L${-272 + i * 56},0Z`} fill="#8a4a32" stroke={INK} strokeWidth={o * 0.8} />)}
      {[-330, 330].map((tx) => <g key={tx}><rect x={tx - 20} y={-250} width={40} height={124} fill={CREAM} stroke={INK} strokeWidth={o} /><path d={`M${tx - 26},-250 L${tx},-310 L${tx + 26},-250Z`} fill={ROOF} stroke={INK} strokeWidth={o} strokeLinejoin="round" /></g>)}
    </g>
  );
};

const Wawel: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const o = useOut(1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-420,0 Q-300,-230 -60,-250 L240,-250 Q420,-230 520,0Z" fill="#5cc15f" stroke={INK} strokeWidth={o} />
      <path d="M-300,-150 Q0,-210 360,-150" fill="none" stroke="#3a9a4d" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      {/* castle wall + buildings */}
      <rect x={-200} y={-330} width={520} height={90} fill="#e7c88e" stroke={INK} strokeWidth={o} />
      {Array.from({ length: 13 }).map((_, i) => <rect key={i} x={-200 + i * 40} y={-350} width={22} height={22} fill="#e7c88e" stroke={INK} strokeWidth={o * 0.7} />)}
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-176 + i * 86} y={-312} width={20} height={34} rx={8} fill="#7a5a8a" stroke={INK} strokeWidth={o * 0.7} />)}
      {/* cathedral with golden dome */}
      <rect x={20} y={-470} width={130} height={140} fill="#f2e0b0" stroke={INK} strokeWidth={o} />
      <path d="M12,-470 L85,-540 L158,-470Z" fill={ROOF} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <rect x={-8} y={-430} width={60} height={100} fill="#f2e0b0" stroke={INK} strokeWidth={o} />
      <path d="M-18,-430 Q22,-520 62,-430Z" fill={GOLD} stroke={INK} strokeWidth={o} />
      <path d="M22,-505 L22,-535" stroke={INK} strokeWidth={o} /><circle cx={22} cy={-540} r={6} fill={GOLD} stroke={INK} strokeWidth={o * 0.8} />
      {/* Sigismund tower */}
      <rect x={176} y={-520} width={56} height={190} fill="#d8b7a2" stroke={INK} strokeWidth={o} />
      <path d="M170,-520 L204,-610 L238,-520Z" fill={ROOF} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-170,-330 L-170,-420 L-130,-470 L-90,-420 L-90,-330Z" fill="#d8b7a2" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-182,-420 L-130,-500 L-78,-420Z" fill={ROOF} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
    </g>
  );
};

/** Wawel dragon statue by the river. */
export const DragonStatue: React.FC<{ x: number; y: number; t: number; fire?: boolean }> = ({ x, y, t, fire }) => {
  const o = useOut(0.9);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-120,0 Q-110,-70 -40,-76 Q-10,-120 40,-96 Q70,-130 106,-100 L130,-110 L124,-90 L146,-80 L120,-70 Q92,-30 70,0Z" fill="#59b85a" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-120,-4 Q-160,-30 -190,-8 Q-150,-12 -128,12Z" fill="#59b85a" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-30,-80 L-20,-124 L-6,-84 L10,-132 L24,-92 L44,-120 L50,-92Z" fill="#ff7ad9" stroke={INK} strokeWidth={o * 0.8} strokeLinejoin="round" />
      <circle cx={112} cy={-98} r={5} fill="#fff" stroke={INK} strokeWidth={2} /><circle cx={113} cy={-98} r={2.4} fill={INK} />
      {fire ? <path d={`M146,-82 Q${200 + Math.sin(t * 12) * 12},-110 ${250 + Math.sin(t * 9) * 14},-84 Q200,-60 146,-72Z`} fill="#ffb02e" stroke={INK} strokeWidth={o * 0.8} /> : null}
    </g>
  );
};

const Tenement: React.FC<{ x: number; w: number; h: number; c: string; seed: number }> = ({ x, w, h, c, seed }) => {
  const o = useOut(0.9);
  const rows = Math.max(2, Math.floor(h / 60)), cols = Math.max(2, Math.floor(w / 46));
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={-h} width={w} height={h} fill={c} stroke={INK} strokeWidth={o} />
      <path d={`M-6,${-h} L${w / 2},${-h - 46 - rand(seed) * 26} L${w + 6},${-h}Z`} fill={rand(seed + 3) > 0.5 ? ROOF : "#7a4a6a"} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((_, cI) => (
        <rect key={`${r}-${cI}`} x={12 + cI * ((w - 24) / cols) + 2} y={-h + 14 + r * 56} width={((w - 24) / cols) - 10} height={30} rx={4} fill="#fff4cf" stroke={INK} strokeWidth={o * 0.6} />
      )))}
    </g>
  );
};

export const KrakowBack: React.FC<SceneProps> = ({ t, scroll }) => {
  const o = useOut(1);
  const px = (k: number) => Math.sin(scroll * 0.0015) * k;
  const cols = ["#ffd9a0", "#f7a9a0", "#a9d6f0", "#c8e6a0", "#f6c1e0", "#ffe08a"];
  return (
    <g>
      <defs>
        <linearGradient id="skyK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3da5f5" /><stop offset="0.7" stopColor="#bfe6ff" /><stop offset="1" stopColor="#fff0d0" /></linearGradient>
      </defs>
      <rect x={-1800} y={-1400} width={5600} height={3600} fill="url(#skyK)" />
      <circle cx={300} cy={190} r={90} fill="#ffe45c" stroke={INK} strokeWidth={o} />
      <Cloud x={700} y={190} s={1} /><Cloud x={1280} y={120} s={0.8} /><Cloud x={1700} y={260} s={1.1} />
      <g transform={`translate(${px(10)} 0)`}>
        <Wawel x={1380} y={720} />
      </g>
      {/* Vistula */}
      <rect x={-200} y={716} width={2400} height={96} fill="#4aa8e8" stroke={INK} strokeWidth={o} />
      {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${60 + i * 170},${742 + (i % 3) * 22} q22,-14 44,0 t44,0`} fill="none" stroke="#bfe8ff" strokeWidth={5} strokeLinecap="round" opacity={0.85 + 0.15 * Math.sin(t * 2 + i)} />)}
      <DragonStatue x={1010} y={760} t={t} />
      <g transform={`translate(${px(6)} 0)`}>
        <Mariacki x={300} y={850} />
        <Sukiennice x={820} y={870} />
      </g>
      {/* tenement row */}
      <g transform="translate(0 1010)">
        {Array.from({ length: 14 }).map((_, i) => <Tenement key={i} x={-30 + i * 150} w={140} h={100 + rand(i + 5) * 70} c={cols[i % cols.length]} seed={i} />)}
      </g>
      <rect x={-200} y={1010} width={2400} height={220} fill="#9a8fa8" stroke={INK} strokeWidth={o} />
    </g>
  );
};
