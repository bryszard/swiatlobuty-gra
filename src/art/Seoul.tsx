import React from "react";
import { INK, useOut } from "./ink";
import { Dancheong, PineTree, Roof, SceneProps } from "./shapes";
import { rand } from "../data";

const sky = ["#3db4ff", "#cdeeff"];

export const SeoulBack: React.FC<SceneProps> = ({ scroll }) => {
  const o = useOut(1);
  const px = (k: number) => Math.sin(scroll * 0.002) * k;
  return (
    <g>
      <defs>
        <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
      </defs>
      <rect x={-1800} y={-1400} width={5600} height={3600} fill="url(#skyS)" />
      {/* hill + N Seoul tower */}
      <g transform={`translate(${px(14)} 0)`}>
        <ellipse cx={1600} cy={830} rx={460} ry={270} fill="#58c06a" stroke={INK} strokeWidth={o} />
        <polygon points="1590,600 1610,600 1604,340 1596,340" fill="#eef0f8" stroke={INK} strokeWidth={o} />
        <ellipse cx={1600} cy={356} rx={38} ry={16} fill="#d6dcec" stroke={INK} strokeWidth={o} />
        <rect x={1593} y={270} width={14} height={70} fill="#fff" stroke={INK} strokeWidth={o * 0.8} />
        <rect x={1593} y={290} width={14} height={14} fill="#d7403f" />
        <rect x={1593} y={316} width={14} height={14} fill="#d7403f" />
        {/* skyline */}
        {Array.from({ length: 8 }).map((_, i) => {
          const h = 160 + rand(i + 3) * 220, x = 20 + i * 92, w = 70 + rand(i) * 20;
          return (
            <g key={i}>
              <rect x={x} y={800 - h} width={w} height={h} fill={i % 2 ? "#a9c1dd" : "#c0d2e8"} stroke={INK} strokeWidth={o} />
              {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 3 }).map((_, c) => <rect key={`${r}${c}`} x={x + 10 + c * 20} y={800 - h + 16 + r * 26} width={10} height={14} fill="#eaf5ff" opacity={0.85} />))}
            </g>
          );
        })}
      </g>
      {/* back hall */}
      <g transform={`translate(${px(8)} 0)`}>
        <rect x={730} y={560} width={460} height={70} fill="#c9c3b4" stroke={INK} strokeWidth={o} />
        <rect x={760} y={470} width={400} height={92} fill="#e0b080" stroke={INK} strokeWidth={o} />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={768 + i * 76} y={470} width={18} height={92} fill="#c8383a" stroke={INK} strokeWidth={o * 0.7} />)}
        <Dancheong x={750} y={444} w={420} h={28} />
        <Roof cx={960} y={444} tw={250} bw={560} h={110} fill="#3f8a92" />
      </g>
      {/* main gate */}
      <g transform={`translate(${px(2)} 0)`}>
        <rect x={470} y={720} width={980} height={140} fill="#cfc9ba" stroke={INK} strokeWidth={o} />
        {[0, 1].map((r) => Array.from({ length: 18 }).map((_, i) => <line key={`${r}${i}`} x1={470 + i * 55 + (r ? 27 : 0)} y1={740 + r * 56} x2={470 + i * 55 + (r ? 27 : 0)} y2={796 + r * 56} stroke="rgba(0,0,0,0.18)" strokeWidth={3} />))}
        {[700, 960, 1220].map((x) => <path key={x} d={`M${x - 64},860 L${x - 64},790 Q${x},700 ${x + 64},790 L${x + 64},860Z`} fill="#2b2438" stroke={INK} strokeWidth={o} />)}
        <rect x={560} y={600} width={800} height={122} fill="#e0b080" stroke={INK} strokeWidth={o} />
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={572 + i * 96} y={600} width={24} height={122} fill="#c8383a" stroke={INK} strokeWidth={o * 0.7} />)}
        <Dancheong x={548} y={566} w={824} h={36} />
        <Roof cx={960} y={566} tw={400} bw={900} h={130} fill="#3f8a92" />
        <Roof cx={960} y={742} tw={720} bw={1060} h={74} fill="#35767e" />
      </g>
      {/* walls + courtyard */}
      <rect x={-1800} y={780} width={2280} height={90} fill="#cfc9ba" stroke={INK} strokeWidth={o} />
      <rect x={1440} y={780} width={2400} height={90} fill="#cfc9ba" stroke={INK} strokeWidth={o} />
      <rect x={-1800} y={760} width={2280} height={28} fill="#35767e" stroke={INK} strokeWidth={o} />
      <rect x={1440} y={760} width={2400} height={28} fill="#35767e" stroke={INK} strokeWidth={o} />
      <rect x={-1800} y={860} width={5600} height={900} fill="#d9d1be" stroke={INK} strokeWidth={o} />
      {[920, 990, 1070].map((y) => <line key={y} x1={-1800} x2={3800} y1={y} y2={y} stroke="rgba(0,0,0,0.2)" strokeWidth={4} />)}
      {Array.from({ length: 20 }).map((_, i) => <line key={i} x1={960 + (i - 10) * 70} y1={870} x2={960 + (i - 10) * 220} y2={1100} stroke="rgba(0,0,0,0.16)" strokeWidth={4} />)}
      <PineTree x={220} y={880} s={1.9} fill="#4fb866" dark="#2f8f55" />
      <PineTree x={1700} y={880} s={1.6} fill="#4fb866" dark="#2f8f55" />
      <PineTree x={380} y={900} s={1.1} fill="#5ac76e" dark="#34a15c" />
      {/* stone lanterns */}
      {[560, 1360].map((x) => (
        <g key={x} transform={`translate(${x} 960)`}>
          <rect x={-18} y={0} width={36} height={60} fill="#b4b0a8" stroke={INK} strokeWidth={o} />
          <rect x={-30} y={-40} width={60} height={42} fill="#c9c5bc" stroke={INK} strokeWidth={o} />
          <rect x={-14} y={-30} width={28} height={22} fill="#ffe14d" />
          <path d="M-46,-40 L0,-78 L46,-40Z" fill="#b4b0a8" stroke={INK} strokeWidth={o} strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
};
