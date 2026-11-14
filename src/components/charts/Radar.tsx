"use client";
import { Tooltip, useTip, GRID, INK_MUTED, MARK } from "./common";
import type { classShape } from "@/lib/stats";

type Shape = ReturnType<typeof classShape>[number];
const AXES: { key: keyof Pick<Shape, "standing" | "completion" | "workload" | "urgency">; label: string; hint: string }[] = [
  { key: "standing", label: "Standing", hint: "current grade over target" },
  { key: "completion", label: "Done", hint: "share of this class's work finished" },
  { key: "workload", label: "Workload", hint: "open effort, relative to your busiest class" },
  { key: "urgency", label: "Urgency", hint: "how soon the next deadline is" },
];

/** One soft polygon per class on four axes, washes at low opacity, legend carried by the parent. */
export function Radar({ shapes }: { shapes: Shape[] }) {
  const { tip, show, hide } = useTip();
  const S = 260, cx = S / 2, cy = S / 2 + 4, R = 88;
  const pt = (i: number, v: number) => { const a = -Math.PI / 2 + (i / AXES.length) * Math.PI * 2; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const; };
  return (
    <>
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[320px] mx-auto h-auto" role="img" aria-label="Class shapes">
        {[0.25, 0.5, 0.75, 1].map((r) => <polygon key={r} points={AXES.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke={GRID} strokeWidth="1" />)}
        {AXES.map((a, i) => { const [x, y] = pt(i, 1.22); return <text key={a.key} x={x} y={y + 3} textAnchor="middle" fontSize="9.5" fill={INK_MUTED}>{a.label}</text>; })}
        {shapes.map((s) => {
          const color = MARK[s.cls.color];
          const points = AXES.map((a, i) => pt(i, Math.max(0.03, s[a.key])));
          return (
            <g key={s.cls.id} tabIndex={0} aria-label={`${s.cls.code ?? s.cls.name}: standing ${Math.round(s.standing * 100)}%, done ${Math.round(s.completion * 100)}%, workload ${Math.round(s.workload * 100)}%, urgency ${Math.round(s.urgency * 100)}%`}
              onMouseEnter={(e) => show(e, s.cls.code ?? s.cls.name, AXES.map((a) => `${a.label}: ${Math.round(s[a.key] * 100)}%`))} onMouseLeave={hide} onFocus={(e) => show(e, s.cls.code ?? s.cls.name, AXES.map((a) => `${a.label}: ${Math.round(s[a.key] * 100)}%`))} onBlur={hide}>
              <polygon points={points.map((p) => p.join(",")).join(" ")} fill={color} opacity=".12" />
              <polygon points={points.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
              {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color} stroke="#fbf8ef" strokeWidth="2" />)}
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </>
  );
}
