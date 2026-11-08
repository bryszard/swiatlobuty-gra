export type V = [number, number];
export type Pose = {
  hip: V; neck: V; head: V; headRot: number; hair: number;
  armF: [V, V, V]; armB: [V, V, V];
  legF: [V, V, V]; legB: [V, V, V];
  shoeF: number; shoeB: number; wingF: number; wingB: number; wingS: number;
  skirt: V[];
};

const fly: Pose = {
  hip: [0, 0], neck: [118, -62], head: [160, -114], headRot: -10, hair: 42,
  armF: [[104, -52], [196, -52], [282, -36]],
  armB: [[98, -58], [40, -122], [-22, -168]],
  legF: [[8, 8], [-62, 50], [-128, 0]],
  legB: [[-4, 10], [-74, 88], [-152, 72]],
  shoeF: 38, shoeB: 78, wingF: 205, wingB: 215, wingS: 1,
  skirt: [[24,-30],[78,-22],[60,40],[-50,118],[-200,112],[-215,30],[-120,-8]],
};

const sit: Pose = {
  hip: [0, 0], neck: [-20, -150], head: [-4, -226], headRot: -24, hair: 8,
  armF: [[-12, -132], [48, -82], [112, -98]],
  armB: [[-22, -130], [-86, -72], [-112, -12]],
  legF: [[10, 0], [150, -96], [262, -14]],
  legB: [[0, 6], [176, -6], [304, 30]],
  shoeF: 24, shoeB: 40, wingF: 250, wingB: 238, wingS: 0.8,
  skirt: [[-8,-24],[62,-34],[180,-84],[214,24],[110,50],[20,34],[-30,6]],
};

const wake: Pose = {
  hip: [0, 0], neck: [2, -142], head: [10, -218], headRot: 0, hair: 4,
  armF: [[8, -128], [96, -186], [122, -282]],
  armB: [[-4, -128], [-58, -206], [-76, -292]],
  legF: [[0, 0], [150, -14], [300, -6]],
  legB: [[0, 4], [150, 8], [300, 14]],
  shoeF: -70, shoeB: -70, wingF: 250, wingB: 235, wingS: 0.7,
  skirt: [[0,-12],[50,-12],[150,-2],[150,24],[80,26],[20,16],[-20,10]],
};

const sleep: Pose = {
  hip: [0, 0], neck: [-138, -10], head: [-208, -22], headRot: -78, hair: -60,
  armF: [[-124, -16], [-60, -4], [0, 4]],
  armB: [[-126, -14], [-62, 2], [-4, 10]],
  legF: [[0, 0], [150, -10], [290, -6]],
  legB: [[0, 4], [150, 4], [290, 8]],
  shoeF: -70, shoeB: -72, wingF: 255, wingB: 240, wingS: 0.7,
  skirt: [[0,-12],[50,-12],[150,-2],[150,24],[80,26],[20,16],[-20,10]],
};


const stand: Pose = {
  hip: [0, 0], neck: [0, -150], head: [8, -228], headRot: 0, hair: 8,
  armF: [[6, -134], [110, -166], [136, -250]],
  armB: [[-4, -134], [-30, -70], [-22, -8]],
  legF: [[8, 0], [16, 120], [18, 236]],
  legB: [[-6, 0], [-22, 118], [-34, 236]],
  shoeF: 0, shoeB: 0, wingF: 196, wingB: 186, wingS: 0.5,
  skirt: [[-6, -10], [40, -10], [90, 60], [96, 150], [0, 172], [-96, 150], [-80, 60]],
};

const cheer: Pose = {
  hip: [0, 0], neck: [4, -146], head: [10, -224], headRot: -4, hair: 20,
  armF: [[8, -132], [98, -196], [128, -286]],
  armB: [[-2, -132], [-56, -210], [-78, -294]],
  legF: [[8, 0], [74, 70], [34, 152]],
  legB: [[-6, 0], [-44, 82], [-22, 172]],
  shoeF: 70, shoeB: 80, wingF: 200, wingB: 188, wingS: 0.55,
  skirt: [[-6, -10], [40, -10], [100, 40], [110, 90], [10, 112], [-100, 90], [-76, 36]],
};

const dance: Pose = {
  hip: [0, 0], neck: [-12, -150], head: [-4, -228], headRot: 10, hair: 6,
  armF: [[-6, -136], [84, -200], [120, -292]],
  armB: [[-10, -134], [-82, -112], [-124, -62]],
  legF: [[8, 0], [74, 100], [150, 190]],
  legB: [[-6, 0], [-10, 120], [-14, 236]],
  shoeF: 20, shoeB: 0, wingF: 200, wingB: 190, wingS: 0.55,
  skirt: [[-6, -10], [40, -10], [110, 60], [176, 130], [40, 172], [-114, 164], [-82, 60]],
};

