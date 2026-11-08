export const W = 1920;
export const H = 1080;
export const keyed = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0); }
  }
  return keys[keys.length - 1][1];
};
/** Colour is full in the game; the room module only uses it to balance the window light. */
export const satAt = (t: number) => keyed(t, [[0, 0.12], [16, 0.2], [31, 0.66], [47, 1], [183, 1], [213, 0.7], [222, 0.34], [232, 0.12], [255, 0.08]]);
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (p: number) => p * p * (3 - 2 * p);
export const rand = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
