import type { ClassInfo, ExtractedTask, Extraction, RubricItem, Task, TaskNature } from "./types";
import { icsToDate, type IcsEvent } from "./ics";
import { uid } from "./store";
import { defaultRubric, weightFromLine } from "./rubric";

const COLORS: ClassInfo["color"][] = ["blue", "pink", "green", "yellow", "lav"];

export function guessNature(title: string): TaskNature {
  const t = title.toLowerCase();
  if (/(essay|presentation|slides|poster|design|video|portfolio|reflection|blog|story|draft|proposal)/.test(t)) return "creative";
  if (/(lab|project|report|case study)/.test(t)) return "mixed";
  return "analytical";
}
export function guessEstimate(title: string, weight: number): number {
  const t = title.toLowerCase();
  if (/(exam|midterm|final)/.test(t)) return 240;
  if (/(quiz|reading|discussion|post)/.test(t)) return 45;
  if (/(essay|project|report|presentation)/.test(t)) return Math.max(180, Math.round(weight * 18));
  return Math.max(45, Math.round(60 + weight * 10));
}
const toDifficulty = (weight: number, nature: TaskNature, kind: Task["kind"]): Task["difficulty"] => {
  let d = 3; if (weight >= 20) d += 1; else if (weight > 0 && weight <= 3) d -= 1; if (nature === "mixed") d += 1; if (kind === "optional") d -= 1;
  return Math.max(1, Math.min(5, d)) as Task["difficulty"];
};

/** Build classes and tasks from a Claude extraction, ready for the review sheet. */
export function fromExtraction(x: Extraction, existing: ClassInfo[], source: Task["source"] = "scan"): { classes: ClassInfo[]; tasks: Task[] } {
  const classes: ClassInfo[] = x.classes.map((c, i) => ({
    id: uid(), name: c.name.trim(), code: c.code?.trim() || undefined, term: c.term ?? undefined,
    color: COLORS[(existing.length + i) % COLORS.length], currentGrade: 0, targetGrade: 90,
    rubric: c.rubric.length ? c.rubric.map((r): RubricItem => ({ id: uid(), name: r.name, weight: r.weight, count: r.count ?? undefined })) : defaultRubric(),
  }));
  const all = [...classes, ...existing.filter((c) => !c.archived)];
  const findClass = (t: ExtractedTask) => {
    const code = t.classCode?.trim().toLowerCase(), name = t.className?.trim().toLowerCase();
    return all.find((c) => code && c.code?.toLowerCase() === code) ?? all.find((c) => name && c.name.toLowerCase() === name) ?? all[0];
  };
  const tasks: Task[] = x.tasks.map((t) => {
    const cls = findClass(t);
    const rub = cls?.rubric?.find((r) => !r.noTask && t.rubricName && r.name.toLowerCase() === t.rubricName.toLowerCase());
    const weight = t.weight ?? (rub ? weightFromLine(rub) : 0);
    const nature = t.nature ?? guessNature(t.title);
    return {
      id: uid(), classId: cls?.id ?? "", title: t.title.trim(), description: t.description ?? undefined, kind: t.kind ?? "mandatory", nature,
      weight, due: t.due ?? new Date(Date.now() + 7 * 864e5).toISOString(), estimateMin: t.estimateMin ?? guessEstimate(t.title, weight),
      difficulty: toDifficulty(weight, nature, t.kind ?? "mandatory"), progress: 0, source, rubricItemId: rub?.id,
    };
  });
  return { classes, tasks };
}

/* ---------------- Canvas ---------------- */
type CanvasCourse = { id: number; name: string; course_code: string; term?: { name: string }; enrollments?: { computed_current_score?: number | null }[]; apply_assignment_group_weights?: boolean };
type CanvasAssignment = { id: number; name: string; due_at: string | null; points_possible: number | null; html_url?: string; description?: string | null; submission?: { workflow_state?: string; submitted_at?: string | null; score?: number | null } | null; omit_from_final_grade?: boolean };
type CanvasGroup = { id: number; name: string; group_weight: number; assignments?: CanvasAssignment[] };

export async function canvasFetch<T>(base: string, token: string, path: string): Promise<T> {
  const r = await fetch(`/api/canvas?base=${encodeURIComponent(base)}&path=${encodeURIComponent(path)}`, { headers: { "x-canvas-token": token } });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? `Canvas error ${r.status}`);
  return data as T;
}

