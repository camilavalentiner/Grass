"use client";
import { useState } from "react";
import type { ClassInfo, Task } from "@/lib/types";
import { actions } from "@/lib/store";
import { ClassSheet } from "./ClassSheet";

const tint: Record<ClassInfo["color"], string> = { blue: "var(--blue)", pink: "var(--pink)", green: "var(--green)", yellow: "var(--yellow)", lav: "#e6d6f0" };

export function ClassesPanel({ classes, tasks, term }: { classes: ClassInfo[]; tasks: Task[]; term: string }) {
  const [editing, setEditing] = useState<ClassInfo | "new" | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [t, setT] = useState(term);
  const shown = classes.filter((c) => showArchived || !c.archived);
  const openCount = (id: string) => tasks.filter((x) => x.classId === id && x.progress < 100).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <div className="flex items-end gap-2">
          <label className="flex-1"><span className="eyebrow block mb-1">Current term</span><input className="input" value={t} onChange={(e) => setT(e.target.value)} onBlur={() => actions.setTerm(t.trim() || term)} /></label>
          <button type="button" className="btn btn-pink" onClick={() => { const name = prompt("Name of the new semester?", t); if (name && confirm(`Archive all ${classes.filter((c) => !c.archived).length} classes and clear open tasks? Finished tasks stay for your history.`)) { actions.newTerm(name.trim()); setT(name.trim()); } }}>New semester</button>
        </div>
        <p className="text-xs text-text-muted mt-2">A new semester archives every class and clears open tasks. Archived classes keep their history and can be brought back.</p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="eyebrow">Classes · {shown.length}</p>
          <div className="flex gap-1.5">
            {classes.some((c) => c.archived) && <button type="button" className={`chip !py-1 text-xs ${showArchived ? "chip-on" : ""}`} onClick={() => setShowArchived((v) => !v)}>Archived</button>}
            <button type="button" className="btn !py-1 !px-3 text-sm" onClick={() => setEditing("new")}>+ Add</button>
          </div>
        </div>
        {!shown.length && <p className="text-sm text-text-muted">No classes yet. Add one, scan a syllabus, or sync Canvas.</p>}
        <ul className="flex flex-col">
          {shown.map((c) => {
            const total = (c.rubric ?? []).reduce((a, r) => a + r.weight, 0);
            return (
              <li key={c.id}>
                <button type="button" onClick={() => setEditing(c)} className="w-full text-left py-2.5 border-b border-dashed border-[rgba(59,47,40,.18)] last:border-0 flex items-start gap-3">
                  <span className="mt-1 w-3.5 h-3.5 rounded-full border border-[rgba(59,47,40,.3)] shrink-0" style={{ background: tint[c.color] }} />
                  <span className="min-w-0 flex-1">
                    <span className={`block font-medium leading-snug ${c.archived ? "text-text-muted" : ""}`}>{c.code ? `${c.code} · ` : ""}{c.name}{c.archived && <span className="text-xs ml-2">archived</span>}</span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {c.currentGrade ? `${c.currentGrade}% now · aiming ${c.targetGrade ?? 90}%` : "no grade yet"} · {openCount(c.id)} open task{openCount(c.id) === 1 ? "" : "s"}
                      {c.rubric?.length ? ` · rubric ${total}%` : " · no rubric"}
                    </span>
                  </span>
                  <span className="text-text-muted text-sm">›</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {editing && <ClassSheet cls={editing} term={t} onClose={() => setEditing(null)} />}
    </div>
  );
}
