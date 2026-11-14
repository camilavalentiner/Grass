export type ClassInfo = {
  id: string;
  name: string;
  code?: string;
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
  source?: "canvas" | "google" | "teams" | "scan" | "manual";
};
