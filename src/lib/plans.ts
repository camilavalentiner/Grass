import type { ClassInfo, Task } from "./types";
import { effectiveRemainingMin, priority, windowFit, windowFor, type Window } from "./engine";
import type { Phase, SessionItem } from "./store";

export type Plan = {
  id: string;
  title: string;
  blurb: string;
  durationMin: number;
  items: SessionItem[];
};

/** Split a session into work blocks with a 5-minute break after every full 30 minutes of work. */
export function phasesFor(durationMin: number): Phase[] {
  if (durationMin < 30) return [{ kind: "work", minutes: durationMin }];
  const phases: Phase[] = [];
  let left = durationMin;
  while (left > 0) {
    const w = Math.min(30, left);
    phases.push({ kind: "work", minutes: w });
    left -= w;
    if (w === 30 && left > 0) phases.push({ kind: "break", minutes: 5 });
  }
  return phases;
}
export const breaksIn = (durationMin: number) => phasesFor(durationMin).filter((p) => p.kind === "break").length;

/** Spread `minutes` of work across tasks in order and turn it into target percentages. */
export function allocate(tasks: Task[], minutes: number, ctx: { now: Date; stars: number }): SessionItem[] {
  const items: SessionItem[] = [];
  let left = minutes;
  for (const t of tasks) {
    if (left <= 0) break;
    const need = effectiveRemainingMin(t, ctx);
    const give = Math.min(left, need);
    const gain = need > 0 ? (give / need) * (100 - t.progress) : 100 - t.progress;
    items.push({ taskId: t.id, startProgress: t.progress, targetProgress: Math.min(100, Math.round(t.progress + gain)) });
    left -= give;
  }
  return items;
}

const WINDOW_COPY: Record<Window, string> = {
  analytical: "a sharp hour",
  reset: "a soft hour",
  creative: "a creative hour",
};

/**
 * Two or three session plans from the drive rating and the hour.
 * Stars decide how long and how heavy; the window decides which kind of work goes first.
 */
/** Never schedule longer than the chosen tasks actually need (plus a small buffer). */
function fit(durationMin: number, chosen: Task[], ctx: { now: Date; stars: number }): number {
  const need = chosen.reduce((a, t) => a + effectiveRemainingMin(t, ctx), 0) + 5;
  return Math.max(10, Math.min(durationMin, Math.ceil(need / 5) * 5));
}

export function buildPlans(tasks: Task[], classes: ClassInfo[], stars: number, now: Date): Plan[] {
  const win = windowFor(now.getHours());
  const byId = new Map(classes.map((c) => [c.id, c]));
  const ctx = { now, stars };
  const open = tasks.filter((t) => t.progress < 100);
  if (!open.length) return [];
  // priority first, nudged by how well the task suits the hour
  const ranked = [...open].sort((a, b) => priority(b, byId.get(b.classId), now) / windowFit(b.nature, win) - priority(a, byId.get(a.classId), now) / windowFit(a.nature, win));
  const quickest = [...open].sort((a, b) => effectiveRemainingMin(a, ctx) - effectiveRemainingMin(b, ctx));
  const plans: Plan[] = [];
  const name = (t: Task) => t.title;

  if (win === "reset") {
    const d = fit(stars >= 4 ? 45 : 25, [quickest[0]], ctx);
    plans.push({ id: "reset-light", title: "Light touch", blurb: `It is ${WINDOW_COPY[win]}. One easy win, then rest.`, durationMin: d, items: allocate([quickest[0]], d, ctx) });
    if (stars >= 3) {
      const d2 = fit(stars >= 5 ? 75 : 50, [ranked[0]], ctx);
      plans.push({ id: "reset-steady", title: "Steady", blurb: `Keep it unhurried: ${name(ranked[0])}.`, durationMin: d2, items: allocate([ranked[0]], d2, ctx) });
    }
    return plans;
  }

  const heavyMin = fit(stars >= 5 ? 120 : stars >= 4 ? 90 : 60, ranked.slice(0, 2), ctx);
  if (stars >= 3) {
    plans.push({
      id: "heavy", title: win === "creative" ? "Make something" : "Heavy lift",
      blurb: win === "creative" ? `It is ${WINDOW_COPY[win]}: shaping, designing, finishing.` : `It is ${WINDOW_COPY[win]}: the exact, demanding work first.`,
      durationMin: heavyMin, items: allocate(ranked.slice(0, 2), heavyMin, ctx),
    });
  }
  const steady = fit(stars >= 3 ? 50 : 40, [ranked[0]], ctx);
  plans.push({ id: "steady", title: "One thing well", blurb: `Just ${name(ranked[0])}, nothing else.`, durationMin: steady, items: allocate([ranked[0]], steady, ctx) });
  const gentle = fit(stars <= 2 ? 20 : 25, [quickest[0]], ctx);
  plans.push({ id: "gentle", title: "Small start", blurb: `Twenty-odd minutes on the quickest thing: ${name(quickest[0])}.`, durationMin: gentle, items: allocate([quickest[0]], gentle, ctx) });
  return plans;
}
