export type LevelId = "krakow" | "korea" | "spain" | "london" | "rabko";
export type Kind = "spark" | "bonus" | "pigeon" | "kite" | "jet" | "bumper" | "bolt" | "lift" | "ring";
export type Ent = { id: number; kind: Kind; x: number; y: number; r: number; amp?: number; per?: number; ph: number; taken?: boolean; h?: number; v?: number; cx?: number; cy?: number; t0?: number; st?: number; done?: boolean };

export type LevelDef = {
  id: LevelId; n: number; name: string; sub: string; hint: string; music: string; bg: LevelId;
  outfit: "jacket" | "hanbok"; speed: number; secs: number; accent: string; bonusName: string;
};

export const LEVELS: LevelDef[] = [
  { id: "krakow", n: 1, name: "Kraków", sub: "Nad Wisłą i Wawelem", hint: "Zbieraj iskry i obwarzanki. Ala leci sama, a TURBO przyspiesza!", music: "cracow", bg: "krakow", outfit: "jacket", speed: 235, secs: 100, accent: "#ff9a3c", bonusName: "obwarzanki" },
  { id: "korea", n: 2, name: "Korea", sub: "Miasto świateł", hint: "Lampiony niosą Alę w górę. Ala leci sama, a TURBO przyspiesza!", music: "korea", bg: "korea", outfit: "hanbok", speed: 245, secs: 105, accent: "#ff5f6a", bonusName: "lampiony" },
  { id: "spain", n: 3, name: "Hiszpania", sub: "Zaćmienie i flamenco", hint: "Zbieraj pomarańcze i gwiazdki. Ala leci sama, a TURBO przyspiesza!", music: "spain", bg: "spain", outfit: "jacket", speed: 255, secs: 110, accent: "#ffcf4a", bonusName: "pomarańcze" },
  { id: "london", n: 4, name: "Londyn", sub: "Big Ben, Tamiza i herbatka", hint: "Zbieraj filiżanki herbaty. Ala leci sama, a TURBO przyspiesza!", music: "london", bg: "london", outfit: "jacket", speed: 255, secs: 110, accent: "#e03a3e", bonusName: "herbatki" },
  { id: "rabko", n: 5, name: "Rabkoland", sub: "Karuzela i kolejka górska", hint: "Przelatuj przez obręcze i łap balony. Ala leci sama, a TURBO przyspiesza!", music: "rabkoland", bg: "rabko", outfit: "jacket", speed: 265, secs: 120, accent: "#ff7ad9", bonusName: "balony" },
];

const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const Y0 = 190, Y1 = 830;

export function levelLength(d: LevelDef) { return Math.round(d.speed * d.secs); }

