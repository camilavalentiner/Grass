"use client";
import type { ClassInfo, Task } from "@/lib/types";
import { dayDemand, difficultyFactor, remainingMin } from "@/lib/engine";
import { fmtMin } from "./TaskRow";

/** What a selected calendar day holds: tasks due that day and the work suggested for it. */
export function DayPeek({ day, tasks, classes }: { day: Date; tasks: Task[]; classes: ClassInfo[] }) {
  const byId = new Map(classes.map((c) => [c.id, c]));
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const due = tasks.filter((t) => { const d = new Date(t.due); return d >= start && d < end; });
  const suggested = tasks.filter((t) => {
    if (t.progress >= 100) return false;
    const d = new Date(t.due); const s = new Date(d); s.setDate(s.getDate() - 2); s.setHours(0, 0, 0, 0);
    return start >= s && start < d && !due.includes(t);
  });
  const minutes = Math.round(suggested.concat(due.filter((t) => t.progress < 100)).reduce((a, t) => a + (remainingMin(t) * difficultyFactor(t.difficulty)) / 3, 0));
  const demand = dayDemand(day, tasks);
  const label = demand > 0.75 ? "a heavy day" : demand > 0.45 ? "a full day" : demand > 0.1 ? "a light day" : "a free day";
  return (
    <div className="mt-3 pt-3 border-t border-dashed border-[rgba(59,47,40,.2)]">
      <div className="flex items-baseline justify-between">
        <h4 className="font-semibold text-text-blue">{day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</h4>
        <span className="text-xs text-text-muted">{label}{minutes ? ` · about ${fmtMin(minutes)}` : ""}</span>
      </div>
      {due.length > 0 && (
        <ul className="mt-2 text-sm flex flex-col gap-1">
          {due.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2">
              <span className={t.progress >= 100 ? "strike text-text-muted" : ""}>Due: {t.title}</span>
              <span className="text-xs text-text-muted whitespace-nowrap">{byId.get(t.classId)?.code}</span>
            </li>
          ))}
        </ul>
      )}
      {suggested.length > 0 && (
        <ul className="mt-2 text-sm flex flex-col gap-1">
          {suggested.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-text-muted">
              <span>Work on: {t.title}</span>
              <span className="text-xs whitespace-nowrap">{byId.get(t.classId)?.code}</span>
            </li>
          ))}
        </ul>
      )}
      {!due.length && !suggested.length && <p className="mt-2 text-sm text-text-muted">Nothing on the list. A day for the grass.</p>}
    </div>
  );
}
