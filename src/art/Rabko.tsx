import React from "react";
import { INK, PAL, useOut, useSway, Cloud } from "./ink";
import { PineTree, SceneProps } from "./shapes";
import { rand } from "../data";

const track = (u: number): [number, number] => {
  const x = -160 + u * 2240;
  const y = 770 - 150 * Math.pow(Math.sin(u * Math.PI * 3.2 + 0.4), 2) - 40 * Math.sin(u * 9);
  return [x, y];
};
export const cartAt = (t: number) => {
  const u = (t * 0.085) % 1;
  const [x, y] = track(u);
  const [x2, y2] = track(u + 0.004);
  return { x, y, ang: (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI };
};

const Tent: React.FC<{ x: number; y: number; s: number; a: string; b: string }> = ({ x, y, s, a, b }) => {
  const o = useOut(1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-90} y={-80} width={180} height={80} fill="#fff4dc" stroke={INK} strokeWidth={o / s} />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${-90 + i * 30},-80 L${-90 + i * 30},0 L${-60 + i * 30},0 L${-60 + i * 30},-80Z`} fill={i % 2 ? a : b} opacity={0.85} />)}
      <path d="M-110,-80 L0,-170 L110,-80Z" fill={a} stroke={INK} strokeWidth={o / s} strokeLinejoin="round" />
      <path d="M-40,-80 L0,-170 L40,-80Z" fill={b} stroke={INK} strokeWidth={o / s} strokeLinejoin="round" />
      <rect x={-2} y={-210} width={4} height={44} fill={INK} /><path d="M2,-210 l34,10 l-34,10Z" fill={PAL.pink} stroke={INK} strokeWidth={o / s * 0.6} />
    </g>
  );
};

export const RabkoBack: React.FC<SceneProps> = ({ t, scroll }) => {
  const o = useOut(1);
  const px = (k: number) => Math.sin(scroll * 0.002) * k;
  const wx = 1480, wy = 430, R = 230;
  const sw = useSway(0);
  const gcols = ["#ff5fa2", "#ffd34d", "#4fd0ff", "#7be07b", "#ff9f1c", "#b78bff"];
  const pts = Array.from({ length: 64 }).map((_, i) => track(i / 63));
  const cart = cartAt(t);
  const spokes = Array.from({ length: 12 });
  return (
    <g>
      <defs>
        <linearGradient id="skyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38b2ff" /><stop offset="1" stopColor="#d6f2ff" /></linearGradient>
      </defs>
      <rect x={-1800} y={-1400} width={5600} height={3600} fill="url(#skyR)" />
      <Cloud x={200} y={150} s={1} /><Cloud x={900} y={90} s={0.8} />
      <g transform={`translate(${px(-10)} 0)`}>
        <ellipse cx={300} cy={760} rx={620} ry={300} fill="#6bcf74" stroke={INK} strokeWidth={o} />
        <ellipse cx={1100} cy={800} rx={760} ry={320} fill="#58c06a" stroke={INK} strokeWidth={o} />
        <ellipse cx={1760} cy={760} rx={560} ry={280} fill="#6bcf74" stroke={INK} strokeWidth={o} />
      </g>
      {/* ferris wheel */}
      <g transform={`translate(${px(4)} 0)`}>
        <path d={`M${wx - 120},900 L${wx},${wy} L${wx + 120},900`} fill="none" stroke={INK} strokeWidth={26 + o * 2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${wx - 120},900 L${wx},${wy} L${wx + 120},900`} fill="none" stroke="#4a6fc9" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={wx} cy={wy} r={R} fill="none" stroke={INK} strokeWidth={22 + o * 2} />
        <circle cx={wx} cy={wy} r={R} fill="none" stroke="#ffd34d" strokeWidth={16} />
        <circle cx={wx} cy={wy} r={R * 0.62} fill="none" stroke={INK} strokeWidth={10 + o * 2} />
        <circle cx={wx} cy={wy} r={R * 0.62} fill="none" stroke="#4a6fc9" strokeWidth={6} />
        {spokes.map((_, i) => {
          const a = (i / 12) * Math.PI * 2 + t * 0.15;
          return <line key={i} x1={wx} y1={wy} x2={wx + Math.cos(a) * R} y2={wy + Math.sin(a) * R} stroke={INK} strokeWidth={8} />;
        })}
        {gcols.concat(gcols).map((c, i) => {
          const a = (i / 12) * Math.PI * 2 + t * 0.15;
          const gx = wx + Math.cos(a) * R, gy = wy + Math.sin(a) * R;
          return (
            <g key={i} transform={`translate(${gx} ${gy}) rotate(${sw * 9})`}>
              <line x1={0} y1={0} x2={0} y2={20} stroke={INK} strokeWidth={5} />
              <rect x={-24} y={18} width={48} height={40} rx={9} fill={c} stroke={INK} strokeWidth={o} />
              <path d="M-24,28 L24,28" stroke="#fff" strokeWidth={4} opacity={0.6} />
            </g>
          );
        })}
        <circle cx={wx} cy={wy} r={30} fill="#ff5fa2" stroke={INK} strokeWidth={o} />
      </g>
      {/* tents + carousel */}
      <Tent x={900} y={800} s={1.1} a="#ff5fa2" b="#ffd34d" />
      <Tent x={1760} y={820} s={0.9} a="#4fd0ff" b="#ffffff" />
      <g transform={`translate(${px(2)} 0)`}>
        <ellipse cx={380} cy={830} rx={230} ry={40} fill="#b78bff" stroke={INK} strokeWidth={o} />
        <rect x={160} y={700} width={440} height={130} fill="#fff4dc" stroke={INK} strokeWidth={o} opacity={0} />
        {[200, 280, 360, 440, 520].map((x, i) => (
          <g key={x}>
            <line x1={x} y1={640} x2={x} y2={830} stroke={INK} strokeWidth={11} />
            <line x1={x} y1={640} x2={x} y2={830} stroke={["#ffd34d", "#ff5fa2", "#4fd0ff", "#7be07b", "#ffd34d"][i]} strokeWidth={6} />
            <ellipse cx={x} cy={760 + Math.sin(t * 2 + i) * 14} rx={32} ry={22} fill="#fff" stroke={INK} strokeWidth={o} />
            <circle cx={x + 24} cy={742 + Math.sin(t * 2 + i) * 14} r={12} fill="#fff" stroke={INK} strokeWidth={o} />
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const x0 = 130 + i * 60;
          return <path key={i} d={`M${x0},640 L${x0 + 60},640 L${380 + (i - 3.5) * 8 + 4},520 L${380 + (i - 3.5) * 8 - 4},520Z`} fill={i % 2 ? "#ff5fa2" : "#ffd34d"} stroke={INK} strokeWidth={o * 0.7} strokeLinejoin="round" />;
        })}
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={160 + i * 60 + 30} cy={646} r={22} fill={i % 2 ? "#ffd34d" : "#ff5fa2"} stroke={INK} strokeWidth={o * 0.8} />)}
        <rect x={378} y={470} width={4} height={54} fill={INK} /><path d="M382,470 l44,12 l-44,12Z" fill="#7be07b" stroke={INK} strokeWidth={o * 0.6} />
      </g>
      {/* coaster */}
      <g>
        {pts.filter((_, i) => i % 2 === 0).map(([x, y], i) => <line key={i} x1={x} y1={y} x2={x} y2={900} stroke="#6f7fb3" strokeWidth={9} opacity={0.9} />)}
        <path d={"M" + pts.map((p) => p.join(",")).join(" L")} fill="none" stroke={INK} strokeWidth={20 + o * 2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={"M" + pts.map((p) => p.join(",")).join(" L")} fill="none" stroke="#ff5fa2" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <g transform={`translate(${cart.x} ${cart.y - 14}) rotate(${cart.ang})`}>
          <rect x={-56} y={-40} width={112} height={44} rx={14} fill="#8c93a6" stroke={INK} strokeWidth={o} />
          <path d="M56,-36 q34,-6 36,18 q-8,18 -36,16Z" fill="#9aa2b5" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
          <circle cx={74} cy={-22} r={6} fill="#ffb02e" stroke={INK} strokeWidth={o * 0.6} />
          <path d="M66,-8 l6,10 l6,-10" fill="#fff" stroke={INK} strokeWidth={o * 0.6} />
          <circle cx={-34} cy={8} r={12} fill="#444" stroke={INK} strokeWidth={o} /><circle cx={34} cy={8} r={12} fill="#444" stroke={INK} strokeWidth={o} />
          <circle cx={-18} cy={-58} r={20} fill={PAL.skin} stroke={INK} strokeWidth={o} /><path d="M-36,-62 Q-18,-90 2,-62Z" fill={PAL.hair} stroke={INK} strokeWidth={o * 0.8} />
          <circle cx={26} cy={-56} r={18} fill={PAL.skin} stroke={INK} strokeWidth={o} /><path d="M8,-60 Q26,-84 44,-60Z" fill="#3d2a1c" stroke={INK} strokeWidth={o * 0.8} />
        </g>
      </g>
      <rect x={-1800} y={880} width={5600} height={900} fill="#5cc15f" stroke={INK} strokeWidth={o} />
      <path d="M-200,990 Q500,950 1000,1000 T2120,980 L2120,1050 Q1400,1030 900,1060 T-200,1050Z" fill="#f3d9a0" stroke={INK} strokeWidth={o} />
      {[120, 700, 1240, 1860].map((x, i) => <PineTree key={i} x={x} y={920 + (i % 2) * 20} s={1.2 + rand(i) * 0.5} />)}
    </g>
  );
};
