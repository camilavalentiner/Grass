"use client";
import { Scene } from "@/components/illustrations/Scene";
import { Stars } from "@/components/Stars";

const swatches = [
  ["Paper", "var(--paper)"], ["Baby blue", "var(--blue)"], ["Baby pink", "var(--pink)"], ["Soft green", "var(--green)"], ["Soft yellow", "var(--yellow)"],
  ["Text green", "var(--text)"], ["Text blue", "var(--text-blue)"], ["Ink", "var(--ink)"],
];
const demand = ["--demand-0", "--demand-1", "--demand-2", "--demand-3", "--demand-4", "--demand-5"];

export default function StyleBoard() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-6">
      <section className="card p-6">
        <p className="eyebrow">Style board · 1 of 5</p>
        <h1 className="text-4xl font-semibold text-text-blue mt-1">Grass</h1>
        <p className="mt-2 text-text-muted italic">A gentle place to use your time well.</p>
        <div className="mt-5 grid grid-cols-4 sm:grid-cols-8 gap-3">
          {swatches.map(([n, v]) => (
            <div key={n} className="text-center">
              <div className="h-12 rounded-xl border border-[rgba(59,47,40,.2)]" style={{ background: v }} />
              <div className="text-[11px] mt-1 text-text-muted">{n}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <p className="eyebrow mb-2">Calendar demand · light → heavy</p>
          <div className="flex gap-3">
            {demand.map((d) => <span key={d} className="w-7 h-7 rounded-full border border-[rgba(59,47,40,.2)]" style={{ background: `var(${d})` }} />)}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <p className="eyebrow">Typography · Lora</p>
        <h2 className="text-3xl font-semibold text-text-blue mt-2">Start the lab report right now</h2>
        <p className="text-lg text-text mt-1">and finish 62% of your tasks by 10:32 pm.</p>
        <p className="text-sm text-text-muted mt-2 italic">Body text sits in deep leaf green; headings in slate blue. Never black.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn">Plan my session</button>
          <button className="btn btn-blue">Connect Canvas</button>
          <button className="btn btn-pink">Take a 5-minute break</button>
          <button className="btn btn-green">Done for today</button>
        </div>
        <div className="mt-4"><Stars value={4} /></div>
      </section>

      <section className="card p-6">
        <p className="eyebrow mb-3">Illustrations · the mood follows the workload</p>
        <div className="grid sm:grid-cols-3 gap-6 items-end">
          <figure><Scene kind="relaxed" /><figcaption className="text-xs text-center text-text-muted mt-2">Little left to do</figcaption></figure>
          <figure><Scene kind="reading-books" /><figcaption className="text-xs text-center text-text-muted mt-2">A fair amount left · odd days</figcaption></figure>
          <figure><Scene kind="reading-chair" /><figcaption className="text-xs text-center text-text-muted mt-2">A fair amount left · even days</figcaption></figure>
          <figure><Scene kind="overwhelmed" /><figcaption className="text-xs text-center text-text-muted mt-2">A lot left</figcaption></figure>
          <figure><Scene kind="celebrate" /><figcaption className="text-xs text-center text-text-muted mt-2">Session finished</figcaption></figure>
        </div>
      </section>
      <section className="p-2">
        <p className="eyebrow mb-3 text-text">On the grass, without a card</p>
        <div className="grid grid-cols-2 gap-6"><Scene kind="relaxed" /><Scene kind="overwhelmed" /></div>
      </section>
    </main>
  );
}
