"use client";
import type { ClassInfo, Task } from "@/lib/types";
import { effectiveRemainingMin } from "@/lib/engine";

const classTint: Record<ClassInfo["color"], string> = {
  blue: "var(--blue)", pink: "var(--pink)", green: "var(--green)", yellow: "var(--yellow)", lav: "#e6d6f0",
};

export function fmtDue(iso: string, now = new Date()) {
  const d = new Date(iso);
  const days = Math.round((new Date(d.toDateString()).getTime() - new Date(now.toDateString()).getTime()) / 864e5);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (days === 0) return `today · ${time}`;
  if (days === 1) return `tomorrow · ${time}`;
  if (days < 7) return `${d.toLocaleDateString(undefined, { weekday: "short" })} · ${time}`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
export const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);

export function TaskRow({ task, cls, now, onToggle }: { task: Task; cls?: ClassInfo; now: Date; onToggle?: () => void }) {
  const done = task.progress >= 100;
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-dashed border-[rgba(59,47,40,.18)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className="mt-0.5 shrink-0 w-6 h-6 rounded-md border-[1.6px] border-ink/60 bg-paper-2 grid place-items-center"
        style={{ transform: "rotate(-2deg)" }}
      >
        {done && (
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 13 l5 5 L20 6" fill="none" stroke="#2f4a32" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className={`font-medium leading-snug ${done ? "strike text-text-muted" : "text-text"}`}>{task.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-text-muted">
          <span className="px-2 py-0.5 rounded-full border border-[rgba(59,47,40,.18)]" style={{ background: cls ? classTint[cls.color] : "var(--paper-2)", color: "var(--text-blue)" }}>
            {cls?.code ?? cls?.name ?? "—"}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-paper-2">{fmtDue(task.due, now)}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-paper-2">{fmtMin(effectiveRemainingMin(task, { now }))} left</span>
          {task.weight > 0 && <span className="px-1.5 py-0.5 rounded-md bg-paper-2">{task.weight}% of grade</span>}
          {task.kind === "optional" && <span className="italic px-1">optional</span>}
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-paper-2 border border-[rgba(59,47,40,.12)] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${task.progress}%`, background: done ? "var(--green)" : "var(--blue)" }} />
        </div>
      </div>
      <div className="text-sm text-text-blue tabular-nums shrink-0">{task.progress}%</div>
    </li>
  );
}
