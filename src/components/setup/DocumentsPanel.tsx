"use client";
import { useEffect, useRef, useState } from "react";
import type { ClassInfo, DocRecord, Extraction } from "@/lib/types";
import { actions, uid } from "@/lib/store";
import { fromExtraction } from "@/lib/importers";
import { ImportReview } from "./ImportReview";
import { claudeAppPrompt } from "@/lib/readerPrompt";
import { parseClaudeReply } from "@/lib/parseReply";

/** Shrink a photo so it uploads quickly and costs few tokens; returns a JPEG blob and a small thumbnail. */
async function prepareImage(file: File): Promise<{ blob: Blob; thumb: string }> {
  const bmp = await createImageBitmap(file);
  const draw = (max: number, q: number) => {
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return { canvas: c, url: c.toDataURL("image/jpeg", q) };
  };
  const big = draw(1600, 0.85);
  const blob = await new Promise<Blob>((res) => big.canvas.toBlob((b) => res(b!), "image/jpeg", 0.85));
  return { blob, thumb: draw(280, 0.7).url };
}

export function DocumentsPanel({ docs, classes }: { docs: DocRecord[]; classes: ClassInfo[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [review, setReview] = useState<{ title: string; found: ReturnType<typeof fromExtraction> } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [builtIn, setBuiltIn] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let live = true;
    fetch("/api/extract").then((r) => r.json()).then((d) => { if (live) setBuiltIn(!!d.enabled); }).catch(() => {});
    return () => { live = false; };
  }, []);

  /** Without the built-in reader, chosen files are kept here for reference until Claude's reply comes back. */
  const keepFiles = async (files: File[]) => {
    setError(null);
    for (const f of files) {
      const thumb = f.type.startsWith("image/") ? (await prepareImage(f)).thumb : undefined;
      actions.upsertDocument({ id: uid(), name: f.name, kind: f.type.startsWith("image/") ? "image" : f.type === "application/pdf" ? "pdf" : "text", addedAt: new Date().toISOString(), thumb });
    }
  };

  const copyPrompt = async () => {
    const text = claudeAppPrompt();
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } finally { ta.remove(); }
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const readReply = () => {
    setError(null);
    try {
      const extraction = parseClaudeReply(text);
      const dayAgo = Date.now() - 864e5;
      const waiting = docs.filter((d) => !d.extracted && +new Date(d.addedAt) > dayAgo);
      if (waiting.length) waiting.forEach((d) => actions.upsertDocument({ ...d, extracted: extraction }));
      else actions.upsertDocument({ id: uid(), name: `Claude reply · ${new Date().toLocaleDateString()}`, kind: "text", addedAt: new Date().toISOString(), extracted: extraction, note: text.slice(0, 4000) });
      setReview({ title: "Found in Claude's reply", found: fromExtraction(extraction, classes) });
      setText("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not read that reply."); }
  };

  const extract = async (files: File[], pasted: string, docId?: string) => {
    setError(null); setBusy("Reading…");
    try {
      const form = new FormData();
      form.set("timeZone", Intl.DateTimeFormat().resolvedOptions().timeZone);
      form.set("today", new Date().toString());
      if (pasted.trim()) form.set("text", pasted.trim());
      const records: DocRecord[] = [];
      for (const f of files) {
        if (f.type.startsWith("image/")) {
          const { blob, thumb } = await prepareImage(f);
          form.append("files", new File([blob], f.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }));
          records.push({ id: uid(), name: f.name, kind: "image", addedAt: new Date().toISOString(), thumb });
        } else {
          form.append("files", f);
          records.push({ id: uid(), name: f.name, kind: f.type === "application/pdf" ? "pdf" : "text", addedAt: new Date().toISOString() });
        }
      }
      if (pasted.trim() && !files.length) records.push({ id: uid(), name: pasted.trim().slice(0, 40) + (pasted.length > 40 ? "…" : ""), kind: "text", addedAt: new Date().toISOString(), note: pasted.trim().slice(0, 2000) });
      const r = await fetch("/api/extract", { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `Extraction failed (${r.status})`);
      const extraction = data as Extraction;
      if (docId) actions.upsertDocument({ ...docs.find((d) => d.id === docId)!, extracted: extraction });
      else for (const rec of records) actions.upsertDocument({ ...rec, extracted: extraction });
      setReview({ title: "Found in your material", found: fromExtraction(extraction, classes) });
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setBusy(null); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <p className="eyebrow">Add material</p>
        <p className="text-sm text-text-muted mt-1">Photos of a syllabus, a rubric table, an assignment page, a calendar screenshot, a PDF, or text. Claude reads it and the app proposes classes, rubrics and tasks for you to confirm.</p>
        <input ref={fileRef} type="file" multiple accept="image/*,application/pdf,.txt,.md,.csv" className="hidden" onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) { if (builtIn) extract(fs, ""); else keepFiles(fs); } e.target.value = ""; }} />

        {builtIn ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-blue" onClick={() => fileRef.current?.click()} disabled={!!busy}>{busy ?? "Choose photos or files"}</button>
          </div>
        ) : (
          <ol className="mt-3 flex flex-col gap-3 text-sm">
            <li className="flex gap-2.5">
              <span className="step-dot">1</span>
              <div className="flex-1">
                <div className="font-medium">Copy the prompt and open Claude</div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-blue" onClick={copyPrompt}>{copied ? "Copied" : "Copy prompt"}</button>
                  <a className="btn" href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">Open Claude</a>
                </div>
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="step-dot">2</span>
              <div className="flex-1">
                <div className="font-medium">Attach your photos or files in Claude, paste the prompt, and send</div>
                <button type="button" className="mt-1 text-text-blue underline underline-offset-4" onClick={() => fileRef.current?.click()}>Keep a copy of the photos here too</button>
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="step-dot">3</span>
              <div className="flex-1">
                <div className="font-medium">Copy Claude&apos;s whole reply and paste it below</div>
              </div>
            </li>
          </ol>
        )}
        <textarea className="input mt-3 min-h-20" placeholder={builtIn ? "…or paste text from an email, a syllabus or a Teams post" : "Paste Claude's reply here"} value={text} onChange={(e) => setText(e.target.value)} aria-label={builtIn ? "Text to read" : "Claude's reply"} />
        {text.trim() && (builtIn && !text.includes("{")
          ? <button type="button" className="btn btn-green mt-2" onClick={() => extract([], text)} disabled={!!busy}>{busy ?? "Read pasted text"}</button>
          : <button type="button" className="btn btn-green mt-2" onClick={readReply}>Read reply</button>)}
        {error && <p className="text-sm text-burgundy mt-2">{error}</p>}
      </div>

      <div className="card p-4">
        <p className="eyebrow">Your documents · {docs.length}</p>
        {!docs.length && <p className="text-sm text-text-muted mt-1">Nothing scanned yet.</p>}
        <ul className="mt-2 flex flex-col gap-2">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny data-URL thumbnail */}
              {d.thumb ? <img src={d.thumb} alt="" className="w-12 h-12 object-cover rounded-lg border border-[rgba(59,47,40,.2)]" /> : <div className="w-12 h-12 rounded-lg bg-paper-2 border border-[rgba(59,47,40,.2)] grid place-items-center text-xs text-text-muted">{d.kind === "pdf" ? "PDF" : "TXT"}</div>}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{d.name}</div>
                <div className="text-xs text-text-muted">{new Date(d.addedAt).toLocaleDateString()} · {d.extracted ? `${d.extracted.classes.length} classes, ${d.extracted.tasks.length} tasks` : "waiting for Claude\u2019s reply"}</div>
              </div>
              {d.extracted && <button type="button" className="chip !py-1 text-xs" onClick={() => setReview({ title: `From ${d.name}`, found: fromExtraction(d.extracted!, classes) })}>Import again</button>}
              <button type="button" className="text-text-muted text-xs" aria-label="Delete document" onClick={() => { if (confirm("Remove this document from the app?")) actions.deleteDocument(d.id); }}>✕</button>
            </li>
          ))}
        </ul>
      </div>
      {review && <ImportReview found={review.found} existing={classes} title={review.title} onClose={() => setReview(null)} />}
    </div>
  );
}
