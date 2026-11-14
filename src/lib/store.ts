"use client";
import { useSyncExternalStore } from "react";
import type { ClassInfo, Task } from "./types";
import { sampleClasses, sampleTasks } from "./sample";

export type SessionItem = { taskId: string; startProgress: number; targetProgress: number };
export type Phase = { kind: "work" | "break"; minutes: number };
export type ActiveSession = {
  id: string;
  startedAt: string;
  durationMin: number;
  stars: number;
  items: SessionItem[];
  phases: Phase[];
  phaseIndex: number;
  /** wall-clock end of the current phase, ms since epoch; null while paused */
  phaseEndsAt: number | null;
  /** remaining ms of the current phase while paused */
  pausedRemainingMs: number | null;
  planTitle: string;
};
export type SessionRecord = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMin: number;
  workMin: number;
  stars: number;
  planTitle: string;
  items: { taskId: string; from: number; to: number }[];
  finishedEarly: boolean;
};

export type AppState = {
  version: 1;
  name: string;
  classes: ClassInfo[];
  tasks: Task[];
  sessions: SessionRecord[];
  drive: { stars: number; at: string } | null;
  active: ActiveSession | null;
};

const KEY = "grass.v1";
const listeners = new Set<() => void>();
let cache: AppState | null = null;

function initial(): AppState {
  return { version: 1, name: "Camila", classes: sampleClasses, tasks: sampleTasks, sessions: [], drive: null, active: null };
}
function read(): AppState {
  if (cache) return cache;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    cache = raw ? { ...initial(), ...(JSON.parse(raw) as Partial<AppState>) } : initial();
  } catch {
    cache = initial();
  }
  return cache;
}
function write(next: AppState) {
  cache = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage may be unavailable; keep in memory */ }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

/** The app state, or null before the browser has loaded it. */
export function useAppState(): AppState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  update(fn: (s: AppState) => AppState) { write(fn(read())); },
  setName(name: string) { actions.update((s) => ({ ...s, name })); },
  setDrive(stars: number) { actions.update((s) => ({ ...s, drive: { stars, at: new Date().toISOString() } })); },
  upsertTask(t: Task) {
    actions.update((s) => ({ ...s, tasks: s.tasks.some((x) => x.id === t.id) ? s.tasks.map((x) => (x.id === t.id ? t : x)) : [...s.tasks, t] }));
  },
  deleteTask(id: string) { actions.update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })); },
  setProgress(id: string, progress: number) {
    actions.update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, progress: Math.max(0, Math.min(100, Math.round(progress))) } : t)) }));
  },
  toggleDone(id: string) {
    actions.update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, progress: t.progress >= 100 ? 0 : 100 } : t)) }));
  },
  upsertClass(c: ClassInfo) {
    actions.update((s) => ({ ...s, classes: s.classes.some((x) => x.id === c.id) ? s.classes.map((x) => (x.id === c.id ? c : x)) : [...s.classes, c] }));
  },
  startSession(a: ActiveSession) { actions.update((s) => ({ ...s, active: a })); },
  patchSession(p: Partial<ActiveSession>) { actions.update((s) => (s.active ? { ...s, active: { ...s.active, ...p } } : s)); },
  endSession(record: SessionRecord, progress: Record<string, number>) {
    actions.update((s) => ({
      ...s,
      active: null,
      sessions: [...s.sessions, record],
      tasks: s.tasks.map((t) => (progress[t.id] !== undefined ? { ...t, progress: Math.max(0, Math.min(100, Math.round(progress[t.id]))) } : t)),
    }));
  },
  abandonSession() { actions.update((s) => ({ ...s, active: null })); },
  resetSample() { write(initial()); },
};
