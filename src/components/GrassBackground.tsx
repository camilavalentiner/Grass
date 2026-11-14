"use client";
import { useEffect, useRef } from "react";
import { GRASS_H, GRASS_W, makeGrass, type Stroke } from "@/lib/grassField";

export type GrassMode = "retract" | "forward";

/**
 * The crayon grass behind everything, drawn on one canvas.
 * While the page scrolls, every stroke pulls back along its own line, as if the drawing
 * were being undone; when scrolling stops, the strokes draw themselves back in.
 * Each stroke has its own eagerness, so the effect ripples instead of flickering.
 *
 *  mode "retract": the tip returns toward where the stroke began.
 *  mode "forward": the tail chases the tip, so the stroke slides the way it points.
 */
export function GrassBackground({ mode = "retract", strength = 0.7 }: { mode?: GrassMode; strength?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { strokes, daisies } = makeGrass();
    // Batch strokes that share colour, width and opacity so each frame is a few dozen paths, not thousands.
    const batches = new Map<string, { color: string; width: number; alpha: number; items: Stroke[] }>();
    for (const s of strokes) {
      const width = Math.round(s.width * 2) / 2, alpha = Math.round(s.alpha * 5) / 5;
      const key = `${s.color}|${width}|${alpha}`;
      let b = batches.get(key);
      if (!b) { b = { color: s.color, width, alpha, items: [] }; batches.set(key, b); }
      b.items.push(s);
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let scale = 1, ox = 0, oy = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      scale = Math.max(w / GRASS_W, h / GRASS_H);          // cover
      ox = (w - GRASS_W * scale) / 2; oy = (h - GRASS_H * scale) / 2;
      draw(u);
    };

    /** Draw the part of a stroke that is still "on the page" for undo amount a (0 fully drawn .. 1 gone). */
    const strokePartial = (s: Stroke, a: number) => {
      const p = s.pts;
      if (a <= 0.001) {
        ctx.moveTo(p[0], p[1]);
        for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
        return;
      }
      if (a >= 0.999) return;
      const keep = s.len * (1 - a);
      // segment [from, to] along the path in length units
      const from = mode === "retract" ? 0 : s.len - keep;
      const to = mode === "retract" ? keep : s.len;
      let started = false;
      for (let i = 0; i < s.cum.length - 1; i++) {
        const c0 = s.cum[i], c1 = s.cum[i + 1];
        if (c1 < from || c0 > to) continue;
        const x0 = p[i * 2], y0 = p[i * 2 + 1], x1 = p[i * 2 + 2], y1 = p[i * 2 + 3];
        const segLen = c1 - c0 || 1;
        const t0 = Math.max(0, (from - c0) / segLen), t1 = Math.min(1, (to - c0) / segLen);
        const ax = x0 + (x1 - x0) * t0, ay = y0 + (y1 - y0) * t0;
        const bx = x0 + (x1 - x0) * t1, by = y0 + (y1 - y0) * t1;
        if (!started) { ctx.moveTo(ax, ay); started = true; }
        ctx.lineTo(bx, by);
      }
    };

    const draw = (undo: number) => {
      const t0 = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#e6edc9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ox * dpr, oy * dpr);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (const b of batches.values()) {
        ctx.beginPath();
        for (const s of b.items) {
          const a = Math.min(1, Math.max(0, undo * s.k));
          if (a >= 0.999) continue;
          strokePartial(s, a);
        }
        ctx.globalAlpha = b.alpha;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const d of daisies) {
        for (let i = 0; i < d.n; i++) {
          const ang = d.rot + (i / d.n) * Math.PI * 2;
          const px = d.x + Math.cos(ang) * d.r * 0.85, py = d.y + Math.sin(ang) * d.r * 0.85;
          ctx.beginPath();
          ctx.ellipse(px, py, d.r * 0.55, d.r * 0.34, ang, 0, Math.PI * 2);
          ctx.fillStyle = "#fffdf6"; ctx.fill();
          ctx.lineWidth = 0.8; ctx.strokeStyle = "#8a7f6a"; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "#f3d55b"; ctx.fill(); ctx.strokeStyle = "#b9962e"; ctx.stroke();
      }
      (window as unknown as { __grassDrawMs?: number }).__grassDrawMs = performance.now() - t0;
    };

    // scroll → undo amount. Velocity pulls the strokes back; stillness lets them redraw.
    let u = 0, target = 0, last = window.scrollY, raf = 0, running = false, lastT = performance.now();
    const step = (t: number) => {
      const dt = Math.min(50, t - lastT) || 16; lastT = t;
      target *= Math.pow(0.0025, dt / 1000);           // velocity memory fades quickly once scrolling stops
      u += (target - u) * (target > u ? 0.35 : 0.08);  // pull back fast, redraw slowly
      draw(u);
      if (Math.abs(target - u) > 0.002 || target > 0.002) raf = requestAnimationFrame(step);
      else { u = 0; draw(0); running = false; }
    };
    const onScroll = () => {
      const y = window.scrollY, dy = Math.abs(y - last); last = y;
      target = Math.min(strength, target + dy / 420);
      if (!running) { running = true; lastT = performance.now(); raf = requestAnimationFrame(step); }
    };
    resize();
    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [mode, strength]);
  return <canvas ref={ref} className="grass" aria-hidden />;
}
