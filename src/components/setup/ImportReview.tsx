"use client";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import type { ClassInfo, Task } from "@/lib/types";
import { actions } from "@/lib/store";
import { fmtDue } from "@/components/TaskRow";

/** Lets the student check what was found before it lands in their lists. */
export function ImportReview({ found, existing, title, onClose }: { found: { classes: ClassInfo[]; tasks: Task[] }; existing: ClassInfo[]; title: string; onClose: () => void }) {
  const [pickC, setPickC] = useState<Record<string, boolean>>(() => Object.fromEntries(found.classes.map((c) => [c.id, true])));
  const [tasks, setTasks] = useState<Task[]>(found.tasks);
  const [pickT, setPickT] = useState<Record<string, boolean>>(() => Object.fromEntries(found.tasks.map((t) => [t.id, true])));
  const allClasses = [...found.classes, ...existing.filter((c) => !c.archived)];
  const now = new Date();
  const nC = Object.values(pickC).filter(Boolean).length, nT = Object.values(pickT).filter(Boolean).length;

  const importNow = () => {
    const classes = found.classes.filter((c) => pickC[c.id]);
    const chosen = tasks.filter((t) => pickT[t.id] && t.classId);
    actions.importMany(classes, chosen);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={title} wide>
      {found.classes.length > 0 && (
        <div className="mb-4">
          <span className="eyebrow">Classes found · {found.classes.length}</span>
          <ul className="mt-1 flex flex-col gap-1.5">
            {found.classes.map((c) => {
              const dup = existing.find((x) => !x.archived && ((c.code && x.code?.toLowerCase() === c.code.toLowerCase()) || x.name.toLowerCase() === c.name.toLowerCase()));
              return (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1 accent-[#2f4a32]" checked={!!pickC[c.id]} onChange={(e) => setPickC((p) => ({ ...p, [c.id]: e.target.checked }))} aria-label={`Import ${c.name}`} />
                  <div className="min-w-0">
                    <div className="font-medium">{c.code ? `${c.code} · ` : ""}{c.name}{dup && <span className="ml-2 text-xs text-text-muted">updates existing</span>}</div>
                    {c.rubric?.length ? <div className="text-xs text-text-muted">{c.rubric.map((r) => `${r.name} ${r.weight}%${r.count ? ` ×${r.count}` : ""}`).join(" · ")}</div> : <div className="text-xs text-text-muted">no rubric found</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div>
        <span className="eyebrow">Tasks found · {tasks.length}</span>
        {!tasks.length && <p className="text-sm text-text-muted mt-1">No dated work was found.</p>}
        <ul className="mt-1 flex flex-col gap-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 accent-[#2f4a32]" checked={!!pickT[t.id]} onChange={(e) => setPickT((p) => ({ ...p, [t.id]: e.target.checked }))} aria-label={`Import ${t.title}`} />
              <div className="min-w-0 flex-1">
                <div className="font-medium leading-snug">{t.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                  <select className="input !w-auto !py-0.5 !px-2 !text-xs" value={t.classId} onChange={(e) => setTasks((arr) => arr.map((x) => (x.id === t.id ? { ...x, classId: e.target.value } : x)))} aria-label="Class">
                    <option value="">— class —</option>
                    {allClasses.map((c) => <option key={c.id} value={c.id}>{c.code ?? c.name}</option>)}
                  </select>
                  <span>{fmtDue(t.due, now)}</span>
                  {t.weight > 0 && <span>· {t.weight}% of grade</span>}
                  {t.kind === "optional" && <span>· optional</span>}
                  {t.progress >= 100 && <span>· already submitted</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="btn" style={{ background: "var(--paper-2)" }} onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-green" onClick={importNow} disabled={!nC && !nT}>Import {nC ? `${nC} class${nC > 1 ? "es" : ""}` : ""}{nC && nT ? " and " : ""}{nT ? `${nT} task${nT > 1 ? "s" : ""}` : ""}</button>
      </div>
    </Sheet>
  );
}
