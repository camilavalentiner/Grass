"use client";
import { useEffect, useRef } from "react";
import manifest from "./grass-layers.json";

/**
 * The crayon grass behind everything. The two big swirls are split into rings on their
 * own layers; on scroll the rings turn (inner faster than outer) and the loose strokes
 * drift sideways, easing to a stop when the page stops moving.
 */
export function GrassBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cur = window.scrollY, target = cur, raf = 0, running = false;
    const step = () => {
      const diff = target - cur;
      cur += diff * 0.1;
      el.style.setProperty("--gs", (cur * 0.028).toFixed(3));                 // degrees of swirl per px scrolled
      el.style.setProperty("--gv", Math.max(-16, Math.min(16, diff * 0.22)).toFixed(2)); // sideways drift while moving
      if (Math.abs(diff) > 0.05) raf = requestAnimationFrame(step);
      else { el.style.setProperty("--gv", "0"); running = false; }
    };
    const onScroll = () => {
      target = window.scrollY;
      if (!running) { running = true; raf = requestAnimationFrame(step); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  const [W, H] = manifest.canvas;
  return (
    <div ref={ref} className="grass" aria-hidden>
      <div className="grass-canvas">
        {manifest.layers.map((l) => (
          <div
            key={l.file}
            className="grass-layer"
            style={{
              backgroundImage: `url(/grass/${l.file}.svg)`,
              transformOrigin: l.origin ? `${(l.origin[0] / W) * 100}% ${(l.origin[1] / H) * 100}%` : undefined,
              transform: l.origin ? `rotate(calc(var(--gs, 0) * ${l.rate} * 1deg))` : "translateX(calc(var(--gv, 0) * 1px))",
            }}
          />
        ))}
      </div>
    </div>
  );
}
