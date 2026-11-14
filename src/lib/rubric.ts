import type { ClassInfo, RubricItem } from "./types";

/**
 * The rubric every class starts with. Each class keeps its own copy, so the weights
 * can be changed per class at any time without touching the others.
 *   First exam 30 (already past) · Second exam 30 · Project 30 · Participation 10 (never a task)
 */
export function defaultRubric(): RubricItem[] {
  return [
    { id: "r-exam1", name: "First exam", weight: 30, count: 1, past: true },
    { id: "r-exam2", name: "Second exam", weight: 30, count: 1 },
    { id: "r-project", name: "Project", weight: 30, count: 1 },
    { id: "r-participation", name: "Participation", weight: 10, noTask: true },
  ];
}

/** Classes without a rubric get the default one. */
export function withRubric(c: ClassInfo): ClassInfo {
  return c.rubric && c.rubric.length ? c : { ...c, rubric: defaultRubric() };
}

export const rubricTotal = (r: RubricItem[] | undefined) => (r ?? []).reduce((a, x) => a + (x.weight || 0), 0);

/** Weight a single task takes from a rubric line. */
export const weightFromLine = (r: RubricItem) => Math.round((r.weight / (r.count ?? 1)) * 10) / 10;
