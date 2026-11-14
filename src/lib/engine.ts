import type { ClassInfo, Task } from "./types";

/** Minutes of work still left on a task. */
export const remainingMin = (t: Task) => Math.max(0, Math.round(t.estimateMin * (1 - t.progress / 100)));

export const hoursUntil = (iso: string, now = new Date()) => (new Date(iso).getTime() - now.getTime()) / 36e5;

/**
 * Priority = weight × urgency × grade-risk.
 *  - weight: share of the final grade (optional tasks get a small floor so they still rank)
 *  - urgency: grows as the due date approaches, capped so overdue work doesn't explode
 *  - gradeRisk: rises as the current grade falls below the target
 */
export function priority(t: Task, cls: ClassInfo | undefined, now = new Date()): number {
  if (t.progress >= 100) return 0;
  const weight = t.kind === "optional" ? 1.5 : Math.max(1, t.weight);
  const h = Math.max(1, hoursUntil(t.due, now));
  const urgency = Math.min(6, 48 / h + 1);
  const target = cls?.targetGrade ?? 90;
  const gap = cls ? Math.max(0, target - cls.currentGrade) : 0;
  const gradeRisk = 1 + gap / 10; // 10 points below target → ×2
  return weight * urgency * gradeRisk;
}

export type SortMode = "priority" | "due" | "estimate" | "kind";

export function sortTasks(tasks: Task[], classes: ClassInfo[], mode: SortMode, now = new Date()): Task[] {
  const byId = new Map(classes.map((c) => [c.id, c]));
  const open = [...tasks];
  switch (mode) {
    case "priority":
      return open.sort((a, b) => priority(b, byId.get(b.classId), now) - priority(a, byId.get(a.classId), now));
    case "due":
      return open.sort((a, b) => +new Date(a.due) - +new Date(b.due));
    case "estimate":
      return open.sort((a, b) => remainingMin(a) - remainingMin(b));
    case "kind":
      return open.sort((a, b) => (a.kind === b.kind ? priority(b, byId.get(b.classId), now) - priority(a, byId.get(a.classId), now) : a.kind === "mandatory" ? -1 : 1));
  }
}

/** Demand for a calendar day, 0..1: how much work is due that day (and the day after) versus a comfortable day. */
export function dayDemand(day: Date, tasks: Task[]): number {
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  let minutes = 0;
  for (const t of tasks) {
    if (t.progress >= 100) continue;
    const due = new Date(t.due);
    // work is spread over the 3 days before the due date
    const spreadStart = new Date(due); spreadStart.setDate(spreadStart.getDate() - 2); spreadStart.setHours(0, 0, 0, 0);
    if (start >= spreadStart && start < due) {
      const spanDays = Math.max(1, Math.ceil((due.getTime() - spreadStart.getTime()) / 864e5));
      minutes += remainingMin(t) / spanDays;
    }
  }
  const HEAVY = 270; // about 4.5 hours of work in a day is a burgundy day
  return Math.sqrt(Math.min(1, minutes / HEAVY));
}

/** The "start X now and finish Y% of your tasks by HH:MM" line. */
export function finishByPhrase(tasks: Task[], classes: ClassInfo[], now = new Date(), hoursAvailable = 3): { task?: Task; percent: number; at: Date } {
  const sorted = sortTasks(tasks.filter((t) => t.progress < 100), classes, "priority", now);
  const first = sorted[0];
  const totalRemaining = sorted.reduce((s, t) => s + remainingMin(t), 0);
  let budget = hoursAvailable * 60, done = 0;
  for (const t of sorted) {
    const r = remainingMin(t);
    if (r <= budget) { budget -= r; done += r; } else { done += budget; budget = 0; break; }
  }
  const percent = totalRemaining ? Math.round((done / totalRemaining) * 100) : 100;
  const at = new Date(now.getTime() + hoursAvailable * 36e5);
  return { task: first, percent, at };
}

export function greeting(hour: number): string {
  if (hour < 4) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Productivity window by local hour. */
export function windowFor(hour: number): "analytical" | "reset" | "creative" {
  if (hour >= 4 && hour < 12) return "analytical";
  if (hour >= 12 && hour < 18) return "reset";
  return "creative";
}
