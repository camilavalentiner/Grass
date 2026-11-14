import type { ClassInfo, Task, TaskNature } from "./types";

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

export type Window = "analytical" | "reset" | "creative";

/** Productivity window by local hour (4–12 analytical, 12–18 reset, 18–4 creative). */
export function windowFor(hour: number): Window {
  if (hour >= 4 && hour < 12) return "analytical";
  if (hour >= 12 && hour < 18) return "reset";
  return "creative";
}

export function greeting(hour: number): string {
  if (hour < 4) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export const hoursUntil = (iso: string, now = new Date()) => (new Date(iso).getTime() - now.getTime()) / 36e5;

/* ------------------------------------------------------------------ */
/* How long a task will really take from here                          */
/* ------------------------------------------------------------------ */

/** Plain remaining minutes: the estimate scaled by what is left. */
export const remainingMin = (t: Task) => Math.max(0, Math.round(t.estimateMin * (1 - t.progress / 100)));

/**
 * Difficulty multiplier. Estimates are usually made as if a task were "medium";
 * hard tasks overrun, easy ones go faster.
 *   1 → ×0.80   2 → ×0.90   3 → ×1.00   4 → ×1.20   5 → ×1.45
 */
export const difficultyFactor = (d: Task["difficulty"]) => [0, 0.8, 0.9, 1.0, 1.2, 1.45][d];

/**
 * The last stretch of a task is slower than the middle (checking, polishing, formatting),
 * and more so for hard tasks. Returns the share of the *effort* still ahead for a given
 * progress percentage, so that 80% progress on a hard task leaves more than 20% of the effort.
 */
export function effortLeft(progress: number, difficulty: Task["difficulty"]): number {
  const p = Math.min(1, Math.max(0, progress / 100));
  const tail = 0.08 + 0.06 * (difficulty - 1); // 8% (easy) → 32% (very hard) of the effort lives in the last 20% of progress
  if (p <= 0.8) return 1 - p * ((1 - tail) / 0.8);
  return tail * ((1 - p) / 0.2);
}

/** How well the current hour suits the kind of task. Below 1 is a tailwind. */
export function windowFit(nature: TaskNature, win: Window): number {
  if (win === "reset") return 1.25;
  if (win === "analytical") return nature === "analytical" ? 0.9 : nature === "mixed" ? 1.0 : 1.1;
  /* creative window */ return nature === "creative" ? 0.9 : nature === "mixed" ? 1.0 : 1.15;
}

/** Drive from the five-star check-in. 0 means not rated yet. */
export const driveFactor = (stars: number) => (stars <= 0 ? 1 : [0, 1.3, 1.15, 1.0, 0.92, 0.85][stars]);

export type PaceContext = { now: Date; stars?: number };

/**
 * Effective minutes of focused work still needed on a task:
 *   estimate × effortLeft(progress, difficulty) × difficultyFactor × windowFit(nature, hour) × driveFactor(stars)
 */
export function effectiveRemainingMin(t: Task, ctx: PaceContext): number {
  if (t.progress >= 100) return 0;
  const win = windowFor(ctx.now.getHours());
  const m = t.estimateMin * effortLeft(t.progress, t.difficulty) * difficultyFactor(t.difficulty) * windowFit(t.nature, win) * driveFactor(ctx.stars ?? 0);
  return Math.max(5, Math.round(m));
}

/** Wall-clock minutes for a stretch of focused work: a 5-minute break after every 30 minutes (none if under 30). */
export function wallClockMin(workMin: number): number {
  if (workMin < 30) return workMin;
  return workMin + 5 * Math.floor(workMin / 30);
}

/* ------------------------------------------------------------------ */
/* Priority                                                            */
/* ------------------------------------------------------------------ */

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
  const ctx = { now };
  switch (mode) {
    case "priority":
      return open.sort((a, b) => priority(b, byId.get(b.classId), now) - priority(a, byId.get(a.classId), now));
    case "due":
      return open.sort((a, b) => +new Date(a.due) - +new Date(b.due));
    case "estimate":
      return open.sort((a, b) => effectiveRemainingMin(a, ctx) - effectiveRemainingMin(b, ctx));
    case "kind":
      return open.sort((a, b) => (a.kind === b.kind ? priority(b, byId.get(b.classId), now) - priority(a, byId.get(a.classId), now) : a.kind === "mandatory" ? -1 : 1));
  }
}

/* ------------------------------------------------------------------ */
/* Calendar demand                                                     */
/* ------------------------------------------------------------------ */

/** Demand for a calendar day, 0..1. Work is spread over the three days before each due date. */
export function dayDemand(day: Date, tasks: Task[]): number {
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  let minutes = 0;
  for (const t of tasks) {
    if (t.progress >= 100) continue;
    const due = new Date(t.due);
    const spreadStart = new Date(due); spreadStart.setDate(spreadStart.getDate() - 2); spreadStart.setHours(0, 0, 0, 0);
    if (start >= spreadStart && start < due) {
      const spanDays = Math.max(1, Math.ceil((due.getTime() - spreadStart.getTime()) / 864e5));
      minutes += (remainingMin(t) * difficultyFactor(t.difficulty)) / spanDays;
    }
  }
  const HEAVY = 270; // about 4.5 hours of work in a day is a burgundy day
  return Math.sqrt(Math.min(1, minutes / HEAVY));
}

/* ------------------------------------------------------------------ */
/* The phrase on the home page                                         */
/* ------------------------------------------------------------------ */

export type Phrase = {
  task?: Task;
  /** overall completion after the stretch, 0..100 */
  percent: number;
  /** completion right now, 0..100 */
  percentNow: number;
  /** when the stretch ends, local time */
  at: Date;
  /** focused minutes in the stretch */
  workMin: number;
  /** whether the stretch finishes the top task */
  finishesTask: boolean;
};

/**
 * "Start <task> right now and finish <percent>% of your tasks by <time>."
 *
 * The stretch is the effective time to finish the top-priority task, capped at `capMin`
 * (a long task becomes "work on it for the next two and a half hours").
 * Percent is overall completion of all open work, by effort, after that stretch.
 * The clock time adds a 5-minute break for every 30 minutes of work.
 */
export function finishByPhrase(tasks: Task[], classes: ClassInfo[], ctx: PaceContext, capMin = 150): Phrase {
  const open = sortTasks(tasks.filter((t) => t.progress < 100), classes, "priority", ctx.now);
  const first = open[0];
  // total effort of every task, done and not, so the percentage matches the progress bars
  const effortOf = (t: Task) => t.estimateMin * difficultyFactor(t.difficulty);
  const totalEffort = tasks.reduce((s, t) => s + effortOf(t), 0) || 1;
  const doneEffort = tasks.reduce((s, t) => s + effortOf(t) * (1 - effortLeft(t.progress, t.difficulty)), 0);
  const percentNow = Math.round((doneEffort / totalEffort) * 100);
  if (!first) return { percent: 100, percentNow: 100, at: ctx.now, workMin: 0, finishesTask: true };

  const need = effectiveRemainingMin(first, ctx);
  const workMin = Math.min(need, capMin);
  const finishesTask = workMin >= need;
  // effort covered in the stretch, expressed in the same units as totalEffort
  const covered = finishesTask ? effortOf(first) * effortLeft(first.progress, first.difficulty) : effortOf(first) * effortLeft(first.progress, first.difficulty) * (workMin / need);
  const percent = Math.min(100, Math.round(((doneEffort + covered) / totalEffort) * 100));
  const at = new Date(ctx.now.getTime() + wallClockMin(workMin) * 60_000);
  return { task: first, percent, percentNow, at, workMin, finishesTask };
}
