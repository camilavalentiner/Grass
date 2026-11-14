"use client";
import { useState } from "react";
import type { ClassInfo, Connections } from "@/lib/types";
import { actions, uid } from "@/lib/store";
import { fromIcs, syncCanvas } from "@/lib/importers";
import type { IcsEvent } from "@/lib/ics";
import { ImportReview } from "./ImportReview";
import { Field } from "@/components/ui/Sheet";

export function ConnectionsPanel({ connections, classes }: { connections: Connections; classes: ClassInfo[] }) {
  const [base, setBase] = useState(connections.canvas?.baseUrl ?? "");
  const [token, setToken] = useState(connections.canvas?.token ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<{ title: string; found: { classes: ClassInfo[]; tasks: import("@/lib/types").Task[] } } | null>(null);
  const [feedName, setFeedName] = useState(""); const [feedUrl, setFeedUrl] = useState(""); const [feedClass, setFeedClass] = useState("");
  const active = classes.filter((c) => !c.archived);

  const runCanvas = async () => {
    setError(null); setBusy("canvas");
    try {
      const b = base.trim().replace(/\/+$/, "");
      const found = await syncCanvas(b, token.trim(), classes);
      actions.setConnections((c) => ({ ...c, canvas: { baseUrl: b, token: token.trim(), lastSync: new Date().toISOString() } }));
      setReview({ title: "Found in Canvas", found });
    } catch (e) { setError(e instanceof Error ? e.message : "Canvas sync failed"); } finally { setBusy(null); }
  };
  const runFeed = async (feed: Connections["feeds"][number]) => {
    setError(null); setBusy(feed.id);
    try {
      const r = await fetch(`/api/ics?url=${encodeURIComponent(feed.url)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Feed failed");
      const found = fromIcs(data.events as IcsEvent[], feed, classes);
      actions.setConnections((c) => ({ ...c, feeds: c.feeds.map((f) => (f.id === feed.id ? { ...f, lastSync: new Date().toISOString() } : f)) }));
      setReview({ title: `Found in ${feed.name}`, found });
    } catch (e) { setError(e instanceof Error ? e.message : "Feed sync failed"); } finally { setBusy(null); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <p className="eyebrow">Canvas</p>
        <p className="text-sm text-text-muted mt-1 mb-3">Pulls your active courses, their grading groups as rubrics, your current score, and open assignments with due dates. In Canvas go to Account → Settings → Approved integrations → New access token. The token stays on this device.</p>
        <Field label="Canvas address"><input className="input" value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://yourschool.instructure.com" inputMode="url" /></Field>
        <Field label="Access token"><input className="input" value={token} onChange={(e) => setToken(e.target.value)} type="password" placeholder="paste the token" /></Field>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-muted">{connections.canvas?.lastSync ? `Last synced ${new Date(connections.canvas.lastSync).toLocaleString()}` : "Not connected yet"}</span>
          <button type="button" className="btn btn-blue" disabled={!base.trim() || !token.trim() || !!busy} onClick={runCanvas}>{busy === "canvas" ? "Syncing…" : "Sync Canvas"}</button>
        </div>
      </div>

      <div className="card p-4">
        <p className="eyebrow">Calendar feeds · Google Calendar, Outlook / Teams, Canvas calendar</p>
        <p className="text-sm text-text-muted mt-1">Any calendar with a secret iCal address. Google Calendar: Settings → your calendar → Secret address in iCal format. Outlook or Teams: Settings → Calendar → Shared calendars → Publish → ICS link. Canvas: Calendar → Calendar feed. Events that name one of your classes become tasks.</p>
        <ul className="mt-3 flex flex-col gap-2">
          {connections.feeds.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{f.name}{f.classId && <span className="text-text-muted"> · {active.find((c) => c.id === f.classId)?.code ?? "class"}</span>}</div>
                <div className="text-xs text-text-muted truncate">{f.lastSync ? `Last synced ${new Date(f.lastSync).toLocaleString()}` : "Never synced"}</div>
              </div>
              <button type="button" className="chip !py-1 text-xs" disabled={!!busy} onClick={() => runFeed(f)}>{busy === f.id ? "Syncing…" : "Sync"}</button>
              <button type="button" className="text-text-muted text-xs" aria-label="Remove feed" onClick={() => actions.setConnections((c) => ({ ...c, feeds: c.feeds.filter((x) => x.id !== f.id) }))}>✕</button>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
          <Field label="Name"><input className="input" value={feedName} onChange={(e) => setFeedName(e.target.value)} placeholder="My Google Calendar" /></Field>
          <Field label="iCal address"><input className="input" value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} placeholder="https://calendar.google.com/calendar/ical/…/basic.ics" inputMode="url" /></Field>
          <Field label="Only for class (optional)">
            <select className="input" value={feedClass} onChange={(e) => setFeedClass(e.target.value)}>
              <option value="">match by name</option>
              {active.map((c) => <option key={c.id} value={c.id}>{c.code ?? c.name}</option>)}
            </select>
          </Field>
        </div>
        <button type="button" className="btn btn-green" disabled={!feedName.trim() || !/^(https?|webcal):\/\//i.test(feedUrl.trim())} onClick={() => { actions.setConnections((c) => ({ ...c, feeds: [...c.feeds, { id: uid(), name: feedName.trim(), url: feedUrl.trim(), classId: feedClass || undefined }] })); setFeedName(""); setFeedUrl(""); setFeedClass(""); }}>Add feed</button>
      </div>

      <div className="card p-4">
        <p className="eyebrow">Teams assignments & Google Drive</p>
        <p className="text-sm text-text-muted mt-1">Teams assignments need a school-approved Microsoft sign-in, which most students cannot grant themselves, so the dependable route is the Outlook calendar feed above plus photos or screenshots of assignment pages. Files in Google Drive or OneDrive can be picked straight from the phone&apos;s file chooser on the Documents tab.</p>
      </div>
      {error && <p className="text-sm text-burgundy">{error}</p>}
      {review && <ImportReview found={review.found} existing={classes} title={review.title} onClose={() => setReview(null)} />}
    </div>
  );
}
