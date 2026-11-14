"use client";
import { useRef, useState } from "react";
import type { ClassInfo, DocRecord, Extraction } from "@/lib/types";
import { actions, uid } from "@/lib/store";
import { fromExtraction } from "@/lib/importers";
import { ImportReview } from "./ImportReview";

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
        <p className="text-sm text-text-muted mt-1">Photos of a syllabus, a rubric table, an assignment page, a calendar screenshot, a PDF, or pasted text. The app reads it and proposes classes, rubrics and tasks for you to confirm.</p>
        <input ref={fileRef} type="file" multiple accept="image/*,application/pdf,.txt,.md,.csv" className="hidden" onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) extract(fs, text); e.target.value = ""; }} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-blue" onClick={() => fileRef.current?.click()} disabled={!!busy}>{busy ?? "Choose photos or files"}</button>
        </div>
        <textarea className="input mt-3 min-h-20" placeholder="…or paste text from an email, a syllabus or a Teams post" value={text} onChange={(e) => setText(e.target.value)} />
        {text.trim() && <button type="button" className="btn btn-green mt-2" onClick={() => extract([], text)} disabled={!!busy}>{busy ?? "Read pasted text"}</button>}
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
                <div className="text-xs text-text-muted">{new Date(d.addedAt).toLocaleDateString()} · {d.extracted ? `${d.extracted.classes.length} classes, ${d.extracted.tasks.length} tasks` : "not read yet"}</div>
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
