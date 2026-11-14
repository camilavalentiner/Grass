import type { Extraction, ExtractedTask } from "./types";

/** Pull the JSON object out of whatever was pasted: a code block, extra prose, or bare JSON. */
function findJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{"), end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No reply found. Paste the whole answer from Claude, starting with {.");
  const slice = body.slice(start, end + 1)
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'") // smart quotes from phone keyboards
    .replace(/,\s*([}\]])/g, "$1");                                     // trailing commas
  try { return JSON.parse(slice); } catch { throw new Error("The reply looks cut off or changed. Copy Claude's whole answer again."); }
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => { const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN; return Number.isFinite(n) ? n : undefined; };
const arr = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") as Record<string, unknown>[] : []);

/** Turn a pasted Claude reply into an Extraction, forgiving small differences in shape. */
export function parseClaudeReply(text: string): Extraction {
  const data = findJson(text) as Record<string, unknown>;
  if (!data || typeof data !== "object") throw new Error("That reply is not in the expected shape.");
  const classes = arr(data.classes).map((c) => ({
    name: str(c.name) ?? str(c.code) ?? "Untitled class",
    code: str(c.code),
    term: str(c.term),
    rubric: arr(c.rubric).map((r) => ({ name: str(r.name) ?? "Component", weight: num(r.weight) ?? 0, count: num(r.count) })),
  }));
  const tasks: ExtractedTask[] = arr(data.tasks).filter((t) => str(t.title)).map((t) => {
    const due = str(t.due);
    const nature = str(t.nature);
    return {
      title: str(t.title)!,
      classCode: str(t.classCode),
      className: str(t.className),
      rubricName: str(t.rubricName),
      due: due && !Number.isNaN(Date.parse(due)) ? new Date(due).toISOString() : undefined,
      description: str(t.description),
      kind: str(t.kind) === "optional" ? "optional" : "mandatory",
      nature: nature === "creative" || nature === "mixed" ? nature : "analytical",
      estimateMin: num(t.estimateMin),
      weight: num(t.weight),
    };
  });
  if (!classes.length && !tasks.length) throw new Error("Claude's reply had no classes or tasks in it.");
  return { classes, tasks, notes: str(data.notes) };
}
