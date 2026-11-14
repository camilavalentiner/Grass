"use client";
import type { Plan } from "@/lib/plans";
import { breaksIn } from "@/lib/plans";
import type { Task } from "@/lib/types";
import { fmtMin } from "./TaskRow";

export function PlanPicker({ plans, tasks, onPick }: { plans: Plan[]; tasks: Task[]; onPick: (p: Plan) => void }) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  if (!plans.length) return <p className="text-sm text-text-muted">Nothing left to plan. Enjoy the grass.</p>;
  return (
    <ul className="grid gap-2.5 text-left">
      {plans.map((p) => (
        <li key={p.id}>
          <button type="button" onClick={() => onPick(p)} className="w-full text-left rounded-[18px] border-[1.5px] border-[rgba(59,47,40,.2)] bg-paper-2 hover:bg-yellow-2 p-3.5 transition-colors">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-text-blue">{p.title}</span>
              <span className="text-xs text-text-muted whitespace-nowrap">{fmtMin(p.durationMin)}{breaksIn(p.durationMin) ? ` · ${breaksIn(p.durationMin)} break${breaksIn(p.durationMin) > 1 ? "s" : ""}` : ""}</span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{p.blurb}</p>
            <ul className="mt-2 flex flex-col gap-1">
              {p.items.map((it) => {
                const t = byId.get(it.taskId);
                return t ? (
                  <li key={it.taskId} className="text-sm flex items-center justify-between gap-2">
                    <span className="truncate">{t.title}</span>
                    <span className="text-xs tabular-nums text-text-blue whitespace-nowrap">{it.startProgress}% → {it.targetProgress}%</span>
                  </li>
                ) : null;
              })}
            </ul>
          </button>
        </li>
      ))}
    </ul>
  );
}
