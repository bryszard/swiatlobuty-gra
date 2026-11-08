export type LevelId = "krakow" | "korea" | "spain" | "rabko";
export type Kind = "spark" | "bonus" | "pigeon" | "kite" | "jet" | "bumper" | "bolt" | "lift" | "ring";
export type Ent = { id: number; kind: Kind; x: number; y: number; r: number; amp?: number; per?: number; ph: number; taken?: boolean; h?: number; v?: number; cx?: number; cy?: number; t0?: number; st?: number; done?: boolean };

export type LevelDef = {
  id: LevelId; n: number; name: string; sub: string; hint: string; music: string; bg: LevelId;
  outfit: "jacket" | "hanbok"; speed: number; secs: number; accent: string; bonusName: string;
};

export const LEVELS: LevelDef[] = [
  { id: "krakow", n: 1, name: "Kraków", sub: "Nad Wisłą i Wawelem", hint: "Zbieraj iskry i obwarzanki. Ala leci sama, a TURBO przyspiesza!", music: "cracow", bg: "krakow", outfit: "jacket", speed: 235, secs: 64, accent: "#ff9a3c", bonusName: "obwarzanki" },
  { id: "korea", n: 2, name: "Korea", sub: "Miasto świateł", hint: "Lampiony niosą Alę w górę. Ala leci sama, a TURBO przyspiesza!", music: "korea", bg: "korea", outfit: "hanbok", speed: 245, secs: 64, accent: "#ff5f6a", bonusName: "lampiony" },
  { id: "spain", n: 3, name: "Hiszpania", sub: "Zaćmienie i flamenco", hint: "Zbieraj pomarańcze i gwiazdki. Ala leci sama, a TURBO przyspiesza!", music: "spain", bg: "spain", outfit: "jacket", speed: 255, secs: 64, accent: "#ffcf4a", bonusName: "pomarańcze" },
  { id: "rabko", n: 4, name: "Rabkoland", sub: "Karuzela i kolejka górska", hint: "Przelatuj przez obręcze i łap balony. Ala leci sama, a TURBO przyspiesza!", music: "rabkoland", bg: "rabko", outfit: "jacket", speed: 265, secs: 64, accent: "#ff7ad9", bonusName: "balony" },
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
  while (x < L - 1500) {
    const t = x / L, mid = cl(Y0 + 80 + R() * (Y1 - Y0 - 160));
    const pick = R();
    let len = 0;
    // shared star patterns; every level gets its own flavour on top
    const common = (p: number) => {
      if (p < 0.14) return sparksArc(x, mid + 60, 9, 90, 180);
      if (p < 0.26) return sparksWave(x, mid, 10, 85, 130);
      if (p < 0.36) return heart(x + 200, mid, 12);
      if (p < 0.46) return zigzag(x, mid, 10, 90, 100);
      if (p < 0.55) return stairs(x, mid > 500 ? 780 : 300, 11, mid > 500);
      if (p < 0.64) return spiral(x, mid);
      if (p < 0.72) return twin(x, mid);
      if (p < 0.82) return starShape(x + 200, mid, 150);
      if (p < 0.92) return bonusTrail(x, mid);
      return bonusBurst(x, mid);
    };
    if (d.id === "korea" && pick < 0.3) {
      const lx = x + 100; add("lift", lx, 880, { h: 620 }); sparksLine(lx + 20, 800, 6, 0, -105); len = sparksArc(lx + 160, 260, 7, 80, 60); if (R() > 0.5) add("bonus", lx + 340, 300, { v: 3 });
    } else if (d.id === "rabko" && pick < 0.3) {
      const cy = cl(mid); for (let i = 0; i < 3; i++) { const ry = cl(cy + Math.sin(i * 1.3) * 110); add("ring", x + 120 + i * 340, ry, { v: 3 }); sparksLine(x + 200 + i * 340, ry, 3, 50, 0); } len = 1050;
    } else len = common(d.id === "korea" || d.id === "rabko" ? (pick - 0.3) / 0.7 : pick);
    x += Math.max(len, 480) + 160 + R() * 200; k++;
  }
  const sparkTotal = ents.filter((e) => e.kind === "spark").length + ents.filter((e) => e.kind === "bonus" || e.kind === "ring").length * 3;
  return { ents, sparkTotal };
}
