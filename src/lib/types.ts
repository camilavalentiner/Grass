/** One line of a class's evaluation rubric, e.g. "Problem sets · 20% · 8 items". */
export type RubricItem = {
  id: string;
  name: string;
  /** share of the final grade, 0..100 */
  weight: number;
  /** how many graded items this line covers (each task gets weight / count) */
  count?: number;
};

export type ClassInfo = {
  id: string;
  name: string;
  code?: string;
  term?: string;
  rubric?: RubricItem[];
  /** archived classes stay for history but are hidden from pickers */
  archived?: boolean;
  /** id in the source system, for syncing */
  externalId?: string;
  color: "blue" | "pink" | "green" | "yellow" | "lav";
  /** current standing in the class, 0..100 */
  currentGrade: number;
  /** target grade the student is aiming for, 0..100 */
  targetGrade?: number;
};

export type TaskKind = "mandatory" | "optional";
export type TaskNature = "analytical" | "creative" | "mixed";

export type Task = {
  id: string;
  classId: string;
  title: string;
  description?: string;
  kind: TaskKind;
  nature: TaskNature;
  /** share of the final grade, 0..100 */
  weight: number;
  /** ISO date-time */
  due: string;
  /** estimated minutes to complete from scratch */
  estimateMin: number;
  /** how hard the task is for this student, 1 (easy) .. 5 (very hard) */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** completion 0..100 */
  progress: number;
  source?: "canvas" | "google" | "teams" | "scan" | "manual" | "ics";
  /** which rubric line this task counts toward */
  rubricItemId?: string;
  /** id in the source system, for syncing without duplicates */
  externalId?: string;
  /** optional link back to the source (Canvas page, calendar event…) */
  url?: string;
};

/** A scanned syllabus photo, PDF or document and what was read from it. */
export type DocRecord = {
  id: string;
  name: string;
  kind: "image" | "pdf" | "text";
  addedAt: string;
  /** small preview, data URL (images only) */
  thumb?: string;
  /** what the extraction found, kept so it can be re-imported after edits */
  extracted?: Extraction;
  note?: string;
};

export type ExtractedClass = { name: string; code?: string; term?: string; rubric: { name: string; weight: number; count?: number }[] };
export type ExtractedTask = {
  title: string;
  classCode?: string;
  className?: string;
  rubricName?: string;
  /** ISO date-time if known */
  due?: string;
  description?: string;
  kind: "mandatory" | "optional";
  nature: "analytical" | "creative" | "mixed";
  estimateMin?: number;
  /** share of the final grade if stated, 0..100 */
  weight?: number;
};
export type Extraction = { classes: ExtractedClass[]; tasks: ExtractedTask[]; notes?: string };

export type Connections = {
  canvas?: { baseUrl: string; token: string; lastSync?: string };
  feeds: { id: string; name: string; url: string; classId?: string; lastSync?: string }[];
};
