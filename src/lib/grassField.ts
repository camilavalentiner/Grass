/**
 * The crayon grass: short strokes that follow a swirling field, plus daisies.
 * Deterministic (seeded), so the drawing is the same on every visit.
 * Design canvas is 900 × 1350 and is scaled to cover the screen.
 */
export const GRASS_W = 900;
export const GRASS_H = 1350;

export type Stroke = {
  pts: number[];      // x0,y0,x1,y1,... (5 points)
  cum: number[];      // cumulative length at each point
  len: number;
  color: string;
  width: number;
  alpha: number;
  k: number;          // how eagerly this stroke retracts (0.6 .. 1.8)
};
export type Daisy = { x: number; y: number; r: number; n: number; rot: number };

const swirls = [
  { cx: 330, cy: 640, s: 1.0, r: 520 },
  { cx: 840, cy: 900, s: 0.9, r: 300 },
  { cx: 100, cy: 1200, s: 0.7, r: 320 },
  { cx: 720, cy: 140, s: 0.6, r: 340 },
];
function field(x: number, y: number): [number, number] {
  let vx = 0.55, vy = 0.12;
  for (const { cx, cy, s, r } of swirls) {
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) + 1;
    const w = s * Math.exp(-(d * d) / (2 * r * r)) * 1.6;
    vx += (-dy / d) * w; vy += (dx / d) * w;
  }
  const l = Math.hypot(vx, vy) || 1;
  return [vx / l, vy / l];
}

const greens: [string, number][] = [
  ["#8fbc55", .75], ["#a6cb66", .8], ["#c3dc7c", .8], ["#6f9e46", .7],
  ["#9cc35f", .8], ["#d3e38f", .85], ["#5f8f3f", .55], ["#b5d473", .8],
  ["#7fae4e", .7], ["#dde9a2", .8], ["#4e7f3a", .45], ["#aacd5e", .75],
];

export function makeGrass(count = 9000, seedIn = 20261114): { strokes: Stroke[]; daisies: Daisy[] } {
  let seed = seedIn;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const rr = (a: number, b: number) => a + (b - a) * rnd();

  const strokes: Stroke[] = [];
  for (let i = 0; i < count; i++) {
    let x = rr(-20, GRASS_W + 20), y = rr(-20, GRASS_H + 20);
    const len = rr(16, 54), steps = 4;
    const pts = [x, y], cum = [0];
    for (let s = 0; s < steps; s++) {
      const [vx, vy] = field(x, y);
      const j = rr(-1.2, 1.2);
      const nx = x + vx * (len / steps) + j, ny = y + vy * (len / steps) + j * 0.6;
      cum.push(cum[cum.length - 1] + Math.hypot(nx - x, ny - y));
      pts.push(nx, ny); x = nx; y = ny;
    }
    const [color, o] = greens[Math.floor(rnd() * greens.length)];
    strokes.push({ pts, cum, len: cum[cum.length - 1], color, width: rr(2.4, 4.4), alpha: Math.min(1, Math.max(.2, o + rr(-.12, .12))), k: rr(0.6, 1.8) });
  }
  const daisies: Daisy[] = [];
  for (let i = 0; i < 26; i++) {
    daisies.push({ x: rr(30, GRASS_W - 30), y: rr(30, GRASS_H - 30), r: rr(7, 11), n: 7 + Math.floor(rnd() * 3), rot: rr(0, Math.PI) });
  }
  return { strokes, daisies };
}
