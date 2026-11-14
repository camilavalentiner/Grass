"use client";
import { useMemo, useState } from "react";
import { Scene } from "./illustrations/Scene";
import type { ActiveSession, SessionRecord } from "@/lib/store";
import { actions } from "@/lib/store";
import type { Task } from "@/lib/types";
import { fmtMin } from "./TaskRow";

const LINES = [
  (n: string, m: number) => `Brilliant, ${n}. ${m} focused minutes, and look at you now.`,
  (n: string, m: number) => `${n}, that was ${m} minutes you will not have to find later.`,
  (n: string, m: number) => `Well done, ${n}. Future you just got ${m} minutes back.`,
  (n: string, m: number) => `${m} minutes, ${n}. The pile is smaller than it was.`,
];

/** The end-of-session popup: a cheer, and a chance to confirm how far each task really got. */
export function Celebration({ s, workMin, early, tasks, name, onDone }: { s: ActiveSession; workMin: number; early: boolean; tasks: Task[]; name: string; onDone: () => void }) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const [got, setGot] = useState<Record<string, number>>(() => Object.fromEntries(s.items.map((it) => [it.taskId, early ? Math.round(it.startProgress + (it.targetProgress - it.startProgress) * Math.min(1, workMin / Math.max(1, s.durationMin))) : it.targetProgress])));
  // pick a line from the session id so it is stable across re-renders
  const line = useMemo(() => LINES[s.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % LINES.length](name, Math.max(1, Math.round(workMin))), [s.id, name, workMin]);

  const confirm = () => {
    const record: SessionRecord = {
      id: s.id, startedAt: s.startedAt, endedAt: new Date().toISOString(), durationMin: s.durationMin, workMin: Math.round(workMin), stars: s.stars, planTitle: s.planTitle, finishedEarly: early,
      items: s.items.map((it) => ({ taskId: it.taskId, from: it.startProgress, to: got[it.taskId] ?? it.startProgress })),
    };
    actions.endSession(record, got);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[rgba(47,74,50,.35)]" role="dialog" aria-modal="true" aria-label="Session finished">
      <div className="sheet w-full max-w-sm card !rounded-[36px] p-6 text-center max-h-[92vh] overflow-y-auto">
        <Scene kind="celebrate" className="w-full max-w-[300px] mx-auto pop" />
        <h3 className="text-2xl font-semibold text-text-blue mt-2">{early ? "Good stopping point" : "Session complete"}</h3>
        <p className="text-text mt-1">{line}</p>
        <p className="text-xs text-text-muted mt-1">{fmtMin(Math.round(workMin))} of focus{early ? ", finished early" : ""}.</p>

        <div className="mt-4 text-left">
          <span className="eyebrow">How far did you get?</span>
          <ul className="mt-1 flex flex-col gap-3">
            {s.items.map((it) => {
              const t = byId.get(it.taskId);
              if (!t) return null;
              const v = got[it.taskId] ?? it.startProgress;
              return (
                <li key={it.taskId}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium truncate">{t.title}</span>
                    <span className="text-xs tabular-nums text-text-blue whitespace-nowrap">{it.startProgress}% → {v}%{v >= 100 ? " ✓" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} step={5} value={v} onChange={(e) => setGot((g) => ({ ...g, [it.taskId]: +e.target.value }))} className="range flex-1" aria-label={`Progress on ${t.title}`} />
                    <button type="button" onClick={() => setGot((g) => ({ ...g, [it.taskId]: v >= 100 ? it.startProgress : 100 }))} className={`chip !py-1 !px-2.5 text-xs ${v >= 100 ? "chip-on" : ""}`} aria-pressed={v >= 100}>
                      {v >= 100 ? "Completed" : "Mark completed"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <button type="button" className="btn btn-green mt-5 px-8" onClick={confirm}>Save progress</button>
      </div>
    </div>
  );
}
