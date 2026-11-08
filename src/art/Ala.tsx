import React from "react";
import { INK, PAL, useOut } from "./ink";
import type { Pose, V } from "./poses";

export type Eyes = "open" | "closed" | "happy";
export type Outfit = "jacket" | "hanbok";

const pt = (p: V) => `${p[0]},${p[1]}`;
const mid = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const smooth = (p: V[]) => {
  const n = p.length;
  let d = `M${pt(mid(p[n - 1], p[0]))}`;
  for (let i = 0; i < n; i++) d += ` Q${pt(p[i])} ${pt(mid(p[i], p[(i + 1) % n]))}`;
  return d + "Z";
};
const lerpV = (a: V, b: V, p: number): V => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];

const Limb: React.FC<{ pts: V[]; w: number; fill: string }> = ({ pts, w, fill }) => {
  const o = useOut(1);
  const d = pts.map(pt).join(" ");
  return (
    <>
      <polyline points={d} fill="none" stroke={INK} strokeWidth={w + o * 2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
};

const Torso: React.FC<{ a: V; b: V; wTop: number; wBot: number; fill: string; round?: number }> = ({ a, b, wTop, wBot, fill, round = 30 }) => {
  const o = useOut(1);
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  const P: V[] = [
    [b[0] + nx * wTop, b[1] + ny * wTop], [b[0] - nx * wTop, b[1] - ny * wTop],
    [a[0] - nx * wBot, a[1] - ny * wBot], [a[0] + nx * wBot, a[1] + ny * wBot],
  ];
  const d = `M${P.map(pt).join(" L")}Z`;
  return (
    <>
      <path d={d} fill={INK} stroke={INK} strokeWidth={round + o * 2} strokeLinejoin="round" />
      <path d={d} fill={fill} stroke={fill} strokeWidth={round} strokeLinejoin="round" />
    </>
  );
};

export const Wing: React.FC<{ at: V; angle: number; len: number; flap: number; spread?: number }> = ({ at, angle, len, flap, spread = 96 }) => {
  const o = useOut(0.6);
  const lens = [0.5, 0.74, 0.93, 1, 0.88, 0.64];
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle + flap})`}>
      {lens.map((l, i) => {
        const a = (i - 2.5) * (spread / 5);
        const L = len * l;
        const w = L * 0.25;
        return (
          <g key={i} transform={`rotate(${a})`}>
            <path d={`M0,0 Q${L * 0.45},${-w} ${L},0 Q${L * 0.45},${w * 0.9} 0,0Z`} fill="url(#wingGrad)" stroke={INK} strokeWidth={o * 1.1} strokeLinejoin="round" />
            <path d={`M${L * 0.12},0 Q${L * 0.5},${-w * 0.45} ${L * 0.86},0`} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

export const Shoe: React.FC<{ at: V; angle: number }> = ({ at, angle }) => {
  const o = useOut(1);
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(1.25)`}>
      <path d="M-26,-34 L10,-38 Q44,-28 60,-8 Q68,4 56,14 L-30,16 Q-40,0 -26,-34Z" fill={PAL.shoe} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-18,-26 L8,-30 Q30,-22 44,-8 Q20,-8 -18,-4Z" fill={PAL.shoeLight} opacity={0.75} />
      <rect x={-32} y={10} width={94} height={16} rx={8} fill={PAL.sole} stroke={INK} strokeWidth={o} />
      <path d="M-4,-32 L4,-10 M12,-34 L20,-12 M26,-28 L34,-10" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      {[[-16, -14], [6, -8], [30, 0], [-4, 2], [18, -20], [42, -4]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.4} fill="#fff" opacity={0.9} />)}
    </g>
  );
};

