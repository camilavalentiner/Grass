import type { SessionRecord } from "./store";
import type { ClassInfo, Task } from "./types";
import { difficultyFactor, effortLeft, windowFor, type Window } from "./engine";

const DAY = 864e5;
export const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

/** Minutes of focus and progress points gained per calendar day over the last `days` days. */
export function dailySeries(sessions: SessionRecord[], days: number, now = new Date()) {
  const end = startOfDay(now);
  const out = Array.from({ length: days }, (_, i) => {
    const day = new Date(end.getTime() - (days - 1 - i) * DAY);
    return { day, minutes: 0, points: 0, sessions: 0 };
  });
  for (const s of sessions) {
    const d = startOfDay(new Date(s.startedAt));
    const i = Math.round((d.getTime() - out[0].day.getTime()) / DAY);
    if (i < 0 || i >= days) continue;
    out[i].minutes += s.workMin;
    out[i].points += s.items.reduce((a, it) => a + Math.max(0, it.to - it.from), 0);
    out[i].sessions += 1;
  }
  return out;
}

/** Progress points gained per focused hour, by hour of day the session started. */
export function hourlyYield(sessions: SessionRecord[]) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, minutes: 0, points: 0, window: windowFor(h) as Window }));
  for (const s of sessions) {
    const h = new Date(s.startedAt).getHours();
    buckets[h].minutes += s.workMin;
    buckets[h].points += s.items.reduce((a, it) => a + Math.max(0, it.to - it.from), 0);
  }
  return buckets.map((b) => ({ ...b, perHour: b.minutes ? (b.points / b.minutes) * 60 : 0 }));
}

/** Average yield (points per focused hour) by star rating, 1..5. */
export function yieldByStars(sessions: SessionRecord[]) {
  return [1, 2, 3, 4, 5].map((stars) => {
    const ss = sessions.filter((s) => s.stars === stars);
    const minutes = ss.reduce((a, s) => a + s.workMin, 0);
    const points = ss.reduce((a, s) => a + s.items.reduce((b, it) => b + Math.max(0, it.to - it.from), 0), 0);
    return { stars, sessions: ss.length, minutes, perHour: minutes ? (points / minutes) * 60 : 0 };
  });
}

/** Per class: standing versus target, open effort, and how close the next deadline is. 0..1 each. */
export function classShape(classes: ClassInfo[], tasks: Task[], now = new Date()) {
  const maxOpen = Math.max(1, ...classes.map((c) => tasks.filter((t) => t.classId === c.id && t.progress < 100).reduce((a, t) => a + t.estimateMin * difficultyFactor(t.difficulty) * effortLeft(t.progress, t.difficulty), 0)));
  return classes.filter((c) => !c.archived).map((c) => {
    const open = tasks.filter((t) => t.classId === c.id && t.progress < 100);
    const openEffort = open.reduce((a, t) => a + t.estimateMin * difficultyFactor(t.difficulty) * effortLeft(t.progress, t.difficulty), 0);
    const next = open.map((t) => +new Date(t.due)).filter((d) => d > +now).sort()[0];
    const daysToNext = next ? (next - +now) / DAY : 30;
    const done = tasks.filter((t) => t.classId === c.id);
    const completion = done.length ? done.reduce((a, t) => a + t.progress, 0) / (done.length * 100) : 0;
    return {
      cls: c,
      standing: Math.min(1, c.currentGrade / Math.max(1, c.targetGrade ?? 90)),
      workload: Math.min(1, openEffort / maxOpen),
      urgency: Math.max(0, Math.min(1, 1 - daysToNext / 14)),
      completion,
      openCount: open.length,
    };
  });
}

export function streak(sessions: SessionRecord[], now = new Date()) {
  const days = new Set(sessions.map((s) => startOfDay(new Date(s.startedAt)).getTime()));
  let n = 0; let d = startOfDay(now).getTime();
  if (!days.has(d)) d -= DAY; // today may not have happened yet
  while (days.has(d)) { n++; d -= DAY; }
  return n;
}

export function totals(sessions: SessionRecord[], tasks: Task[], now = new Date()) {
  const weekAgo = +now - 7 * DAY;
  const week = sessions.filter((s) => +new Date(s.startedAt) >= weekAgo);
  const prev = sessions.filter((s) => { const t = +new Date(s.startedAt); return t < weekAgo && t >= weekAgo - 7 * DAY; });
  const minutes = week.reduce((a, s) => a + s.workMin, 0);
  const prevMinutes = prev.reduce((a, s) => a + s.workMin, 0);
  return {
    minutesThisWeek: minutes,
    minutesLastWeek: prevMinutes,
    sessionsThisWeek: week.length,
    finishedEarly: week.filter((s) => s.finishedEarly).length,
    tasksDone: tasks.filter((t) => t.progress >= 100).length,
    tasksOpen: tasks.filter((t) => t.progress < 100).length,
    streak: streak(sessions, now),
  };
}
