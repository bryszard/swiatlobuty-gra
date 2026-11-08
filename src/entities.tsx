import React from "react";
import { INK, PAL, star4, useOut } from "./art/ink";
import { Lantern } from "./art/props";
import { LevelId } from "./levels";
import { fontFamily } from "./font";

export const Spark: React.FC<{ t: number; ph: number }> = ({ t, ph }) => {
  const s = 24 + Math.sin(t * 6 + ph) * 3;
  return <g><path d={star4} transform={`scale(${s * 1.35})`} fill="#fff6b0" opacity={0.5} /><path d={star4} transform={`rotate(${Math.sin(t * 3 + ph) * 12}) scale(${s})`} fill={PAL.yellow} stroke={INK} strokeWidth={0.13} strokeLinejoin="round" /></g>;
};

export const Bonus: React.FC<{ level: LevelId; t: number; ph: number }> = ({ level, t, ph }) => {
  const o = 5, bob = Math.sin(t * 3 + ph) * 6;
  return (
    <g transform={`translate(0 ${bob})`} style={{ filter: "drop-shadow(0 0 14px rgba(255,226,120,0.9))" }}>
      {level === "krakow" && <g>{/* obwarzanek */}
        <circle r={38} fill="#e5a65a" stroke={INK} strokeWidth={o} /><circle r={13} fill="#6fb2ee" stroke={INK} strokeWidth={o * 0.8} />
        <circle r={38} fill="none" stroke="#f4c783" strokeWidth={9} strokeDasharray="4 22" strokeLinecap="round" /><path d="M-24,-20 Q-8,-34 10,-32" stroke="#f9deb0" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>}
      {level === "korea" && <g><rect x={-6} y={-50} width={12} height={14} fill="#ffd34d" stroke={INK} strokeWidth={o * 0.7} /><ellipse cx={0} cy={0} rx={30} ry={36} fill="#ff4d5a" stroke={INK} strokeWidth={o} /><path d="M-10,-32 Q-16,0 -10,32 M10,-32 Q16,0 10,32" stroke="#ffd34d" strokeWidth={5} fill="none" /><rect x={-14} y={34} width={28} height={9} rx={3} fill="#ffd34d" stroke={INK} strokeWidth={o * 0.7} /><path d="M0,43 l-4,18 M0,43 l4,18" stroke="#ffd34d" strokeWidth={4} /></g>}
      {level === "spain" && <g><circle r={36} fill="#ff9d2e" stroke={INK} strokeWidth={o} /><path d="M-22,-14 Q-10,-30 8,-28" stroke="#ffd08a" strokeWidth={7} fill="none" strokeLinecap="round" /><path d="M0,-36 q14,-22 30,-12 q-6,16 -30,12Z" fill="#4fb866" stroke={INK} strokeWidth={o * 0.7} strokeLinejoin="round" /></g>}
      {level === "rabko" && <g><path d="M0,34 Q-4,60 6,80" fill="none" stroke={INK} strokeWidth={4} /><ellipse cx={0} cy={0} rx={34} ry={42} fill="#ff7ad9" stroke={INK} strokeWidth={o} /><path d="M-16,34 L0,44 L16,34Z" fill="#ff7ad9" stroke={INK} strokeWidth={o * 0.8} strokeLinejoin="round" /><text x={0} y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={44} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke fill">5</text></g>}
    </g>
  );
};

export const Pigeon: React.FC<{ t: number; ph: number }> = ({ t, ph }) => {
  const w = Math.sin(t * 14 + ph) * 26;
  return (
    <g>
      <path d={`M10,-6 Q4,${-34 - w} -26,${-44 - w} Q-16,-16 -14,2Z`} fill="#8b93a6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={0} cy={4} rx={40} ry={24} fill="#b5bccc" stroke={INK} strokeWidth={5} />
      <path d="M36,0 Q60,-8 56,-30 Q40,-34 36,-16Z" fill="#b5bccc" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={62} cy={-24} r={17} fill="#b5bccc" stroke={INK} strokeWidth={5} /><path d="M76,-26 l20,6 l-20,8Z" fill="#ffb02e" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={66} cy={-27} r={5} fill="#fff" stroke={INK} strokeWidth={2} /><circle cx={68} cy={-27} r={2.4} fill={INK} />
      <path d="M-36,6 L-70,-6 L-66,18Z" fill="#8b93a6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M8,10 Q-4,${44 + w * 0.4} -30,${40 + w * 0.4} Q-14,18 -10,8Z`} fill="#8b93a6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

export const Kite: React.FC<{ t: number; ph: number }> = ({ t, ph }) => {
  const sw = Math.sin(t * 3 + ph);
  return (
    <g transform={`rotate(${sw * 10})`}>
      <path d={`M0,50 Q${-30 + sw * 30},110 ${sw * 40},160 T${-sw * 30},260`} fill="none" stroke="#ff5f6a" strokeWidth={7} strokeLinecap="round" />
      {[90, 150, 210].map((y, i) => <path key={y} d={`M${sw * 20 * (i + 1) / 3},${y} l-18,-10 l0,20Z`} fill={["#ffd34d", "#4fa3ff", "#ff7ad9"][i]} stroke={INK} strokeWidth={3} />)}
      <path d="M0,-70 L52,-6 L0,50 L-52,-6Z" fill="#ff5f6a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M0,-70 L0,50 M-52,-6 L52,-6" stroke={INK} strokeWidth={4} /><path d="M0,-70 L52,-6 L0,-6Z" fill="#ffd34d" /><path d="M0,50 L-52,-6 L0,-6Z" fill="#4fa3ff" />
      <path d="M0,-70 L52,-6 L0,50 L-52,-6Z" fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

export const Bumper: React.FC<{ t: number; ph: number }> = ({ t, ph }) => (
  <g transform={`rotate(${Math.sin(t * 2 + ph) * 6})`}>
    <path d="M0,50 Q-8,90 6,120" fill="none" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={50} ry={58} fill="#ef3b4a" stroke={INK} strokeWidth={6} /><path d="M-18,50 L0,64 L18,50Z" fill="#ef3b4a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M-30,-30 Q-26,-46 -8,-50" fill="none" stroke="#ffb3b8" strokeWidth={9} strokeLinecap="round" />
    <circle cx={-14} cy={-2} r={7} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={14} cy={-2} r={7} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={-12} cy={-1} r={3} fill={INK} /><circle cx={16} cy={-1} r={3} fill={INK} />
    <path d="M-14,20 Q0,30 14,20" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** Flamenco flame jet: warning flicker -> eruption -> off. u = 0..1 position in the cycle. */
export const Jet: React.FC<{ t: number; u: number; h: number }> = ({ t, u, h }) => {
  const warn = u > 0.45 && u < 0.62, on = u >= 0.62 && u < 0.92;
  const k = on ? Math.min(1, (u - 0.62) / 0.06) * (u > 0.86 ? (0.92 - u) / 0.06 : 1) : 0;
  const hh = h * k, wob = Math.sin(t * 20) * 8;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={70} ry={18} fill="#5a2a2a" stroke={INK} strokeWidth={5} />
      {warn ? <g opacity={0.6 + 0.4 * Math.sin(t * 30)}><path d={`M-26,-6 Q0,${-60 + wob} 26,-6Z`} fill="#ffb02e" stroke={INK} strokeWidth={4} /><circle cx={0} cy={-110} r={22} fill="#ef3b4a" stroke={INK} strokeWidth={4} /><text x={0} y={-100} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={32} fill="#fff">!</text></g> : null}
      {on ? <g>
        <path d={`M-60,0 Q-70,${-hh * 0.5} ${-20 + wob},${-hh} Q${wob},${-hh - 40} ${24 + wob},${-hh} Q70,${-hh * 0.5} 60,0Z`} fill="#ff5a1f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M-34,0 Q-40,${-hh * 0.45} ${wob * 0.6},${-hh * 0.8} Q40,${-hh * 0.45} 34,0Z`} fill="#ffb02e" />
        <path d={`M-16,0 Q-14,${-hh * 0.3} ${wob * 0.3},${-hh * 0.5} Q14,${-hh * 0.3} 16,0Z`} fill="#ffe14d" />
      </g> : null}
    </g>
  );
};

export const Bolt: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d={`M-260,0 Q-130,${-26 + Math.sin(t * 22) * 8} 0,-30 Q40,-4 0,34 Q-130,${26 + Math.sin(t * 18) * 8} -260,0Z`} fill="#ff5a1f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-150,0 Q-70,-12 -12,-12 Q10,0 -12,14 Q-70,12 -150,0Z" fill="#ffb02e" />
    <circle cx={0} cy={0} r={20} fill="#ffe14d" stroke={INK} strokeWidth={5} />
  </g>
);

export const Lift: React.FC<{ t: number; h: number; ph: number }> = ({ t, h, ph }) => (
  <g>
    <defs><linearGradient id="liftG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff4b0" stopOpacity={0.6} /><stop offset="1" stopColor="#fff4b0" stopOpacity={0} /></linearGradient></defs>
    <rect x={-85} y={-h} width={170} height={h} rx={60} fill="url(#liftG)" />
    {Array.from({ length: 6 }).map((_, i) => { const p = ((t * 0.6 + i / 6) % 1); return <path key={i} d={star4} transform={`translate(${Math.sin(i * 2.1 + ph) * 60} ${-p * h}) scale(${10 + (1 - p) * 8})`} fill="#fff" opacity={1 - p} />; })}
    <Lantern x={0} y={0} c="#ff5f6a" s={1.5} />
  </g>
);

export const RingBack: React.FC<{ t: number; taken: boolean }> = ({ t, taken }) => (
  <g opacity={taken ? 0.4 : 1}>
    <ellipse rx={34} ry={104} fill="none" stroke={INK} strokeWidth={22} />
    <ellipse rx={34} ry={104} fill="none" stroke={taken ? "#8cf0a8" : "#ff7ad9"} strokeWidth={13} strokeDasharray="22 14" strokeDashoffset={t * 40} />
  </g>
);
export const RingFront: React.FC<{ taken: boolean }> = ({ taken }) => <path d="M0,-104 A34,104 0 0 1 0,104" fill="none" stroke={taken ? "#8cf0a8" : "#ffe14d"} strokeWidth={13} strokeLinecap="round" />;

export const Goal: React.FC<{ t: number; lvl: LevelId }> = ({ t }) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} rx={64 + i * 22} ry={330 - i * 6} fill="none" stroke={["#ff7ad9", "#ffe14d", "#7ae7ff", "#8cf0a8", "#ffb02e"][i]} strokeWidth={16} opacity={0.9 - i * 0.1} transform={`rotate(${Math.sin(t * 1.5 + i) * 3})`} />)}
    <ellipse rx={64} ry={330} fill="#fff6b0" opacity={0.25 + 0.1 * Math.sin(t * 4)} />
    <text x={0} y={-362} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={74} fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke fill">META!</text>
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={star4} transform={`translate(${Math.cos(t * 1.4 + i) * 120} ${Math.sin(t * 1.1 + i * 2) * 300}) scale(${14 + (i % 3) * 5})`} fill={PAL.yellow} stroke={INK} strokeWidth={0.12} />)}
  </g>
);

/** Hit-free warning arrow shown at the screen edge before a dragon fireball. */
export const Warn: React.FC<{ t: number }> = ({ t }) => (
  <g opacity={0.65 + 0.35 * Math.sin(t * 18)}>
    <path d="M0,-34 L-44,0 L0,34Z" fill="#ef3b4a" stroke={INK} strokeWidth={6} strokeLinejoin="round" transform="translate(-20 0)" />
    <text x={32} y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={48} fill="#ef3b4a" stroke={INK} strokeWidth={7} paintOrder="stroke fill">!</text>
  </g>
);
export const useO = useOut;