/** Pull active courses with their assignment groups and open assignments. */
export async function syncCanvas(base: string, token: string, existing: ClassInfo[]): Promise<{ classes: ClassInfo[]; tasks: Task[] }> {
  const courses = await canvasFetch<CanvasCourse[]>(base, token, "/courses?enrollment_state=active&include[]=total_scores&include[]=term");
  const classes: ClassInfo[] = [];
  const tasks: Task[] = [];
  const since = Date.now() - 7 * 864e5;
  for (const [i, c] of courses.entries()) {
    const groups = await canvasFetch<CanvasGroup[]>(base, token, `/courses/${c.id}/assignment_groups?include[]=assignments&include[]=submission`);
    const weighted = !!c.apply_assignment_group_weights;
    const totalPoints = groups.reduce((a, g) => a + (g.assignments ?? []).reduce((b, x) => b + (x.points_possible ?? 0), 0), 0) || 1;
    const rubric: RubricItem[] = groups.map((g) => {
      const pts = (g.assignments ?? []).reduce((b, x) => b + (x.points_possible ?? 0), 0);
      return { id: `cg-${g.id}`, name: g.name, weight: Math.round((weighted ? g.group_weight : (pts / totalPoints) * 100) * 10) / 10, count: (g.assignments ?? []).length || undefined };
    });
    const cls: ClassInfo = {
      id: uid(), name: c.name, code: c.course_code, term: c.term?.name, color: COLORS[(existing.length + i) % COLORS.length],
      currentGrade: Math.round(c.enrollments?.[0]?.computed_current_score ?? 0), targetGrade: 90, rubric, externalId: `canvas-${c.id}`,
    };
    classes.push(cls);
    for (const g of groups) {
      const pts = (g.assignments ?? []).reduce((b, x) => b + (x.points_possible ?? 0), 0) || 1;
      for (const a of g.assignments ?? []) {
        if (!a.due_at || new Date(a.due_at).getTime() < since || a.omit_from_final_grade) continue;
        const share = weighted ? (g.group_weight * (a.points_possible ?? 0)) / pts : ((a.points_possible ?? 0) / totalPoints) * 100;
        const weight = Math.round(share * 10) / 10;
        const submitted = !!a.submission?.submitted_at || a.submission?.workflow_state === "graded";
        const nature = guessNature(a.name);
        tasks.push({
          id: uid(), classId: cls.id, title: a.name, description: a.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500) || undefined,
          kind: (a.points_possible ?? 0) > 0 ? "mandatory" : "optional", nature, weight, due: a.due_at, estimateMin: guessEstimate(a.name, weight),
          difficulty: toDifficulty(weight, nature, "mandatory"), progress: submitted ? 100 : 0, source: "canvas", rubricItemId: `cg-${g.id}`, externalId: `canvas-${a.id}`, url: a.html_url,
        });
      }
    }
  }
  return { classes, tasks };
}

/* ---------------- Calendar feeds ---------------- */
export function fromIcs(events: IcsEvent[], feed: { name: string; url: string; classId?: string }, existing: ClassInfo[]): { classes: ClassInfo[]; tasks: Task[] } {
  const host = (() => { try { return new URL(feed.url.replace(/^webcal:/, "https:")).host; } catch { return ""; } })();
  const source: Task["source"] = /google/.test(host) ? "google" : /office|outlook|microsoft|live\.com/.test(host) ? "teams" : "ics";
  const active = existing.filter((c) => !c.archived);
  const since = Date.now() - 2 * 864e5;
  const tasks: Task[] = [];
  for (const e of events) {
    const due = icsToDate(e.start, e.tzid, e.allDay);
    if (due.getTime() < since) continue;
    // Canvas-style summaries end with [COURSE CODE]
    const m = e.summary.match(/\[([^\]]+)\]\s*$/);
    const code = m?.[1]?.trim().toLowerCase();
    const cls = (feed.classId && active.find((c) => c.id === feed.classId)) || active.find((c) => code && c.code?.toLowerCase() === code) || active.find((c) => new RegExp(`\\b${(c.code ?? "§").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(e.summary));
    if (!cls) continue; // calendar noise without a class is skipped
    const title = e.summary.replace(/\s*\[[^\]]+\]\s*$/, "").trim();
    const nature = guessNature(title);
    tasks.push({
      id: uid(), classId: cls.id, title, description: e.description?.slice(0, 500), kind: "mandatory", nature, weight: 0, due: due.toISOString(),
      estimateMin: guessEstimate(title, 0), difficulty: toDifficulty(0, nature, "mandatory"), progress: 0, source, externalId: `ics-${e.uid}`, url: e.url,
    });
  }
  return { classes: [], tasks };
}
