"use client";
import { useState } from "react";
import { useAppState } from "@/lib/store";
import { ClassesPanel } from "@/components/setup/ClassesPanel";
import { DocumentsPanel } from "@/components/setup/DocumentsPanel";
import { ConnectionsPanel } from "@/components/setup/ConnectionsPanel";

type Tab = "classes" | "documents" | "connections";

export default function SetupPage() {
  const state = useAppState();
  const [tab, setTab] = useState<Tab>("classes");
  if (!state) return <main className="mx-auto w-full max-w-md px-4 py-6" />;
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 pb-24 flex flex-col gap-4">
      <header className="card p-5">
        <p className="eyebrow">{state.term}</p>
        <h1 className="text-2xl font-semibold text-text-blue mt-1">Classes & sources</h1>
        <p className="text-sm text-text-muted mt-1">Where your classes, rubrics and tasks come from, and where to fix them when a semester changes or a rubric moves.</p>
        <div className="mt-3 flex gap-1.5">
          {([["classes", "Classes"], ["documents", "Documents & scans"], ["connections", "Connections"]] as [Tab, string][]).map(([k, label]) => (
            <button key={k} type="button" className={`chip ${tab === k ? "chip-on" : ""}`} onClick={() => setTab(k)} aria-pressed={tab === k}>{label}</button>
          ))}
        </div>
      </header>
      {tab === "classes" && <ClassesPanel classes={state.classes} tasks={state.tasks} term={state.term} />}
      {tab === "documents" && <DocumentsPanel docs={state.documents} classes={state.classes} />}
      {tab === "connections" && <ConnectionsPanel connections={state.connections} classes={state.classes} />}
    </main>
  );
}
