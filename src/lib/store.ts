"use client";
import { useSyncExternalStore } from "react";
import type { ClassInfo, Connections, DocRecord, Task } from "./types";
import { sampleClasses, sampleSessions, sampleTasks } from "./sample";
import { withRubric } from "./rubric";

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
  documents: DocRecord[];
  connections: Connections;
  term: string;
};

const KEY = "grass.v1";
const listeners = new Set<() => void>();
let cache: AppState | null = null;

function initial(): AppState {
  return { version: 1, name: "Camila", classes: sampleClasses.map(withRubric), tasks: sampleTasks, sessions: sampleSessions, drive: null, active: null, documents: [], connections: { feeds: [] }, term: "Fall 2026" };
}
function read(): AppState {
  if (cache) return cache;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    const loaded: AppState = raw ? { ...initial(), ...(JSON.parse(raw) as Partial<AppState>) } : initial();
    cache = { ...loaded, classes: loaded.classes.map(withRubric) };
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
  upsertClass(raw: ClassInfo) {
    const c = withRubric(raw);
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
  deleteClass(id: string) { actions.update((s) => ({ ...s, classes: s.classes.filter((c) => c.id !== id), tasks: s.tasks.filter((t) => t.classId !== id) })); },
  /** New semester: archive every class and its open tasks are removed; done tasks stay for history. */
  newTerm(term: string) {
    actions.update((s) => ({ ...s, term, classes: s.classes.map((c) => ({ ...c, archived: true })), tasks: s.tasks.filter((t) => t.progress >= 100) }));
  },
  setTerm(term: string) { actions.update((s) => ({ ...s, term })); },
  upsertDocument(d: DocRecord) {
    actions.update((s) => ({ ...s, documents: s.documents.some((x) => x.id === d.id) ? s.documents.map((x) => (x.id === d.id ? d : x)) : [...s.documents, d] }));
  },
  deleteDocument(id: string) { actions.update((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) })); },
  setConnections(fn: (c: Connections) => Connections) { actions.update((s) => ({ ...s, connections: fn(s.connections) })); },
  /** Merge imported classes (by code or name) and tasks (by externalId, else by title + class). */
  importMany(classes: ClassInfo[], tasks: Task[]) {
    actions.update((s) => {
      const nextClasses = [...s.classes];
      const idMap = new Map<string, string>(); // incoming class id → stored class id
      for (const c of classes) {
        const key = (x: ClassInfo) => (x.code ?? x.name).trim().toLowerCase();
        const existing = nextClasses.find((x) => !x.archived && (key(x) === key(c) || (c.externalId && x.externalId === c.externalId)));
        if (existing) {
          idMap.set(c.id, existing.id);
          Object.assign(existing, { ...existing, rubric: c.rubric?.length ? c.rubric : existing.rubric, externalId: c.externalId ?? existing.externalId, currentGrade: c.currentGrade || existing.currentGrade });
        } else { nextClasses.push(withRubric(c)); idMap.set(c.id, c.id); }
      }
      const nextTasks = [...s.tasks];
      for (const t of tasks) {
        const classId = idMap.get(t.classId) ?? t.classId;
        const dup = nextTasks.find((x) => (t.externalId && x.externalId === t.externalId) || (x.classId === classId && x.title.trim().toLowerCase() === t.title.trim().toLowerCase()));
        if (dup) Object.assign(dup, { due: t.due, description: t.description ?? dup.description, weight: t.weight || dup.weight, url: t.url ?? dup.url, externalId: t.externalId ?? dup.externalId });
        else nextTasks.push({ ...t, classId });
      }
      return { ...s, classes: nextClasses, tasks: nextTasks };
    });
  },
  resetSample() { write(initial()); },
};
