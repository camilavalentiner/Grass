"use client";
import { useState } from "react";
import { Sheet, Field, Segmented } from "@/components/ui/Sheet";
import type { ClassInfo, RubricItem } from "@/lib/types";
import { actions, uid } from "@/lib/store";
import { defaultRubric, rubricTotal } from "@/lib/rubric";

const COLORS: { value: ClassInfo["color"]; label: string }[] = [
  { value: "blue", label: "Blue" }, { value: "pink", label: "Pink" }, { value: "green", label: "Green" }, { value: "yellow", label: "Yellow" }, { value: "lav", label: "Lavender" },
];

export function ClassSheet({ cls, term, onClose }: { cls: ClassInfo | "new"; term: string; onClose: () => void }) {
  const isNew = cls === "new";
  const [c, setC] = useState<ClassInfo>(() => (isNew ? { id: uid(), name: "", code: "", term, color: "blue", currentGrade: 0, targetGrade: 90, rubric: defaultRubric() } : { ...cls, rubric: cls.rubric?.length ? cls.rubric : defaultRubric() }));
  const set = <K extends keyof ClassInfo>(k: K, v: ClassInfo[K]) => setC((p) => ({ ...p, [k]: v }));
  const rubric = c.rubric ?? [];
  const total = rubricTotal(rubric);
  const setRow = (i: number, patch: Partial<RubricItem>) => set("rubric", rubric.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <Sheet open onClose={onClose} title={isNew ? "New class" : "Edit class"} wide>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2"><Field label="Name"><input className="input" value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="Organic Chemistry II" autoFocus /></Field></div>
        <Field label="Code"><input className="input" value={c.code ?? ""} onChange={(e) => set("code", e.target.value)} placeholder="CHEM 242" /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Current grade %"><input className="input" type="number" min={0} max={100} value={c.currentGrade} onChange={(e) => set("currentGrade", Math.max(0, Math.min(100, +e.target.value || 0)))} /></Field>
        <Field label="Target %"><input className="input" type="number" min={0} max={100} value={c.targetGrade ?? 90} onChange={(e) => set("targetGrade", Math.max(0, Math.min(100, +e.target.value || 0)))} /></Field>
        <Field label="Term"><input className="input" value={c.term ?? ""} onChange={(e) => set("term", e.target.value)} /></Field>
      </div>
      <Field label="Colour"><Segmented value={c.color} onChange={(v) => set("color", v)} options={COLORS} /></Field>

      <div className="mb-3">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Evaluation rubric</span>
          <span className={`text-xs font-semibold ${Math.abs(total - 100) < 0.5 ? "text-text-muted" : "text-burgundy"}`}>{total} / 100{Math.abs(total - 100) >= 0.5 ? " · should total 100" : ""}</span>
        </div>
        <p className="text-xs text-text-muted mb-2">Every class starts with First exam 30 (past), Second exam 30, Project 30 and Participation 10. Change the weights for this class whenever you like. Tasks linked to a line take its weight divided by the number of items.</p>
        <div className="grid grid-cols-[minmax(0,1fr)_52px_44px_auto_20px] gap-1.5 items-center text-xs text-text-muted mb-1 px-1"><span>Component</span><span>Weight</span><span>Items</span><span>Flags</span><span /></div>
        {rubric.map((r, i) => (
          <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_52px_44px_auto_20px] gap-1.5 items-center mb-1.5">
            <input className="input !py-1.5" value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="Problem sets" aria-label="Component name" />
            <input className="input !py-1.5 !px-2" type="number" min={0} max={100} value={r.weight} onChange={(e) => setRow(i, { weight: +e.target.value || 0 })} aria-label="Weight" />
            <input className="input !py-1.5 !px-2" type="number" min={1} value={r.count ?? ""} onChange={(e) => setRow(i, { count: e.target.value ? Math.max(1, +e.target.value) : undefined })} placeholder="1" aria-label="Number of items" disabled={r.noTask} />
            <div className="flex gap-1">
              <button type="button" className={`chip !py-0.5 !px-2 text-[11px] ${r.past ? "chip-on" : ""}`} aria-pressed={!!r.past} title="Already graded" onClick={() => setRow(i, { past: !r.past })}>past</button>
              <button type="button" className={`chip !py-0.5 !px-2 text-[11px] ${r.noTask ? "chip-on" : ""}`} aria-pressed={!!r.noTask} title="Counts toward the grade but never becomes a task" onClick={() => setRow(i, { noTask: !r.noTask })}>no task</button>
            </div>
            <button type="button" className="text-text-muted" aria-label="Remove line" onClick={() => set("rubric", rubric.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <div className="flex gap-3 text-sm">
          <button type="button" className="text-text-blue underline underline-offset-4" onClick={() => set("rubric", [...rubric, { id: uid(), name: "", weight: 0, count: 1 }])}>+ add a component</button>
          <button type="button" className="text-text-muted underline underline-offset-4" onClick={() => set("rubric", defaultRubric())}>reset to default</button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        {!isNew ? (
          <div className="flex gap-3 text-sm">
            <button type="button" className="text-text-muted underline underline-offset-4" onClick={() => { actions.upsertClass({ ...c, archived: !c.archived }); onClose(); }}>{c.archived ? "Unarchive" : "Archive"}</button>
            <button type="button" className="text-burgundy underline underline-offset-4" onClick={() => { if (confirm("Delete this class and all its tasks?")) { actions.deleteClass(c.id); onClose(); } }}>Delete</button>
          </div>
        ) : <span />}
        <div className="flex gap-2">
          <button type="button" className="btn" style={{ background: "var(--paper-2)" }} onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-green" disabled={!c.name.trim()} onClick={() => { actions.upsertClass({ ...c, name: c.name.trim(), code: c.code?.trim() || undefined, rubric: rubric.filter((r) => r.name.trim()) }); onClose(); }}>Save</button>
        </div>
      </div>
    </Sheet>
  );
}