const cart: Pose = {
  hip: [0, 0], neck: [-8, -146], head: [0, -222], headRot: -6, hair: 18,
  armF: [[0, -132], [98, -190], [128, -280]],
  armB: [[-10, -132], [-52, -200], [-76, -284]],
  legF: [[10, 0], [130, -12], [142, 100]],
  legB: [[0, 6], [120, 12], [130, 112]],
  shoeF: 40, shoeB: 45, wingF: 232, wingB: 222, wingS: 0.6,
  skirt: [[0, -12], [50, -12], [130, -6], [150, 26], [60, 34], [-20, 26], [-24, 6]],
};

const run: Pose = {
  hip: [0, 0], neck: [52, -140], head: [86, -208], headRot: 4, hair: 28,
  armF: [[42, -128], [100, -82], [146, -112]],
  armB: [[38, -130], [-18, -92], [-68, -62]],
  legF: [[6, 0], [92, 40], [52, 132]],
  legB: [[-4, 0], [-60, 92], [-132, 122]],
  shoeF: 20, shoeB: 75, wingF: 188, wingB: 182, wingS: 0.6,
  skirt: [[0, -10], [50, -10], [120, 30], [112, 100], [10, 100], [-130, 70], [-90, 10]],
};

const edge: Pose = {
  hip: [0, 0], neck: [8, -148], head: [30, -218], headRot: 14, hair: 10,
  armF: [[14, -128], [84, -44], [112, 66]],
  armB: [[2, -132], [-22, -70], [-12, -6]],
  legF: [[10, 0], [98, 6], [112, 128]],
  legB: [[0, 4], [84, 16], [94, 138]],
  shoeF: 0, shoeB: 0, wingF: 205, wingB: 195, wingS: 0.5,
  skirt: [[0, -12], [50, -12], [130, -6], [150, 26], [60, 34], [-20, 26], [-24, 6]],
};

const bend: Pose = {
  hip: [0, 0], neck: [118, -62], head: [176, -98], headRot: 52, hair: 36,
  armF: [[126, -50], [172, 52], [186, 152]],
  armB: [[116, -56], [152, 62], [160, 168]],
  legF: [[10, 0], [98, 6], [112, 128]],
  legB: [[0, 4], [84, 16], [94, 138]],
  shoeF: 0, shoeB: 0, wingF: 205, wingB: 195, wingS: 0.5,
  skirt: [[0, -12], [50, -12], [130, -6], [150, 26], [60, 34], [-20, 26], [-24, 6]],
};

export const POSES = { bend, edge,  fly, sit, wake, sleep, stand, cheer, dance, cart, run };

export type PoseName = keyof typeof POSES;

const lerpAny = (a: any, b: any, p: number): any =>
  Array.isArray(a) ? a.map((v, i) => lerpAny(v, b[i], p)) : a + (b - a) * p;

export const mixPose = (a: PoseName, b: PoseName, p: number): Pose => {
  const A = POSES[a], B = POSES[b];
  const out: any = {};
  for (const k of Object.keys(A) as (keyof Pose)[]) out[k] = lerpAny(A[k], B[k], p);
  return out as Pose;
};

/** Conservative world-space bounds of Ala (limbs, wings, trail) for layout. */
export const poseBounds = (P: Pose, o: { x: number; y: number; scale: number; rot: number; flip: boolean; trail?: boolean }) => {
  const pts: V[] = [];
  const pad = (p: V, r: number) => { pts.push([p[0] - r, p[1] - r], [p[0] + r, p[1] + r], [p[0] - r, p[1] + r], [p[0] + r, p[1] - r]); };
  pad(P.head, 78); pad(P.neck, 60); pad(P.hip, 60);
  for (const a of [...P.armF, ...P.armB]) pad(a, 30);
  for (const l of [...P.legF, ...P.legB]) pad(l, 42);
  const wing = (an: V, ang: number, len: number) => {
    const r = (ang * Math.PI) / 180;
    pad([an[0] + Math.cos(r) * len * 0.5, an[1] + Math.sin(r) * len * 0.5], 70);
    pad([an[0] + Math.cos(r) * len * 0.95, an[1] + Math.sin(r) * len * 0.95], 60);
  };
  wing(P.legF[2], P.wingF, 245 * P.wingS); wing(P.legB[2], P.wingB, 210 * P.wingS);
  if (o.trail) { pad([P.legF[2][0] - 380, P.legF[2][1]], 40); pad([P.legB[2][0] - 340, P.legB[2][1]], 40); }
  const rad = (o.rot * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [px, py] of pts) {
    const fx = (o.flip ? -px : px) * o.scale, fy = py * o.scale;
    const wx = o.x + fx * c - fy * s, wy = o.y + fx * s + fy * c;
    x0 = Math.min(x0, wx); y0 = Math.min(y0, wy); x1 = Math.max(x1, wx); y1 = Math.max(y1, wy);
  }
  return { x0, y0, x1, y1 };
};
