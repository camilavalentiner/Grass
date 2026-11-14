// Generates public/grass.svg: child-drawn crayon grass in swirling strokes with daisies.
// Deterministic (seeded) so the file is reproducible.
import { writeFileSync } from "node:fs";

const W = 900, H = 1350;
let seed = 20261114;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const rr = (a, b) => a + (b - a) * rnd();
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

// swirl centres (x, y, strength, radius) — loosely after the reference drawing
const swirls = [
  [330, 640, 1.0, 520],
  [840, 900, 0.9, 300],
  [100, 1200, 0.7, 320],
  [720, 140, 0.6, 340],
];
function field(x, y) {
  let vx = 0.55, vy = 0.12; // gentle base drift
  for (const [cx, cy, s, r] of swirls) {
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) + 1;
    const w = s * Math.exp(-(d * d) / (2 * r * r)) * 1.6;
    vx += (-dy / d) * w; vy += (dx / d) * w;
  }
  const l = Math.hypot(vx, vy) || 1;
  return [vx / l, vy / l];
}

const greens = [
  ["#8fbc55", .75], ["#a6cb66", .8], ["#c3dc7c", .8], ["#6f9e46", .7],
  ["#9cc35f", .8], ["#d3e38f", .85], ["#5f8f3f", .55], ["#b5d473", .8],
  ["#7fae4e", .7], ["#dde9a2", .8], ["#4e7f3a", .45], ["#aacd5e", .75],
];

let paths = [];
const N = 9500;
for (let i = 0; i < N; i++) {
  let x = rr(-20, W + 20), y = rr(-20, H + 20);
  const len = rr(16, 54);
  const steps = 4;
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
  paths.push(`<path d="${d}" stroke="${c}" stroke-width="${w}" opacity="${(o + rr(-.12, .12)).toFixed(2)}"/>`);
}

// daisies
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="3"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .93  0 0 0 0 .95  0 0 0 0 .84  0 0 0 .25 .75"/>
  </filter>
</defs>
<rect width="${W}" height="${H}" fill="#e6edc9"/>
<rect width="${W}" height="${H}" filter="url(#paper)"/>
<g fill="none" stroke-linecap="round" filter="url(#crayon)">
${paths.join("\n")}
</g>
${daisies.join("\n")}
</svg>`;
writeFileSync("public/grass.svg", svg);
console.log("grass.svg", (svg.length / 1024).toFixed(0), "KB");
