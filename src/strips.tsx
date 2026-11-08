import React from "react";
import { INK, Cloud } from "./art/ink";
import { Roof } from "./art/shapes";
import { rand } from "./data";
import { LevelId } from "./levels";

const O = 6;
const KrakowTile = React.memo(() => {
  const cols = ["#c9533f", "#b04a3a", "#8d5aa8", "#d8734a", "#4a8f8a"];
  return <g>
    <rect x={0} y={1010} width={1920} height={80} fill="#6e5a7a" stroke={INK} strokeWidth={O} />
    {Array.from({ length: 12 }).map((_, i) => {
      const x = i * 160 + 6, w = 150, h = 60 + rand(i + 20) * 40;
      return <g key={i}>
        <path d={`M${x},1020 L${x + w / 2},${1020 - h} L${x + w},1020Z`} fill={cols[i % cols.length]} stroke={INK} strokeWidth={O} strokeLinejoin="round" />
        {i % 3 === 0 ? <g><rect x={x + w * 0.64} y={1020 - h * 0.6 - 30} width={20} height={44} fill="#9a4a3a" stroke={INK} strokeWidth={5} /></g> : null}
        <path d={`M${x + 20},1020 L${x + w / 2},${1020 - h + 18} L${x + w - 20},1020`} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={5} />
      </g>;
    })}
  </g>;
});
const KoreaTile = React.memo(() => <g>
  <rect x={0} y={1020} width={1920} height={70} fill="#2c2f3d" stroke={INK} strokeWidth={O} />
  {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${i * 480 + 240} 0)`}><Roof cx={0} y={1060} tw={160} bw={420} h={110} fill={i % 2 ? "#4a5a7a" : "#3b6f8f"} /></g>)}
</g>);
const SpainTile = React.memo(() => <g>
  <path d="M0,1040 Q240,980 480,1030 T960,1030 T1440,1020 T1920,1040 L1920,1090 L0,1090Z" fill="#d6a24a" stroke={INK} strokeWidth={O} />
  {[160, 700, 1180, 1620].map((x, i) => <g key={i} transform={`translate(${x} 1040)`}>{[-50, -26, 0, 26, 50].map((a, j) => <path key={j} d={`M0,0 Q${a * 0.5 - 8},-40 ${a * 1.1},-78 Q${a * 0.5 + 10},-34 0,0Z`} fill={j % 2 ? "#5f9a76" : "#4d8a68"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}</g>)}
</g>);
const LondonTile = React.memo(() => {
  const cols = ["#b04a3a", "#c9533f", "#a8503f", "#8d4a3f"];
  return <g>
    <rect x={0} y={1020} width={1920} height={70} fill="#6e6a7e" stroke={INK} strokeWidth={O} />
    {Array.from({ length: 8 }).map((_, i) => { const x = i * 240 + 10, h = 70 + rand(i + 40) * 40; return <g key={i}>
      <rect x={x} y={1030 - h} width={220} height={h + 4} fill={cols[i % 4]} stroke={INK} strokeWidth={O} />
      <rect x={x - 6} y={1030 - h - 12} width={232} height={14} fill="#ece2d0" stroke={INK} strokeWidth={5} />
      <rect x={x + 150} y={1030 - h - 54} width={22} height={44} fill="#9a4a3a" stroke={INK} strokeWidth={5} />
    </g>; })}
    <g transform="translate(1500 1030)"><rect x={-30} y={-110} width={60} height={110} fill="#e03a3e" stroke={INK} strokeWidth={5} /><path d="M-34,-110 Q0,-146 34,-110Z" fill="#e03a3e" stroke={INK} strokeWidth={5} /><rect x={-20} y={-96} width={40} height={64} fill="#ffe9a8" stroke={INK} strokeWidth={4} /></g>
    <g transform="translate(640 1030)"><rect x={-4} y={-150} width={8} height={150} fill="#3a3a4a" stroke={INK} strokeWidth={3} /><circle cx={0} cy={-158} r={14} fill="#fff1a8" stroke={INK} strokeWidth={4} /></g>
  </g>;
});
const RabkoTile = React.memo(() => <g>
  <rect x={0} y={1030} width={1920} height={60} fill="#5cc15f" stroke={INK} strokeWidth={O} />
  {Array.from({ length: 6 }).map((_, i) => { const x = i * 320 + 40, c = ["#ef3b4a", "#ffd34d", "#4fa3ff", "#ff7ad9", "#8cf0a8", "#ff9a3c"][i]; return <g key={i}>
    <path d={`M${x},1040 L${x + 130},960 L${x + 260},1040Z`} fill={c} stroke={INK} strokeWidth={O} strokeLinejoin="round" />
    <path d={`M${x + 130},960 L${x + 90},1040 M${x + 130},960 L${x + 170},1040`} stroke="#fff" strokeWidth={9} opacity={0.7} />
    <path d={`M${x + 130},960 L${x + 130},930`} stroke={INK} strokeWidth={5} /><path d={`M${x + 130},930 l36,10 l-36,10Z`} fill="#ef3b4a" stroke={INK} strokeWidth={4} />
  </g>; })}
</g>);

export const Strip = React.memo(({ id, off }: { id: LevelId; off: number }) => {
  const o = -(((off % 1920) + 1920) % 1920);
  const T = id === "krakow" ? KrakowTile : id === "korea" ? KoreaTile : id === "spain" ? SpainTile : id === "london" ? LondonTile : RabkoTile;
  return <g transform={`translate(${o} 0)`}><T /><g transform="translate(1920 0)"><T /></g></g>;
});

export const Clouds = React.memo(({ off, tint }: { off: number; tint: string }) => {
  const o = -(((off % 2400) + 2400) % 2400);
  const row = <g>{[[100, 150, 1], [700, 300, 0.7], [1300, 120, 0.9], [1900, 260, 1.1]].map(([x, y, s], i) => <Cloud key={i} x={x} y={y} s={s} fill={tint} />)}</g>;
  return <g transform={`translate(${o} 0)`} opacity={0.85}>{row}<g transform="translate(2400 0)">{row}</g></g>;
});
