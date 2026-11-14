"use client";
import { useEffect, type ReactNode } from "react";

/** A bottom sheet on phones, a centred card on wider screens. */
export function Sheet({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[rgba(47,74,50,.35)]" />
      <div className={`sheet relative w-full ${wide ? "sm:max-w-lg" : "sm:max-w-md"} max-h-[92vh] overflow-y-auto card rounded-b-none sm:rounded-b-[var(--radius)] p-5 pb-7`}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[rgba(59,47,40,.18)] sm:hidden" />
        {title && <h3 className="text-xl font-semibold text-text-blue mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block mb-3">
      <span className="eyebrow block mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-text-muted mt-1">{hint}</span>}
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={`chip ${value === o.value ? "chip-on" : ""}`}>{o.label}</button>
      ))}
    </div>
  );
}
