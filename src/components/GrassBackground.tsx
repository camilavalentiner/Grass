"use client";
import { useEffect, useRef } from "react";
import { GRASS_H, GRASS_W, makeGrass, type Stroke } from "@/lib/grassField";

/** The crayon grass behind everything: drawn once on one canvas, redrawn only when the window resizes. */
export function GrassBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { strokes, daisies } = makeGrass();
    // batch strokes that share colour, width and opacity so a redraw is a few dozen paths
    const batches = new Map<string, { color: string; width: number; alpha: number; items: Stroke[] }>();
    for (const s of strokes) {
      const width = Math.round(s.width * 2) / 2, alpha = Math.round(s.alpha * 5) / 5;
      const key = `${s.color}|${width}|${alpha}`;
      const b = batches.get(key) ?? { color: s.color, width, alpha, items: [] };
      b.items.push(s); batches.set(key, b);
    }
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      const scale = Math.max(w / GRASS_W, h / GRASS_H);
      const ox = (w - GRASS_W * scale) / 2, oy = (h - GRASS_H * scale) / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#e6edc9"; ctx.fillRect(0, 0, w, h);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ox * dpr, oy * dpr);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (const b of batches.values()) {
        ctx.beginPath();
        for (const s of b.items) {
          const p = s.pts;
          ctx.moveTo(p[0], p[1]);
          for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
        }
        ctx.globalAlpha = b.alpha; ctx.strokeStyle = b.color; ctx.lineWidth = b.width; ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const d of daisies) {
        for (let i = 0; i < d.n; i++) {
          const ang = d.rot + (i / d.n) * Math.PI * 2;
          const px = d.x + Math.cos(ang) * d.r * 0.85, py = d.y + Math.sin(ang) * d.r * 0.85;
          ctx.beginPath(); ctx.ellipse(px, py, d.r * 0.55, d.r * 0.34, ang, 0, Math.PI * 2);
          ctx.fillStyle = "#fffdf6"; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = "#8a7f6a"; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "#f3d55b"; ctx.fill(); ctx.strokeStyle = "#b9962e"; ctx.stroke();
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);
  return <canvas ref={ref} className="grass" aria-hidden />;
}