/** Rainbow light-trail streaming from the ankle. */
const Trail: React.FC<{ at: V; angle: number; len: number; t: number }> = ({ at, angle, len, t }) => {
  const cols = [PAL.pink, PAL.yellow, PAL.cyan, "#ffffff"];
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle})`}>
      {cols.map((c, i) => {
        const ph = t * 3 + i * 1.3;
        const a = Math.sin(ph) * 22, b = Math.cos(ph * 0.8) * 34;
        return (
          <path key={i} d={`M0,${(i - 1.5) * 9} C${len * 0.3},${a + (i - 1.5) * 14} ${len * 0.65},${b} ${len},${(i - 1.5) * 20 + a}`} fill="none" stroke={`url(#trail${i})`} strokeWidth={14 - i * 2.4} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

export const AlaDefs: React.FC = () => (
  <defs>
    <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#fff0fb" />
      <stop offset="0.35" stopColor="#ff72d2" />
      <stop offset="1" stopColor="#3fcfff" />
    </linearGradient>
    {[PAL.pink, PAL.yellow, PAL.cyan, "#ffffff"].map((c, i) => (
      <linearGradient key={i} id={`trail${i}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={c} stopOpacity={0.95} />
        <stop offset="1" stopColor={c} stopOpacity={0} />
      </linearGradient>
    ))}
  </defs>
);

const Head: React.FC<{ eyes: Eyes; glasses: boolean; hairRot: number; t: number; beat?: number }> = ({ eyes, glasses, hairRot, t, beat = 0 }) => {
  const o = useOut(1);
  // ponytail: slow sway + a springy, lagging bounce on the beat
  const sway = Math.sin(t * 3.2) * 7 + Math.sin(beat * Math.PI * 2 - 1.1) * 6;
  return (
    <g>
      {/* ponytail */}
      <g transform={`translate(-46 -22) rotate(${hairRot + sway}) translate(46 22)`}>
        <path d="M-46,-34 C-120,-70 -170,10 -128,92 C-112,46 -88,28 -44,14Z" fill={PAL.hair} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
        <path d="M-70,-30 C-120,-30 -138,10 -118,60" fill="none" stroke={PAL.hairLight} strokeWidth={7} strokeLinecap="round" />
        <circle cx={-48} cy={-18} r={11} fill={PAL.pink} stroke={INK} strokeWidth={o * 0.8} />
      </g>
      {/* ear + face */}
      <circle cx={-14} cy={12} r={14} fill={PAL.skinShade} stroke={INK} strokeWidth={o} />
      <circle cx={0} cy={0} r={66} fill={PAL.skin} stroke={INK} strokeWidth={o} />
      <path d="M62,10 Q74,16 64,26" fill="none" stroke={PAL.skinShade} strokeWidth={5} strokeLinecap="round" />
      {/* eyes */}
      {eyes === "open" && (
        <>
          <ellipse cx={20} cy={2} rx={12} ry={16} fill="#fff" stroke={INK} strokeWidth={o * 0.8} />
          <circle cx={23} cy={4} r={9} fill="#3bb9c9" /><circle cx={24} cy={4} r={5} fill={INK} /><circle cx={27} cy={-1} r={3.4} fill="#fff" />
          <ellipse cx={54} cy={0} rx={9} ry={14} fill="#fff" stroke={INK} strokeWidth={o * 0.8} />
          <circle cx={56} cy={2} r={7} fill="#3bb9c9" /><circle cx={57} cy={2} r={4} fill={INK} /><circle cx={59} cy={-2} r={2.6} fill="#fff" />
        </>
      )}
      {eyes === "closed" && (
        <>
          <path d="M8,6 Q20,16 32,6" fill="none" stroke={INK} strokeWidth={o} strokeLinecap="round" />
          <path d="M44,4 Q54,12 64,4" fill="none" stroke={INK} strokeWidth={o * 0.9} strokeLinecap="round" />
        </>
      )}
      {eyes === "happy" && (
        <>
          <path d="M8,8 Q20,-10 32,8" fill="none" stroke={INK} strokeWidth={o} strokeLinecap="round" />
          <path d="M44,6 Q54,-8 64,6" fill="none" stroke={INK} strokeWidth={o * 0.9} strokeLinecap="round" />
        </>
      )}
      <path d="M6,-22 Q20,-30 34,-22" fill="none" stroke={PAL.hair} strokeWidth={6} strokeLinecap="round" />
      <path d="M44,-20 Q54,-26 64,-18" fill="none" stroke={PAL.hair} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={30} cy={30} rx={15} ry={9} fill="#ff7f97" opacity={0.7} />
      <ellipse cx={60} cy={26} rx={8} ry={6} fill="#ff7f97" opacity={0.5} />
      {eyes === "closed" ? (
        <path d="M30,38 Q44,46 58,38" fill="none" stroke={INK} strokeWidth={o * 0.9} strokeLinecap="round" />
      ) : (
        <>
          <path d="M28,34 Q44,60 62,32 Z" fill="#7a1f3a" stroke={INK} strokeWidth={o * 0.8} strokeLinejoin="round" />
          <path d="M33,36 Q45,41 57,35 L55,40 Q45,46 35,41Z" fill="#fff" />
        </>
      )}
      {glasses && (
        <>
          <path d="M-60,-6 L8,-8" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <rect x={6} y={-18} width={72} height={36} rx={9} fill="#2a2a38" stroke={INK} strokeWidth={o} />
          <path d="M14,-12 L34,-12" stroke="#7a86a8" strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      {/* hair cap + bangs */}
      <path d="M-68,2 Q-76,-78 4,-76 Q74,-72 68,-8 Q56,-46 30,-44 Q40,-26 10,-32 Q-14,-20 -30,-36 Q-52,-26 -68,2Z" fill={PAL.hair} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      <path d="M-30,-62 Q0,-72 34,-62" fill="none" stroke={PAL.hairLight} strokeWidth={8} strokeLinecap="round" />
      <path d="M-52,-34 Q-30,-56 -6,-60 M-10,-62 Q24,-66 46,-48 M-58,-8 Q-44,-30 -28,-40" fill="none" stroke={INK} strokeWidth={o * 0.6} strokeLinecap="round" opacity={0.45} />
      <path d="M-22,-30 Q-16,-6 -30,18 Q-36,0 -34,-26Z" fill={PAL.hair} stroke={INK} strokeWidth={o * 0.7} strokeLinejoin="round" transform={`rotate(${Math.sin(t * 3.2 + 1) * 5} -26 -30)`} />
      <path d="M58,-30 Q76,-22 72,-2 Q66,-18 52,-26Z" fill={PAL.hair} stroke={INK} strokeWidth={o * 0.6} strokeLinejoin="round" />
    </g>
  );
};

export type AlaProps = {
  pose: Pose;
  outfit?: Outfit;
  t: number;
  x?: number; y?: number; scale?: number; flip?: boolean; rot?: number;
  glow?: number;
  trail?: number;
  eyes?: Eyes;
  glasses?: boolean;
  /** content drawn in the front hand's coordinate frame (e.g. a fan) */
  held?: React.ReactNode;
  /** false: bare socks, shoes are somewhere else */
  shoes?: boolean;
  /** 0..1 position inside the current beat; wings flap once per beat */
  beat?: number;
  flapAmp?: number;
};

export const Ala: React.FC<AlaProps> = ({ pose: P0, outfit = "jacket", t, x = 0, y = 0, scale = 1, flip = false, rot = 0, glow = 1, trail = 0, eyes = "open", glasses = false, held, shoes = true, beat, flapAmp = 1 }) => {
  const o = useOut(1);
  const sw = (a: number, b = 0) => Math.sin(t * a + b);
  const P: Pose = { ...P0, head: [P0.head[0], P0.head[1] + sw(2.4) * 4] as V, headRot: P0.headRot + sw(2.1) * 3,
    armF: [P0.armF[0], [P0.armF[1][0], P0.armF[1][1] + sw(2.6) * 7], [P0.armF[2][0], P0.armF[2][1] + sw(2.6, 0.4) * 13]] as [V, V, V],
    armB: [P0.armB[0], [P0.armB[1][0], P0.armB[1][1] + sw(2.6, 1.7) * 7], [P0.armB[2][0] + sw(2.6, 2) * 8, P0.armB[2][1] + sw(2.6, 1.9) * 13]] as [V, V, V],
    legF: [P0.legF[0], P0.legF[1], [P0.legF[2][0], P0.legF[2][1] + sw(3, 0.5) * 8]] as [V, V, V],
    legB: [P0.legB[0], P0.legB[1], [P0.legB[2][0], P0.legB[2][1] + sw(3, 2.2) * 8]] as [V, V, V] };
  const flap = beat !== undefined ? -Math.sin(beat * Math.PI * 2) * 13 * flapAmp : Math.sin(t * 7) * 9;
  const hb = outfit === "hanbok";
  const bp = beat !== undefined ? beat * Math.PI * 2 : t * 6;
  const skirtPts: V[] = P.skirt.map((v, i) => [v[0] + Math.sin(bp + i) * 3, v[1] + Math.sin(t * 3 + i * 1.3) * (hb ? 6 : 3) + Math.sin(bp - i * 0.7) * 4] as V);
  const torsoStart = hb ? lerpV(P.hip, P.neck, 0.3) : P.hip;
  const sleeve = hb ? PAL.hanbokTop : PAL.jacket;
  const legCol = hb ? PAL.cream : PAL.jeans;
  const legW = hb ? 44 : 54;
  const glowF = glow > 0 ? `drop-shadow(0 0 ${12 * glow}px rgba(255,214,120,0.95)) drop-shadow(0 0 ${26 * glow}px rgba(255,122,217,0.85))` : "none";
  const hand = (p: V) => <circle cx={p[0]} cy={p[1]} r={19} fill={PAL.skin} stroke={INK} strokeWidth={o} />;
  const arm = (a: [V, V, V]) => (
    <>
      <Limb pts={a} w={hb ? 42 : 36} fill={sleeve} />
      {hb && <Limb pts={[lerpV(a[1], a[2], 0.55), lerpV(a[1], a[2], 0.7)]} w={44} fill={PAL.gold} />}
      {hand(a[2])}
    </>
  );
  const feet = (leg: [V, V, V], shoeA: number, wingA: number, wingLen: number) => !shoes ? (
    <g transform={`translate(${leg[2][0]} ${leg[2][1]}) rotate(${shoeA}) scale(1.25)`}>
      <path d="M-24,-26 L10,-28 Q34,-20 46,-4 Q52,8 42,14 L-24,14 Q-32,-4 -24,-26Z" fill="#fff4fb" stroke={INK} strokeWidth={o / 1.25} strokeLinejoin="round" />
      <path d="M-26,-14 L-24,-6 L30,-4 L28,-12Z" fill={PAL.pink} opacity={0.8} />
    </g>
  ) : (
    <g style={{ filter: glowF }}>
      <Wing at={leg[2]} angle={wingA} len={wingLen} flap={flap} />
      <Shoe at={leg[2]} angle={shoeA} />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -scale : scale} ${scale})`}>
      {trail > 0 && (
        <>
          <Trail at={P.legF[2]} angle={180 + (P.shoeF - 38) * 0.2} len={420 * trail} t={t} />
          <Trail at={P.legB[2]} angle={176} len={360 * trail} t={t + 1} />
        </>
      )}
      {/* back limbs */}
      <Limb pts={P.legB} w={legW} fill={hb ? PAL.cream : PAL.jeansLight} />
      {feet(P.legB, P.shoeB, P.wingB, 210 * P.wingS)}
      {arm(P.armB)}
      {/* front leg */}
      <Limb pts={P.legF} w={legW} fill={legCol} />
      {hb && (
        <path d={smooth(skirtPts)} fill={PAL.hanbokSkirt} stroke={INK} strokeWidth={o} strokeLinejoin="round" />
      )}
      {hb && <path d={`M${pt(lerpV(P.skirt[2], P.skirt[3], 0.3))} Q${pt(lerpV(P.skirt[3], P.skirt[4], 0.5))} ${pt(lerpV(P.skirt[4], P.skirt[5], 0.4))} L${pt(lerpV(P.skirt[5], P.skirt[6], 0.3))} Q${pt(lerpV(P.skirt[3], P.skirt[5], 0.5))} ${pt(lerpV(P.skirt[2], P.skirt[3], 0.3))}Z`} fill={PAL.hanbokHem} stroke={INK} strokeWidth={o * 0.6} strokeLinejoin="round" />}
      {feet(P.legF, P.shoeF, P.wingF, 245 * P.wingS)}
      {!hb && (
        <path d={`M${P.hip[0] - 30},${P.hip[1] - 6} Q${P.hip[0] - 62 + Math.sin(bp) * 8},${P.hip[1] + 30 + Math.sin(t * 4) * 6} ${P.hip[0] - 76 + Math.sin(bp - 0.8) * 12},${P.hip[1] + 52 + Math.sin(t * 3.4) * 8} Q${P.hip[0] - 20},${P.hip[1] + 40} ${P.hip[0] + 30},${P.hip[1] - 6}Z`} fill={PAL.jacket} stroke={INK} strokeWidth={o * 0.8} strokeLinejoin="round" />
      )}
      {/* torso */}
      <Torso a={torsoStart} b={P.neck} wTop={hb ? 44 : 52} wBot={hb ? 34 : 40} fill={hb ? PAL.hanbokTop : PAL.jacket} />
      {!hb && <Torso a={lerpV(P.hip, P.neck, 0.1)} b={lerpV(P.hip, P.neck, 0.9)} wTop={24} wBot={18} fill={PAL.vest} round={20} />}
      {hb && <circle cx={lerpV(P.hip, P.neck, 0.62)[0]} cy={lerpV(P.hip, P.neck, 0.62)[1]} r={20} fill={PAL.gold} stroke={INK} strokeWidth={o * 0.7} />}
      {hb && <path d={`M${pt(lerpV(P.hip, P.neck, 0.78))} l-28,22 l30,6 Z M${pt(lerpV(P.hip, P.neck, 0.78))} l30,18 l-6,30 Z`} fill={PAL.hanbokSkirt} stroke={INK} strokeWidth={o * 0.7} strokeLinejoin="round" />}
      {/* neck + head */}
      <Limb pts={[P.neck, lerpV(P.neck, P.head, 0.6)]} w={30} fill={PAL.skin} />
      <g transform={`translate(${P.head[0]} ${P.head[1]}) rotate(${P.headRot})`}>
        <Head eyes={eyes} glasses={glasses} hairRot={P.hair} t={t} beat={beat} />
      </g>
      {arm(P.armF)}
      {held ? <g transform={`translate(${P.armF[2][0]} ${P.armF[2][1]})`}>{held}</g> : null}
    </g>
  );
};
