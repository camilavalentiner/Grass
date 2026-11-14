"use client";
import { useEffect, useState } from "react";
import type { ActiveSession } from "@/lib/store";
import { actions } from "@/lib/store";
import type { Task } from "@/lib/types";

import { msFor, speed } from "@/lib/clock";

/** Full-screen timer: work blocks with five-minute breaks, pause, and finish early. */
export function SessionTimer({ s, tasks, onFinish }: { s: ActiveSession; tasks: Task[]; onFinish: (workMinDone: number, early: boolean) => void }) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const phase = s.phases[s.phaseIndex];
  const paused = s.phaseEndsAt === null;
  const remainingMs = paused ? (s.pausedRemainingMs ?? 0) : Math.max(0, (s.phaseEndsAt! - nowMs) * speed());
  const workDoneMin = s.phases.slice(0, s.phaseIndex).filter((p) => p.kind === "work").reduce((a, p) => a + p.minutes, 0) + (phase.kind === "work" ? phase.minutes - remainingMs / 60_000 : 0);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // advance phases on the wall clock
  useEffect(() => {
    if (paused || remainingMs > 0) return;
    const next = s.phaseIndex + 1;
    if (next >= s.phases.length) { onFinish(s.durationMin, false); return; }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(s.phases[next].kind === "break" ? [80, 60, 80] : 160);
    actions.patchSession({ phaseIndex: next, phaseEndsAt: Date.now() + msFor(s.phases[next].minutes) });
  }, [paused, remainingMs, s, onFinish]);

  const mm = Math.floor(remainingMs / 60_000), ss = Math.floor((remainingMs % 60_000) / 1000);
  const total = phase.minutes * 60_000;
  const frac = total ? 1 - remainingMs / total : 1;
  const R = 86, C = 2 * Math.PI * R;
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const isBreak = phase.kind === "break";
  const workPhases = s.phases.filter((p) => p.kind === "work").length;
  const blockNo = s.phases.slice(0, s.phaseIndex + 1).filter((p) => p.kind === "work").length;

  return (
    <div className={`fixed inset-0 z-40 overflow-y-auto ${isBreak ? "bg-pink-2" : "bg-paper"}`} role="dialog" aria-modal="true" aria-label="Study session">
      <div className="mx-auto max-w-md px-5 py-8 flex flex-col items-center text-center min-h-full">
        <p className="eyebrow">{s.planTitle}</p>
        <h2 className="text-2xl font-semibold text-text-blue mt-1">{isBreak ? "Five minutes off" : `Focus · block ${blockNo} of ${workPhases}`}</h2>
        <p className="text-sm text-text-muted mt-1">{isBreak ? "Stand up, look far away, drink some water." : paused ? "Paused" : "You are doing it."}</p>

        <div className="relative my-6" style={{ width: 220, height: 220 }}>
          <svg viewBox="0 0 200 200" width="220" height="220" aria-hidden>
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(59,47,40,.12)" strokeWidth="10" />
            <circle cx="100" cy="100" r={R} fill="none" stroke={isBreak ? "#e39bb0" : "#9fc36a"} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset .25s linear" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <div className="text-5xl font-semibold text-text-blue tabular-nums">{mm}:{String(ss).padStart(2, "0")}</div>
              <div className="text-xs text-text-muted mt-1">{isBreak ? "break" : "left in this block"}</div>
            </div>
          </div>
        </div>

        {/* the time icon strip: blocks and breaks */}
        <div className="flex items-center gap-1.5 mb-6" aria-label="Session timeline">
          {s.phases.map((p, i) => (
            <span key={i} className="rounded-full" style={{ height: 8, width: p.kind === "break" ? 10 : Math.max(16, p.minutes * 1.6), background: i < s.phaseIndex ? "#9fc36a" : i === s.phaseIndex ? (p.kind === "break" ? "#e39bb0" : "#f3d55b") : "rgba(59,47,40,.15)" }} title={`${p.kind} ${p.minutes} min`} />
          ))}
        </div>

        <ul className="w-full text-left card p-4 flex flex-col gap-2">
          {s.items.map((it) => {
            const t = byId.get(it.taskId);
            return t ? (
              <li key={it.taskId} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{t.title}</span>
                <span className="text-xs text-text-blue tabular-nums whitespace-nowrap">aim {it.targetProgress}%</span>
              </li>
            ) : null;
          })}
        </ul>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {paused ? (
            <button type="button" className="btn btn-green" onClick={() => actions.patchSession({ phaseEndsAt: Date.now() + (s.pausedRemainingMs ?? 0) / speed(), pausedRemainingMs: null })}>Resume</button>
          ) : (
            <button type="button" className="btn" onClick={() => actions.patchSession({ phaseEndsAt: null, pausedRemainingMs: remainingMs })}>Pause</button>
          )}
          {isBreak && <button type="button" className="btn btn-blue" onClick={() => actions.patchSession({ phaseEndsAt: Date.now() })}>Skip break</button>}
          <button type="button" className="btn btn-pink" onClick={() => onFinish(Math.round(workDoneMin), true)}>Finish now</button>
        </div>
        <button type="button" className="mt-4 text-xs text-text-muted underline underline-offset-4" onClick={() => { if (confirm("Abandon this session? Nothing will be recorded.")) actions.abandonSession(); }}>Abandon session</button>
      </div>
    </div>
  );
}
