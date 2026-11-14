import type { ClassInfo, Task } from "./types";

const d = (daysFromNow: number, hour = 23, minute = 59) => {
  const t = new Date();
  t.setDate(t.getDate() + daysFromNow);
  t.setHours(hour, minute, 0, 0);
  return t.toISOString();
};

export const sampleClasses: ClassInfo[] = [
  { id: "c1", name: "Organic Chemistry II", code: "CHEM 242", color: "blue", currentGrade: 78, targetGrade: 90 },
  { id: "c2", name: "Intro to Microeconomics", code: "ECON 101", color: "yellow", currentGrade: 91, targetGrade: 93 },
  { id: "c3", name: "Victorian Literature", code: "ENGL 318", color: "pink", currentGrade: 85, targetGrade: 90 },
  { id: "c4", name: "Data Visualisation", code: "DSCI 220", color: "green", currentGrade: 88, targetGrade: 92 },
];

export const sampleTasks: Task[] = [
  { id: "t1", classId: "c1", title: "Problem set 6: carbonyl reactions", kind: "mandatory", nature: "analytical", weight: 5, due: d(1, 23, 59), estimateMin: 150, difficulty: 4, progress: 30, source: "canvas" },
  { id: "t2", classId: "c1", title: "Lab report: aldol condensation", kind: "mandatory", nature: "mixed", weight: 10, due: d(4), estimateMin: 240, difficulty: 4, progress: 10, source: "canvas" },
  { id: "t3", classId: "c2", title: "Reading: Mankiw ch. 7 + quiz", kind: "mandatory", nature: "analytical", weight: 2, due: d(2, 9, 0), estimateMin: 60, difficulty: 2, progress: 0, source: "google" },
  { id: "t4", classId: "c3", title: "Essay draft: Jane Eyre and the gothic", kind: "mandatory", nature: "creative", weight: 20, due: d(7), estimateMin: 420, difficulty: 3, progress: 45, source: "teams" },
  { id: "t5", classId: "c4", title: "Dashboard project: final slides", kind: "mandatory", nature: "creative", weight: 25, due: d(10), estimateMin: 300, difficulty: 3, progress: 60, source: "scan" },
  { id: "t6", classId: "c4", title: "Optional: Observable notebook polish", kind: "optional", nature: "creative", weight: 0, due: d(12), estimateMin: 90, difficulty: 2, progress: 0, source: "manual" },
  { id: "t7", classId: "c3", title: "Discussion post: week 11", kind: "mandatory", nature: "creative", weight: 1, due: d(0, 23, 59), estimateMin: 40, difficulty: 1, progress: 0, source: "teams" },
  { id: "t8", classId: "c2", title: "Optional: practice midterm", kind: "optional", nature: "analytical", weight: 0, due: d(5), estimateMin: 120, difficulty: 3, progress: 100, source: "manual" },
];
