import React, { createContext, useContext } from "react";

/** Single source of truth for the film's look. Every scene imports this. */
export const INK = "#1a1226";
export const OUT = 7; // outline width in screen px, regardless of camera zoom

export const PAL = {
  skin: "#f6c8a0",
  skinShade: "#e9a982",
  hair: "#b9772f",
  hairLight: "#d99a4c",
  jacket: "#8e2fa3",
  vest: "#dd86d6",
  jeans: "#34475f",
  jeansLight: "#4a6283",
  shoe: "#e83a9d",
  shoeLight: "#ff7cc4",
  sole: "#fff4fb",
  hanbokTop: "#f0489f",
  hanbokSkirt: "#8a45cc",
  hanbokHem: "#f470b8",
  gold: "#ffd34d",
  cream: "#f6eefc",
  skyTop: "#34b0ff",
  skyBottom: "#c6edff",
  cyan: "#7ae7ff",
  pink: "#ff7ad9",
  yellow: "#ffe14d",
  grass: "#5cc15f",
  grassDark: "#3a9a4d",
  rock: "#8c93a6",
};

/** Camera zoom context: strokes are divided by zoom so lines stay the same weight. */
export const ZoomCtx = createContext(1);
export const useOut = (mult = 1) => (OUT * mult) / useContext(ZoomCtx);

/** Cloud: union outline via two passes (ink circles first, then white fills). */
/** 0..1 phase inside the current beat; background things sway with it */
export const BeatCtx = React.createContext(0);
export const useSway = (seed = 0) => Math.sin(React.useContext(BeatCtx) * Math.PI * 2 + seed);

export const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = "#fff" }) => {
  const o = useOut();
  const sw = useSway(x * 0.004);
  y = y + sw * 7; s = s * (1 + sw * 0.012);
  const c = [
    [0, 0, 60], [70, -28, 74], [150, -10, 62], [215, 8, 46], [-60, 14, 44],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {c.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill={INK} stroke={INK} strokeWidth={(o * 2) / s} />)}
      <rect x={-60} y={10} width={275} height={50} rx={25} fill={INK} stroke={INK} strokeWidth={(o * 2) / s} />
      {c.map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill={fill} />)}
      <rect x={-60} y={10} width={275} height={50} rx={25} fill={fill} />
      <path d="M-20,40 Q60,52 140,40" stroke="#dbe9f7" strokeWidth={9} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const star4 = "M0,-1 Q0.14,-0.14 1,0 Q0.14,0.14 0,1 Q-0.14,0.14 -1,0 Q-0.14,-0.14 0,-1Z";
