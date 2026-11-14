"use client";
import { Tooltip, useTip, GRID, INK_MUTED } from "./common";

/** Five rows, one per star rating: a dot on a shared scale of points gained per focused hour, joined by a soft path. */
export function StarsPath({ rows }: { rows: { stars: number; sessions: number; perHour: number; minutes: number }[] }) {
  const { tip, show, hide } = useTip();
  const W = 320, rowH = 30, padL = 54, padR = 16, padT = 8;
  const H = padT + rowH * 5 + 4;
  const max = Math.max(10, ...rows.map((r) => r.perHour));
  const x = (v: number) => padL + (v / max) * (W - padL - padR);
  const pts = rows.filter((r) => r.sessions > 0).map((r) => [x(r.perHour), padT + (5 - r.stars) * rowH + rowH / 2] as const);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Results by drive rating">
        {rows.map((r) => {
          const cy = padT + (5 - r.stars) * rowH + rowH / 2;
          return (
            <g key={r.stars}>
              <line x1={padL} x2={W - padR} y1={cy} y2={cy} stroke={GRID} strokeWidth="1" />
              <text x={padL - 8} y={cy + 3} textAnchor="end" fontSize="9" fill={INK_MUTED}>{"★".repeat(r.stars)}</text>
            </g>
          );
        })}
        {pts.length > 1 && <path d={d} fill="none" stroke="#7fa6d6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity=".35" />}
        {rows.map((r) => {
          if (!r.sessions) return null;
          const cy = padT + (5 - r.stars) * rowH + rowH / 2;
          const rad = 4 + Math.min(5, r.sessions);
          return (
            <g key={r.stars} tabIndex={0} aria-label={`${r.stars} stars: ${Math.round(r.perHour)} points per hour over ${r.sessions} sessions`}
              onMouseEnter={(e) => show(e, `${"★".repeat(r.stars)} · ${r.sessions} session${r.sessions > 1 ? "s" : ""}`, [`${Math.round(r.perHour)} progress points per focused hour`, `${Math.round(r.minutes)} minutes in total`])} onMouseLeave={hide} onFocus={(e) => show(e, `${"★".repeat(r.stars)}`, [`${Math.round(r.perHour)} points per hour`])} onBlur={hide}>
              <circle cx={x(r.perHour)} cy={cy} r={rad + 2} fill="#fbf8ef" />
              <circle cx={x(r.perHour)} cy={cy} r={rad} fill="#2b3f5c" />
            </g>
          );
        })}
        <text x={W - padR} y={H - 2} textAnchor="end" fontSize="8.5" fill={INK_MUTED}>{Math.round(max)} pts / hour →</text>
      </svg>
      <Tooltip tip={tip} />
    </>
  );
}
