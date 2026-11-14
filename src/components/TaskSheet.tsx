"use client";
import { useState } from "react";
import { Sheet, Field, Segmented } from "./ui/Sheet";
import type { ClassInfo, Task, TaskKind, TaskNature } from "@/lib/types";
import { actions, uid } from "@/lib/store";
import { weightFromLine } from "@/lib/rubric";

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Guess a difficulty from how much a task weighs and what kind of work it is; the student can change it. */
export function guessDifficulty(weight: number, nature: TaskNature, kind: TaskKind): Task["difficulty"] {
  let d = 3;
  if (weight >= 20) d += 1; else if (weight > 0 && weight <= 3) d -= 1;
  if (nature === "mixed") d += 1;
  if (kind === "optional") d -= 1;
  return Math.max(1, Math.min(5, d)) as Task["difficulty"];
}

export function TaskSheet({ task, classes: allClasses, onClose }: { task: Task | null | "new"; classes: ClassInfo[]; onClose: () => void }) {
  const isNew = task === "new";
  const classes = allClasses.filter((c) => !c.archived || (task && task !== "new" && task.classId === c.id));
  const [t, setT] = useState<Task>(() => (isNew || !task
    ? { id: uid(), classId: classes[0]?.id ?? "", title: "", kind: "mandatory", nature: "analytical", weight: 5, due: new Date(Date.now() + 3 * 864e5).toISOString(), estimateMin: 60, difficulty: 3, progress: 0, source: "manual" }
    : task));
  const [touchedDifficulty, setTouched] = useState(!isNew);
  const set = <K extends keyof Task>(k: K, v: Task[K]) => {
    setT((prev) => {
      const next = { ...prev, [k]: v };
      if (!touchedDifficulty && (k === "weight" || k === "nature" || k === "kind")) next.difficulty = guessDifficulty(next.weight, next.nature, next.kind);
      return next;
    });
  };
  const save = () => { if (!t.title.trim()) return; actions.upsertTask({ ...t, title: t.title.trim() }); onClose(); };

  return (
    <Sheet open onClose={onClose} title={isNew ? "New task" : "Edit task"}>
      <Field label="Title"><input className="input" value={t.title} onChange={(e) => set("title", e.target.value)} placeholder="Problem set 7" autoFocus /></Field>
      <Field label="Class">
        <select className="input" value={t.classId} onChange={(e) => set("classId", e.target.value)}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.code ? `${c.code} · ` : ""}{c.name}</option>)}
        </select>
      </Field>
      {(() => {
        const rub = (classes.find((c) => c.id === t.classId)?.rubric ?? []).filter((r) => !r.noTask);
        if (!rub.length) return null;
        return (
          <Field label="Counts toward" hint="Picking a rubric line sets the weight; you can still change the weight below for this task alone.">
            <select className="input" value={t.rubricItemId ?? ""} onChange={(e) => {
              const r = rub.find((x) => x.id === e.target.value);
              setT((prev) => ({ ...prev, rubricItemId: r?.id, weight: r ? weightFromLine(r) : prev.weight }));
            }}>
              <option value="">— not linked —</option>
              {rub.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.weight}%{r.count && r.count > 1 ? ` ÷ ${r.count}` : ""}{r.past ? " · past" : ""}</option>)}
            </select>
          </Field>
        );
      })()}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Due"><input className="input" type="datetime-local" value={toLocalInput(t.due)} onChange={(e) => e.target.value && set("due", new Date(e.target.value).toISOString())} /></Field>
        <Field label="Estimate (min)"><input className="input" type="number" min={5} step={5} value={t.estimateMin} onChange={(e) => set("estimateMin", Math.max(5, +e.target.value || 5))} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight on final grade (%)"><input className="input" type="number" min={0} max={100} value={t.weight} onChange={(e) => set("weight", Math.max(0, Math.min(100, +e.target.value || 0)))} /></Field>
        <Field label="Progress (%)"><input className="input" type="number" min={0} max={100} value={t.progress} onChange={(e) => set("progress", Math.max(0, Math.min(100, +e.target.value || 0)))} /></Field>
      </div>
      <Field label="Kind"><Segmented value={t.kind} onChange={(v) => set("kind", v)} options={[{ value: "mandatory", label: "Mandated" }, { value: "optional", label: "Optional" }]} /></Field>
      <Field label="Type of work" hint="Analytical work suits mornings; creative work suits evenings.">
        <Segmented value={t.nature} onChange={(v) => set("nature", v)} options={[{ value: "analytical", label: "Analytical" }, { value: "creative", label: "Creative" }, { value: "mixed", label: "Mixed" }]} />
      </Field>
      <Field label={`Difficulty · ${["", "easy", "light", "medium", "hard", "very hard"][t.difficulty]}`} hint={touchedDifficulty ? undefined : "Guessed from weight and type. Adjust any time."}>
        <input type="range" min={1} max={5} step={1} value={t.difficulty} onChange={(e) => { setTouched(true); set("difficulty", +e.target.value as Task["difficulty"]); }} className="range w-full" />
      </Field>
      <Field label="Notes"><textarea className="input min-h-16" value={t.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="What the rubric asks for, links, reminders…" /></Field>
      <div className="flex items-center justify-between gap-2 mt-2">
        {!isNew ? <button type="button" className="text-sm text-burgundy underline underline-offset-4" onClick={() => { actions.deleteTask(t.id); onClose(); }}>Delete task</button> : <span />}
        <div className="flex gap-2">
          <button type="button" className="btn" style={{ background: "var(--paper-2)" }} onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-green" onClick={save} disabled={!t.title.trim()}>Save</button>
        </div>
      </div>
    </Sheet>
  );
}
