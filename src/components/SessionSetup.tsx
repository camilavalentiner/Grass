"use client";
import { useState } from "react";
import type { Plan } from "@/lib/plans";
import { breaksIn, phasesFor } from "@/lib/plans";
import type { Task } from "@/lib/types";
import { actions, uid, type SessionItem } from "@/lib/store";
import { fmtMin } from "./TaskRow";
import { msFor } from "@/lib/clock";

/** The rounded pop that asks for a duration and a completion target per task, then starts the session. */
export function SessionSetup({ plan, tasks, stars, onClose }: { plan: Plan; tasks: Task[]; stars: number; onClose: () => void }) {
  const [duration, setDuration] = useState(plan.durationMin);
  const [items, setItems] = useState<SessionItem[]>(plan.items);
  const [adding, setAdding] = useState(false);
  const [openedAt] = useState(() => Date.now());
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const spare = tasks.filter((t) => t.progress < 100 && !items.some((i) => i.taskId === t.id));
  const nBreaks = breaksIn(duration);
  const endsAt = new Date(openedAt + (duration + nBreaks * 5) * 60_000);

  const start = () => {
    const phases = phasesFor(duration);
    actions.startSession({
      id: uid(), startedAt: new Date().toISOString(), durationMin: duration, stars, items, phases,
      phaseIndex: 0, phaseEndsAt: Date.now() + msFor(phases[0].minutes), pausedRemainingMs: null, planTitle: plan.title,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Set up your study session">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[rgba(47,74,50,.35)]" />
      <div className="sheet relative w-full max-w-sm card !rounded-[36px] p-6 text-center">
        <p className="eyebrow">{plan.title}</p>
        <h3 className="text-2xl font-semibold text-text-blue mt-1">Set up your session</h3>

        <div className="mt-5 text-left">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Duration</span>
            <span className="text-lg font-semibold text-text-blue tabular-nums">{fmtMin(duration)}</span>
          </div>
          <input type="range" min={10} max={180} step={5} value={duration} onChange={(e) => setDuration(+e.target.value)} className="range w-full" aria-label="Duration in minutes" />
          <p className="text-xs text-text-muted">
            {nBreaks ? `${nBreaks} five-minute break${nBreaks > 1 ? "s" : ""} after every 30 minutes.` : "Under 30 minutes, so no break."}{" "}
            Ends around {endsAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.
          </p>
        </div>

        <div className="mt-4 text-left">
          <span className="eyebrow">Targets for this session</span>
          <ul className="mt-1 flex flex-col gap-3">
            {items.map((it, idx) => {
              const t = byId.get(it.taskId);
              if (!t) return null;
              return (
                <li key={it.taskId}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium truncate">{t.title}</span>
                    <span className="text-xs tabular-nums text-text-blue whitespace-nowrap">{it.startProgress}% → {it.targetProgress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="range" min={it.startProgress} max={100} step={5} value={it.targetProgress} onChange={(e) => setItems((arr) => arr.map((x, i) => (i === idx ? { ...x, targetProgress: +e.target.value } : x)))} className="range flex-1" aria-label={`Target for ${t.title}`} />
                    {items.length > 1 && <button type="button" className="text-xs text-text-muted" onClick={() => setItems((arr) => arr.filter((_, i) => i !== idx))} aria-label="Remove task">✕</button>}
                  </div>
                </li>
              );
            })}
          </ul>
          {spare.length > 0 && (adding ? (
            <select className="input mt-2" defaultValue="" onChange={(e) => { const t = byId.get(e.target.value); if (t) setItems((arr) => [...arr, { taskId: t.id, startProgress: t.progress, targetProgress: Math.min(100, t.progress + 25) }]); setAdding(false); }}>
              <option value="" disabled>Pick a task…</option>
              {spare.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          ) : (
            <button type="button" className="mt-2 text-sm text-text-blue underline underline-offset-4" onClick={() => setAdding(true)}>+ work on another task too</button>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2">
          <button type="button" className="btn" style={{ background: "var(--paper-2)" }} onClick={onClose}>Back</button>
          <button type="button" className="btn btn-green px-6" onClick={start} disabled={!items.length}>Start</button>
        </div>
      </div>
    </div>
  );
}
