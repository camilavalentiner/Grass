"use client";
import { useState } from "react";
import { Sheet, Field } from "./ui/Sheet";
import { actions } from "@/lib/store";
import { sendSignInEmail, signOut, syncNow, useSyncStatus, verifyCode } from "@/lib/sync";

export function SettingsSheet({ name, onClose }: { name: string; onClose: () => void }) {
  const [n, setN] = useState(name);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const sync = useSyncStatus();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const signedIn = sync.phase === "syncing" || sync.phase === "synced" || (sync.phase === "error" && !!sync.email && !code);
  return (
    <Sheet open onClose={onClose} title="Settings">
      <Field label="Your name" hint="Used in greetings and when a session ends."><input className="input" value={n} onChange={(e) => setN(e.target.value)} /></Field>
      <Field label="Time zone" hint="Taken from this device. Finish times and productivity windows use it."><div className="input bg-paper-2">{tz}</div></Field>
      <div className="mb-3 rounded-[18px] border-[1.5px] border-[rgba(59,47,40,.18)] bg-paper-2 p-3.5">
        <span className="eyebrow block mb-1">Sync across devices</span>
        {signedIn ? (
          <>
            <p className="text-sm">Signed in as <span className="font-semibold">{sync.email}</span>.</p>
            <p className="text-xs text-text-muted mt-0.5">{sync.phase === "syncing" ? "Syncing…" : sync.lastSync ? `Last synced ${new Date(sync.lastSync).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : "Not synced yet"}</p>
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn btn-blue !py-1.5" onClick={() => syncNow()}>Sync now</button>
              <button type="button" className="btn !py-1.5" style={{ background: "var(--paper)" }} onClick={() => signOut()}>Sign out</button>
            </div>
          </>
        ) : sync.phase === "code-sent" ? (
          <>
            <p className="text-sm">We emailed <span className="font-semibold">{sync.email}</span>. Tap the link in that email, or type the code from it here.</p>
            <div className="mt-2 flex gap-2">
              <input className="input !py-1.5 tabular-nums" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} aria-label="Sign-in code" />
              <button type="button" className="btn btn-green !py-1.5" disabled={code.length < 6} onClick={async () => { if (await verifyCode(sync.email!, code)) setCode(""); }}>Sign in</button>
            </div>
            <button type="button" className="mt-1 text-xs text-text-muted underline underline-offset-4" onClick={() => sendSignInEmail(sync.email!)}>Send it again</button>
          </>
        ) : sync.phase === "off" ? (
          <p className="text-sm text-text-muted">Sync is not available in this browser.</p>
        ) : (
          <>
            <p className="text-sm text-text-muted">Sign in with your email to keep the same classes, tasks and sessions on your phone and laptop.</p>
            <div className="mt-2 flex gap-2">
              <input className="input !py-1.5" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <button type="button" className="btn btn-green !py-1.5 whitespace-nowrap" disabled={!/^\S+@\S+\.\S+$/.test(email) || sending} onClick={async () => { setSending(true); await sendSignInEmail(email.trim()); setSending(false); }}>{sending ? "Sending…" : "Email me"}</button>
            </div>
          </>
        )}
        {sync.error && <p className="text-xs text-burgundy mt-1.5">{sync.error}</p>}
      </div>
      <div className="flex items-center justify-between mt-3">
        <button type="button" className="text-sm text-burgundy underline underline-offset-4" onClick={() => { if (confirm("Replace everything with the sample classes and tasks?")) { actions.resetSample(); onClose(); } }}>Reset to sample data</button>
        <button type="button" className="btn btn-green" onClick={() => { actions.setName(n.trim() || name); onClose(); }}>Save</button>
      </div>
    </Sheet>
  );
}
