import React from "react";
import { INK, useOut } from "./ink";
import { rand } from "../data";

export type SceneProps = { t: number; scroll: number; pulse: number };

/** Curved east-asian style roof. `y` is the eave line, tips curl upward. */
export const Roof: React.FC<{ cx: number; y: number; tw: number; bw: number; h: number; fill: string; tile?: string }> = ({ cx, y, tw, bw, h, fill, tile = "rgba(0,0,0,0.18)" }) => {
  const o = useOut(1);
  const L = cx - bw / 2, R = cx + bw / 2, tl = cx - tw / 2, tr = cx + tw / 2;
  const d = `M${L},${y - 22} Q${L + (bw - tw) * 0.5 + 40},${y - h * 0.15} ${tl},${y - h} L${tr},${y - h} Q${R - (bw - tw) * 0.5 - 40},${y - h * 0.15} ${R},${y - 22} Q${cx},${y + 14} ${L},${y - 22}Z`;
  return (
    <g>
      <path d={d} fill={fill} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      {[0.25, 0.5, 0.75].map((k) => (
        <path key={k} d={`M${L + (bw - tw) * 0.5 * k + 10},${y - 22 - (h - 22) * k * 0.9} Q${cx},${y - h * 0.5 - h * 0.1 * k} ${R - (bw - tw) * 0.5 * k - 10},${y - 22 - (h - 22) * k * 0.9}`} fill="none" stroke={tile} strokeWidth={4} />
      ))}
      <rect x={tl - 6} y={y - h - 12} width={tw + 12} height={16} rx={6} fill="#2c2f3d" stroke={INK} strokeWidth={o * 0.8} />
    </g>
  );
};

export const Dancheong: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const o = useOut(0.7);
  const cols = ["#d7403f", "#2fa56b", "#2f7fd7", "#ffd34d", "#ffffff"];
  const n = Math.round(w / 38);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#2fa56b" stroke={INK} strokeWidth={o} />
      {Array.from({ length: n }).map((_, i) => (
        <g key={i}>
          <rect x={x + (i * w) / n + 3} y={y + 4} width={w / n - 6} height={h - 8} fill={cols[i % 3]} stroke={INK} strokeWidth={o * 0.6} />
          <circle cx={x + (i * w) / n + w / n / 2} cy={y + h / 2} r={Math.min(h / 4, 8)} fill={cols[3 + (i % 2)]} />
        </g>
      ))}
    </g>
  );
};

export const PineTree: React.FC<{ x: number; y: number; s: number; fill?: string; dark?: string }> = ({ x, y, s, fill = "#4fb866", dark = "#2f8f55" }) => {
  const o = useOut(0.8);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-7} y={-10} width={14} height={30} fill="#6b4226" stroke={INK} strokeWidth={o / s} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M0,${-110 + i * 32} L${34 + i * 10},${-52 + i * 32} L${-34 - i * 10},${-52 + i * 32}Z`} fill={i % 2 ? fill : dark} stroke={INK} strokeWidth={o / s} strokeLinejoin="round" />
      ))}
    </g>
  );
};

export const Twinkle: React.FC<{ n: number; t: number; y0?: number; y1?: number; w?: number }> = ({ n, t, y0 = 0, y1 = 700, w = 1920 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const a = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + rand(i) * 2) + i));
      const r = 2 + rand(i + 4) * 3.5;
      return <circle key={i} cx={rand(i + 1) * w} cy={y0 + rand(i + 2) * (y1 - y0)} r={r} fill="#fff" opacity={a} />;
    })}
  </g>
);

/** Wraps a layer that repeats every `tile` px and drifts by scroll*speed. */
export const Scroller: React.FC<{ scroll: number; speed: number; tile: number; children: React.ReactNode }> = ({ scroll, speed, tile, children }) => {
  const off = -(((scroll * speed) % tile) + tile) % tile;
  return (
    <g transform={`translate(${off} 0)`}>
      {children}
      <g transform={`translate(${tile} 0)`}>{children}</g>
    </g>
  );
};