export function generate(d: LevelDef): { ents: Ent[]; sparkTotal: number } {
  const R = rng(d.n * 7919 + 13), L = levelLength(d);
  const ents: Ent[] = []; let id = 1;
  const add = (kind: Kind, x: number, y: number, extra: Partial<Ent> = {}) => { ents.push({ id: id++, kind, x, y, r: kind === "spark" ? 30 : kind === "bonus" ? 42 : 50, ph: R() * 6.28, ...extra }); };
  const cl = (y: number) => Math.max(Y0, Math.min(Y1, y));
  let x = 1500, k = 0;
  const sparksArc = (x0: number, y0: number, n: number, dx: number, amp: number) => { for (let i = 0; i < n; i++) add("spark", x0 + i * dx, cl(y0 - Math.sin((i / (n - 1)) * Math.PI) * amp)); return n * dx; };
  const sparksLine = (x0: number, y0: number, n: number, dx: number, dy = 0) => { for (let i = 0; i < n; i++) add("spark", x0 + i * dx, cl(y0 + i * dy)); return n * dx; };
  const sparksWave = (x0: number, y0: number, n: number, dx: number, amp: number) => { for (let i = 0; i < n; i++) add("spark", x0 + i * dx, cl(y0 + Math.sin(i * 0.9) * amp)); return n * dx; };
  const sparksCircle = (cx: number, cy: number, rad: number, n: number) => { for (let i = 0; i < n; i++) add("spark", cx + Math.cos((i / n) * 6.283) * rad, cl(cy + Math.sin((i / n) * 6.283) * rad)); };
  const heart = (cx: number, cy: number, sc: number) => { const n = 14; for (let i = 0; i < n; i++) { const a = (i / n) * 6.283; add("spark", cx + 16 * Math.pow(Math.sin(a), 3) * sc, cl(cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * sc)); } return 16 * sc * 2 + 120; };
  const starShape = (cx: number, cy: number, rad: number) => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * 6.283, rr = i % 2 ? rad * 0.45 : rad; add("spark", cx + Math.cos(a) * rr, cl(cy + Math.sin(a) * rr)); } add("bonus", cx, cl(cy), { v: 3 }); return rad * 2 + 100; };
  const zigzag = (x0: number, y0: number, n: number, dx: number, amp: number) => { for (let i = 0; i < n; i++) add("spark", x0 + i * dx, cl(y0 + (i % 2 ? amp : -amp))); return n * dx; };
  const stairs = (x0: number, y0: number, n: number, up: boolean) => { for (let i = 0; i < n; i++) add("spark", x0 + i * 80, cl(y0 + (up ? -i : i) * 55)); return n * 80; };
  const spiral = (x0: number, y0: number) => { for (let i = 0; i < 16; i++) { const a = i * 0.7; add("spark", x0 + i * 38, cl(y0 + Math.sin(a) * (40 + i * 9))); } return 16 * 38; };
  const twin = (x0: number, y0: number) => { for (let i = 0; i < 9; i++) { add("spark", x0 + i * 80, cl(y0 - 90 + Math.sin(i * 0.7) * 50)); add("spark", x0 + i * 80, cl(y0 + 90 + Math.sin(i * 0.7 + 3.1) * 50)); } return 9 * 80; };
  const bonusTrail = (x0: number, y0: number) => { for (let i = 0; i < 4; i++) add("bonus", x0 + i * 170, cl(y0 + Math.sin(i * 1.2) * 130), { v: 3 }); return 4 * 170; };
  const bonusBurst = (x0: number, y0: number) => { add("bonus", x0 + 150, y0, { v: 3 }); sparksCircle(x0 + 150, y0, 130, 8); return 420; };
  const diamond = (cx: number, cy: number, r: number) => { for (let i = 0; i < 12; i++) { const a = (i / 12) * 4, q = Math.floor(a), f = a - q; const pts = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1]]; add("spark", cx + (pts[q][0] + (pts[q + 1][0] - pts[q][0]) * f) * r * 1.3, cl(cy + (pts[q][1] + (pts[q + 1][1] - pts[q][1]) * f) * r)); } add("bonus", cx, cl(cy), { v: 3 }); return r * 2.6 + 100; };
  const vee = (x0: number, y0: number, up: boolean) => { for (let i = 0; i < 11; i++) { const k = Math.abs(i - 5); add("spark", x0 + i * 75, cl(y0 + (up ? 1 : -1) * (150 - k * 50))); } return 11 * 75; };
  const snake = (x0: number, y0: number) => { for (let i = 0; i < 22; i++) add("spark", x0 + i * 52, cl(y0 + Math.sin(i * 0.5) * 210)); return 22 * 52; };
  const grid = (x0: number, y0: number) => { for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) add("spark", x0 + c * 80, cl(y0 + (r - 1) * 110)); return 6 * 80 + 40; };
  const columns = (x0: number, y0: number) => { for (let c = 0; c < 5; c++) for (let r = 0; r < 5; r++) add("spark", x0 + c * 150, cl(y0 + (r - 2) * 85 + (c % 2 ? 40 : 0))); return 5 * 150; };
  const bigCircle = (cx: number, cy: number) => { sparksCircle(cx, cy, 230, 14); sparksCircle(cx, cy, 120, 8); add("bonus", cx, cl(cy), { v: 3 }); return 560; };
  const triple = (x0: number, y0: number) => { for (let i = 0; i < 9; i++) for (let r = -1; r <= 1; r++) add("spark", x0 + i * 78, cl(y0 + r * 130 + Math.sin(i * 0.8 + r) * 40)); return 9 * 78; };
  const twoHearts = (x0: number, y0: number) => { heart(x0 + 160, y0 - 40, 9); return heart(x0 + 560, y0 + 40, 9) + 460; };
  const bonusRain = (x0: number) => { for (let i = 0; i < 6; i++) add("bonus", x0 + i * 130, cl(Y0 + 40 + ((i * 3) % 6) * 110), { v: 3 }); for (let i = 0; i < 12; i++) add("spark", x0 + 60 + i * 65, cl(Y0 + 80 + ((i * 5) % 7) * 90)); return 800; };
  type Pat = (x0: number, m: number) => number;
  const pats: Pat[] = [
    (x0, m) => sparksArc(x0, m + 60, 9, 90, 180), (x0, m) => sparksWave(x0, m, 12, 85, 130), (x0, m) => heart(x0 + 200, m, 12), (x0, m) => zigzag(x0, m, 12, 90, 100),
    (x0, m) => stairs(x0, m > 500 ? 780 : 300, 11, m > 500), (x0, m) => spiral(x0, m), (x0, m) => twin(x0, m), (x0, m) => starShape(x0 + 200, m, 150), (x0, m) => bonusTrail(x0, m),
    (x0, m) => bonusBurst(x0, m), (x0, m) => diamond(x0 + 220, m, 160), (x0, m) => vee(x0, m, m < 500), (x0, m) => snake(x0, m), (x0, m) => grid(x0, m), (x0, m) => columns(x0, m),
    (x0, m) => bigCircle(x0 + 280, m), (x0, m) => triple(x0, m), (x0, m) => twoHearts(x0, m), (x0) => bonusRain(x0),
  ];
  let bag: number[] = [], last = -1;
  const nextPat = () => { if (!bag.length) { bag = pats.map((_, i) => i); for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; } if (bag[bag.length - 1] === last) bag.reverse(); } last = bag.pop()!; return last; };
  while (x < L - 1500) {
    const mid = cl(Y0 + 120 + R() * (Y1 - Y0 - 240));
    const pick = R();
    let len = 0;
    if (d.id === "korea" && pick < 0.2) {
      const lx = x + 100; add("lift", lx, 880, { h: 620 }); sparksLine(lx + 20, 800, 6, 0, -105); len = sparksArc(lx + 160, 260, 7, 80, 60); if (R() > 0.5) add("bonus", lx + 340, 300, { v: 3 }); sparksWave(lx + 600, 330, 8, 80, 90); len += 700;
    } else if (d.id === "rabko" && pick < 0.2) {
      const cy = cl(mid); for (let i = 0; i < 3; i++) { const ry = cl(cy + Math.sin(i * 1.3) * 110); add("ring", x + 120 + i * 340, ry, { v: 3 }); sparksLine(x + 200 + i * 340, ry, 3, 50, 0); } len = 1050;
    } else {
      len = pats[nextPat()](x, mid);
      if (pick > 0.7) { const x2 = x + len + 90, m2 = cl(Y0 + 120 + R() * (Y1 - Y0 - 240)); len = x2 - x + pats[nextPat()](x2, m2); } // chained pair, no gap
    }
    x += Math.max(len, 460) + 110 + R() * 150;
  }
  const sparkTotal = ents.filter((e) => e.kind === "spark").length + ents.filter((e) => e.kind === "bonus" || e.kind === "ring").length * 3;
  return { ents, sparkTotal };
}
