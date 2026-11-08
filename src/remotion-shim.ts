// Tiny stand-in for the one Remotion helper the shared art uses.
const parse = (c: string): [number, number, number] => { const h = c.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
export const interpolateColors = (v: number, input: number[], out: string[]) => {
  let i = 1; while (i < input.length - 1 && v > input[i]) i++;
  const p = Math.max(0, Math.min(1, (v - input[i - 1]) / (input[i] - input[i - 1])));
  const a = parse(out[i - 1]), b = parse(out[i]);
  return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * p)).join(",")})`;
};
