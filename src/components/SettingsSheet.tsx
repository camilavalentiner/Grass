"use client";
import { useState } from "react";
import { Sheet, Field } from "./ui/Sheet";
import { actions } from "@/lib/store";

export function SettingsSheet({ name, onClose }: { name: string; onClose: () => void }) {
  const [n, setN] = useState(name);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <Sheet open onClose={onClose} title="Settings">
      <Field label="Your name" hint="Used in greetings and when a session ends."><input className="input" value={n} onChange={(e) => setN(e.target.value)} /></Field>
      <Field label="Time zone" hint="Taken from this device. Finish times and productivity windows use it."><div className="input bg-paper-2">{tz}</div></Field>
      <div className="flex items-center justify-between mt-3">
        <button type="button" className="text-sm text-burgundy underline underline-offset-4" onClick={() => { if (confirm("Replace everything with the sample classes and tasks?")) { actions.resetSample(); onClose(); } }}>Reset to sample data</button>
        <button type="button" className="btn btn-green" onClick={() => { actions.setName(n.trim() || name); onClose(); }}>Save</button>
      </div>
    </Sheet>
  );
}
