/** The instructions for reading course material. Shared by the built-in reader and the copy-to-Claude prompt. */
export const READER_RULES = `Return every class you can identify with its evaluation rubric: each graded component, its share of the final grade as a percentage, and how many graded items it covers when stated (for example "8 problem sets, 20%"). Return every dated piece of work: homework, readings with quizzes, projects, essays, labs, exams, presentations. Use the class code when printed (like CHEM 242), else the class name.

Dates: resolve relative dates against today's date and the student's time zone. Write them as ISO 8601 with the offset. If only a day is given, use 23:59 that day. Leave due as null when there is no date.

kind: "optional" only when the material says the work is optional, extra credit, or ungraded; otherwise "mandatory". nature: "analytical" for problem sets, quizzes, exams, readings and calculations; "creative" for essays, presentations, designs, videos and open-ended projects; "mixed" for lab reports and projects with both. estimateMin: an honest estimate of focused minutes for a typical student, null if you cannot tell. weight: the task's own share of the final grade when it can be derived (component weight divided by number of items), else null.

Do not invent classes or tasks that are not in the material. Put anything uncertain in notes.`;

export const READER_SYSTEM = `You read a student's course material (syllabus photos, assignment pages, rubric tables, calendar screenshots, PDFs, pasted text) and return structured data for a study planner.

${READER_RULES}`;

const SHAPE = `{
  "classes": [
    { "name": "Organic Chemistry II", "code": "CHEM 242", "term": "Fall 2026",
      "rubric": [ { "name": "Problem sets", "weight": 20, "count": 8 } ] }
  ],
  "tasks": [
    { "title": "Problem set 7", "classCode": "CHEM 242", "className": null, "rubricName": "Problem sets",
      "due": "2026-11-21T23:59:00-06:00", "description": null,
      "kind": "mandatory", "nature": "analytical", "estimateMin": 120, "weight": 2.5 }
  ],
  "notes": null
}`;

function offsetLabel(d: Date) {
  const m = -d.getTimezoneOffset();
  const sign = m >= 0 ? "+" : "−";
  const a = Math.abs(m);
  return `UTC${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
}

/** The prompt the student pastes into the Claude app next to their photos or files. */
export function claudeAppPrompt(now = new Date()) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return `I'm setting up my study planner. Read the course material I've attached (photos, PDFs or text) and reply with one JSON code block only, in exactly the shape below, with no other text.

${READER_RULES}

Today is ${today}. My time zone is ${tz} (${offsetLabel(now)}).

Shape (the values are only an example):
${SHAPE}`;
}
