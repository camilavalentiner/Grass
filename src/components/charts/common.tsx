"use client";
import { useState, type ReactNode } from "react";
import type { ClassInfo } from "@/lib/types";

/** Chart marks use deeper steps of the class colours so they pass contrast on the paper surface. */
export const MARK: Record<ClassInfo["color"], string> = { blue: "#3a72c4", yellow: "#bf7a1f", pink: "#c4557d", green: "#4b8a36", lav: "#7d5bb5" };
export const WINDOW_COLOR = { analytical: "#3a72c4", reset: "#c4557d", creative: "#7d5bb5" } as const;
export const INK_MUTED = "#5f7a63";
export const GRID = "rgba(59,47,40,.12)";

export type Tip = { x: number; y: number; title: string; lines: string[] } | null;

/** A floating tooltip positioned inside the chart wrapper. */
export function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div role="tooltip" className="pointer-events-none absolute z-10 rounded-xl border border-[rgba(59,47,40,.2)] bg-paper px-2.5 py-1.5 text-xs shadow-md" style={{ left: tip.x, top: tip.y, transform: "translate(-50%, calc(-100% - 10px))" }}>
      <div className="font-semibold text-text-blue">{tip.title}</div>
      {tip.lines.map((l, i) => <div key={i} className="text-text">{l}</div>)}
    </div>
  );
}

export function useTip() {
  const [tip, setTip] = useState<Tip>(null);
  return { tip, show: (e: React.MouseEvent | React.FocusEvent, title: string, lines: string[]) => {
    const host = (e.currentTarget as Element).closest("[data-chart]") as HTMLElement | null;
    const r = (e.currentTarget as Element).getBoundingClientRect(); const h = host?.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2 - (h?.left ?? 0), y: r.top - (h?.top ?? 0), title, lines });
  }, hide: () => setTip(null) };
}

export function ChartCard({ title, sub, children, legend }: { title: string; sub?: string; children: ReactNode; legend?: { color: string; label: string; texture?: boolean }[] }) {
  return (
    <section className="card p-4">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h3 className="text-base font-semibold text-text-blue">{title}</h3>
        {legend && (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted" aria-label="Legend">
            {legend.map((l) => <li key={l.label} className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}</li>)}
          </ul>
        )}
      </div>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      <div className="relative mt-3" data-chart>{children}</div>
    </section>
  );
}

export const fmtH = (min: number) => (min >= 60 ? `${Math.round((min / 60) * 10) / 10}h` : `${Math.round(min)}m`);
