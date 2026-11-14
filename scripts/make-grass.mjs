// Generates public/grass/*.svg: child-drawn crayon grass in swirling strokes with daisies,
// split into layers so the two big swirls can turn on scroll. Deterministic (seeded).
import { writeFileSync, mkdirSync } from "node:fs";

const W = 900, H = 1350;
let seed = 20261114;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const rr = (a, b) => a + (b - a) * rnd();
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

// swirl centres (x, y, strength, radius)
export const swirls = [
  { id: "a", cx: 330, cy: 640, s: 1.0, r: 520, rings: 3 },
  { id: "b", cx: 840, cy: 900, s: 0.9, r: 300, rings: 2 },
  { id: "c", cx: 100, cy: 1200, s: 0.7, r: 320, rings: 0 },
  { id: "d", cx: 720, cy: 140, s: 0.6, r: 340, rings: 0 },
];
function field(x, y) {
  let vx = 0.55, vy = 0.12;
  for (const { cx, cy, s, r } of swirls) {
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) + 1;
    const w = s * Math.exp(-(d * d) / (2 * r * r)) * 1.6;
    vx += (-dy / d) * w; vy += (dx / d) * w;
  }
  const l = Math.hypot(vx, vy) || 1;
  return [vx / l, vy / l];
}
/** Which layer a point belongs to: a0..a2, b0..b1, or base. */
function layerFor(x, y) {
  let best = null;
  for (const sw of swirls) {
    if (!sw.rings) continue;
    const d = Math.hypot(x - sw.cx, y - sw.cy);
    const reach = sw.r * (sw.id === "a" ? 0.78 : 0.72);
    if (d < reach && (!best || d / reach < best.rel)) best = { sw, d, rel: d / reach, reach };
  }
  if (!best) return "base";
  const ring = Math.min(best.sw.rings - 1, Math.floor(best.rel * best.sw.rings));
  return `${best.sw.id}${ring}`;
}

const greens = [
  ["#8fbc55", .75], ["#a6cb66", .8], ["#c3dc7c", .8], ["#6f9e46", .7],
  ["#9cc35f", .8], ["#d3e38f", .85], ["#5f8f3f", .55], ["#b5d473", .8],
  ["#7fae4e", .7], ["#dde9a2", .8], ["#4e7f3a", .45], ["#aacd5e", .75],
];

const layers = {};
const add = (k, s) => (layers[k] ??= []).push(s);
const N = 9500;
for (let i = 0; i < N; i++) {
  let x = rr(-20, W + 20), y = rr(-20, H + 20);
  const sx = x, sy = y;
  const len = rr(16, 54), steps = 4;
  let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
  for (let s = 0; s < steps; s++) {
    const [vx, vy] = field(x, y);
    const jitter = rr(-1.2, 1.2);
    const nx = x + vx * (len / steps) + jitter, ny = y + vy * (len / steps) + jitter * 0.6;
    d += `l${(nx - x).toFixed(0)} ${(ny - y).toFixed(0)}`;
    x = nx; y = ny;
  }
  const [c, o] = pick(greens);
  const w = rr(2.4, 4.4).toFixed(1);
  add(layerFor((sx + x) / 2, (sy + y) / 2), `<path d="${d}" stroke="${c}" stroke-width="${w}" opacity="${(o + rr(-.12, .12)).toFixed(2)}"/>`);
}

let daisies = [];
for (let i = 0; i < 26; i++) {
  const cx = rr(30, W - 30), cy = rr(30, H - 30), r = rr(7, 11);
  const n = 7 + Math.floor(rnd() * 3);
  let petals = "";
  for (let p = 0; p < n; p++) {
    const a = (p / n) * Math.PI * 2 + rr(-.15, .15);
    const px = cx + Math.cos(a) * r * 0.85, py = cy + Math.sin(a) * r * 0.85;
    petals += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r*.55).toFixed(1)}" ry="${(r*.34).toFixed(1)}" transform="rotate(${(a*180/Math.PI).toFixed(0)} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
  }
  daisies.push(`<g fill="#fffdf6" stroke="#8a7f6a" stroke-width=".8" opacity=".95">${petals}<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r*.42).toFixed(1)}" fill="#f3d55b" stroke="#b9962e"/></g>`);
}

mkdirSync("public/grass", { recursive: true });
const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
const strokes = (k) => `<g fill="none" stroke-linecap="round">\n${(layers[k] ?? []).join("\n")}\n</g>`;
let total = 0;
const write = (name, body) => { const svg = `${head}\n${body}\n</svg>`; writeFileSync(`public/grass/${name}.svg`, svg); total += svg.length; console.log(name, (svg.length / 1024).toFixed(0), "KB"); };

write("base", `<defs><filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .93  0 0 0 0 .95  0 0 0 0 .84  0 0 0 .25 .75"/></filter></defs>
<rect width="${W}" height="${H}" fill="#e6edc9"/><rect width="${W}" height="${H}" filter="url(#paper)"/>
${strokes("base")}
${daisies.join("\n")}`);
for (const k of ["a0", "a1", "a2", "b0", "b1"]) write(k, strokes(k));
console.log("total", (total / 1024).toFixed(0), "KB");

// layer manifest for the component
const manifest = {
  canvas: [W, H],
  layers: [
    { file: "base", origin: null, rate: 0 },
    ...["a0", "a1", "a2"].map((k, i) => ({ file: k, origin: [swirls[0].cx, swirls[0].cy], rate: [1, 0.72, 0.48][i] })),
    ...["b0", "b1"].map((k, i) => ({ file: k, origin: [swirls[1].cx, swirls[1].cy], rate: [0.9, 0.55][i] })),
  ],
};
writeFileSync("src/components/grass-layers.json", JSON.stringify(manifest, null, 2));
