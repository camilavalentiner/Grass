"use client";
import { Tooltip, useTip, GRID, INK_MUTED } from "./common";

type Col = { label: string; value: number; color: string; title: string; lines: string[]; faint?: boolean };

/** Thin columns from one baseline, 4px rounded tops, hairline grid, hover tooltip. */
export function Columns({ cols, height = 150, yTicks = 3, unit = "", bands }: { cols: Col[]; height?: number; yTicks?: number; unit?: string; bands?: { from: number; to: number; label: string; color: string }[] }) {
  const { tip, show, hide } = useTip();
  const W = 320, padL = 28, padB = 22, padT = 8;
  const max = Math.max(1, ...cols.map((c) => c.value));
  const nice = Math.ceil(max / yTicks) * yTicks;
  const plotH = height - padB - padT, plotW = W - padL - 4;
  const slot = plotW / cols.length, bw = Math.min(24, Math.max(4, slot - 2));
  const y = (v: number) => padT + plotH - (v / nice) * plotH;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto" role="img" aria-label="Column chart">
        {bands?.map((b) => (
          <g key={b.label}>
            <rect x={padL + b.from * slot} y={padT} width={(b.to - b.from) * slot} height={plotH} fill={b.color} opacity=".07" />
            <text x={padL + ((b.from + b.to) / 2) * slot} y={height - 2} textAnchor="middle" fontSize="8.5" fill={INK_MUTED}>{b.label}</text>
          </g>
        ))}
        {Array.from({ length: yTicks + 1 }, (_, i) => (nice / yTicks) * i).map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - 4} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 4} y={y(v) + 3} textAnchor="end" fontSize="8.5" fill={INK_MUTED}>{v}{unit}</text>
          </g>
        ))}
        {cols.map((c, i) => {
          const x = padL + i * slot + (slot - bw) / 2;
          const h = Math.max(0, y(0) - y(c.value));
          const r = Math.min(4, h / 2);
          return (
            <g key={i}>
              {c.value > 0 && (
                <path d={`M${x} ${y(0)} v${-(h - r)} q0 ${-r} ${r} ${-r} h${bw - 2 * r} q${r} 0 ${r} ${r} v${h - r} z`} fill={c.color} opacity={c.faint ? 0.35 : 1} />
              )}
              <rect x={padL + i * slot} y={padT} width={slot} height={plotH} fill="transparent" tabIndex={0} aria-label={`${c.title}: ${c.lines.join(", ")}`}
                onMouseEnter={(e) => show(e, c.title, c.lines)} onMouseLeave={hide} onFocus={(e) => show(e, c.title, c.lines)} onBlur={hide} />
              {!bands && c.label && <text x={x + bw / 2} y={height - 8} textAnchor="middle" fontSize="8.5" fill={INK_MUTED}>{c.label}</text>}
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </>
  );
}
