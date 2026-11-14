"use client";
import { useMemo } from "react";
import { useAppState } from "@/lib/store";
import { useNow } from "@/lib/useNow";
import { classShape, dailySeries, hourlyYield, totals, yieldByStars } from "@/lib/stats";
import { ChartCard, MARK, WINDOW_COLOR, fmtH } from "@/components/charts/common";
import { Columns } from "@/components/charts/Columns";
import { StarsPath } from "@/components/charts/StarsPath";
import { Radar } from "@/components/charts/Radar";
import { Scene } from "@/components/illustrations/Scene";

function Tile({ label, value, sub, spark }: { label: string; value: string; sub?: string; spark?: number[] }) {
  const max = Math.max(1, ...(spark ?? []));
  return (
    <div className="card p-3.5">
      <div className="eyebrow !text-[10px]">{label}</div>
      <div className="text-2xl font-semibold text-text-blue mt-0.5 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
      {spark && (
        <svg viewBox={`0 0 ${spark.length * 6} 18`} className="w-full h-4 mt-1" aria-hidden>
          {spark.map((v, i) => <rect key={i} x={i * 6 + 1} y={18 - (v / max) * 16} width="4" height={(v / max) * 16} rx="1.5" fill="#4b8a36" opacity={v ? 1 : 0.15} />)}
        </svg>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const state = useAppState();
  const now = useNow(60_000);
  const sessions = useMemo(() => state?.sessions ?? [], [state]);
  const tasks = useMemo(() => state?.tasks ?? [], [state]);
  const classes = useMemo(() => state?.classes ?? [], [state]);
  if (!state || !now) return <main className="mx-auto w-full max-w-md px-4 py-6" />;

  const t = totals(sessions, tasks, now);
  const days = dailySeries(sessions, 14, now);
  const hours = hourlyYield(sessions);
  const stars = yieldByStars(sessions);
  const shapes = classShape(classes, tasks, now);
  const byId = new Map(tasks.map((x) => [x.id, x]));
  const delta = t.minutesThisWeek - t.minutesLastWeek;
  const bestHour = hours.filter((h) => h.minutes >= 30).sort((a, b) => b.perHour - a.perHour)[0];
  const bestStars = stars.filter((s) => s.sessions > 0).sort((a, b) => b.perHour - a.perHour)[0];
  const hourLabel = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? "am" : "pm"}`;
  const recent = [...sessions].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)).slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 pb-24 flex flex-col gap-4">
      <header className="card p-5">
        <p className="eyebrow">Progress</p>
        <h1 className="text-2xl font-semibold text-text-blue mt-1">How your time is going</h1>
        <p className="text-sm text-text-muted mt-1">
          {sessions.length === 0 && "Finish a study session and this page starts filling in."}
          {sessions.length > 0 && bestHour && `You get the most done starting around ${hourLabel(bestHour.hour)}`}
          {sessions.length > 0 && bestHour && bestStars && `, and your ${bestStars.stars}-star days are your best days.`}
        </p>
      </header>

      {sessions.length === 0 ? (
        <section className="card p-5 text-center">
          <Scene kind="relaxed" className="w-full max-w-[260px] mx-auto" />
          <p className="text-sm text-text-muted mt-2">Nothing to chart yet. Rate your drive on the Today page and start a session.</p>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Focus this week" value={fmtH(t.minutesThisWeek)} sub={delta === 0 ? "same as last week" : `${delta > 0 ? "+" : "−"}${fmtH(Math.abs(delta))} vs last week`} spark={days.map((d) => d.minutes)} />
            <Tile label="Sessions this week" value={String(t.sessionsThisWeek)} sub={t.finishedEarly ? `${t.finishedEarly} finished early` : "all finished in full"} />
            <Tile label="Streak" value={`${t.streak} day${t.streak === 1 ? "" : "s"}`} sub="with at least one session" />
            <Tile label="Tasks" value={`${t.tasksDone} done`} sub={`${t.tasksOpen} still open`} />
          </div>

          <ChartCard title="Focus over the last two weeks" sub="Minutes of focused work per day. Hover a column for the day's detail.">
            <Columns height={150} unit="" cols={days.map((d, i) => ({
              label: i % 2 === 0 ? d.day.toLocaleDateString(undefined, { day: "numeric" }) : "",
              value: d.minutes, color: "#4b8a36",
              title: d.day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
              lines: [`${fmtH(d.minutes)} of focus`, `${d.sessions} session${d.sessions === 1 ? "" : "s"}`, `${d.points} progress points`],
            }))} />
          </ChartCard>

          <ChartCard title="When you work best" sub="Progress points gained per focused hour, by the hour a session started. Bands are your productivity windows."
            legend={[{ color: WINDOW_COLOR.analytical, label: "Analytical 4am–12pm" }, { color: WINDOW_COLOR.reset, label: "Reset 12–6pm" }, { color: WINDOW_COLOR.creative, label: "Creative 6pm–4am" }]}>
            <Columns height={160} unit="" bands={[{ from: 0, to: 4, label: "night", color: WINDOW_COLOR.creative }, { from: 4, to: 12, label: "morning", color: WINDOW_COLOR.analytical }, { from: 12, to: 18, label: "afternoon", color: WINDOW_COLOR.reset }, { from: 18, to: 24, label: "evening", color: WINDOW_COLOR.creative }]}
              cols={hours.map((h) => ({
                label: "", value: Math.round(h.perHour), color: WINDOW_COLOR[h.window], faint: h.minutes < 30,
                title: `${hourLabel(h.hour)} starts`, lines: h.minutes ? [`${Math.round(h.perHour)} points per hour`, `${fmtH(h.minutes)} of focus in total`] : ["no sessions yet"],
              }))} />
          </ChartCard>

          <ChartCard title="Drive versus results" sub="How much progress each star rating really brings, per focused hour. Bigger dots are more sessions.">
            <StarsPath rows={stars} />
          </ChartCard>

          <ChartCard title="Your classes" sub="Standing is your grade over its target. Workload compares open effort between classes."
            legend={shapes.map((s) => ({ color: MARK[s.cls.color], label: s.cls.code ?? s.cls.name }))}>
            <Radar shapes={shapes} />
            <table className="w-full mt-3 text-xs">
              <thead><tr className="text-text-muted text-left"><th className="font-medium py-1">Class</th><th className="font-medium">Standing</th><th className="font-medium">Done</th><th className="font-medium">Workload</th><th className="font-medium">Urgency</th></tr></thead>
              <tbody>
                {shapes.map((s) => (
                  <tr key={s.cls.id} className="border-t border-dashed border-[rgba(59,47,40,.15)]">
                    <td className="py-1 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: MARK[s.cls.color] }} />{s.cls.code ?? s.cls.name}</td>
                    <td className="tabular-nums">{Math.round(s.standing * 100)}%</td><td className="tabular-nums">{Math.round(s.completion * 100)}%</td><td className="tabular-nums">{Math.round(s.workload * 100)}%</td><td className="tabular-nums">{Math.round(s.urgency * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ChartCard>

          <section className="card p-4">
            <h3 className="text-base font-semibold text-text-blue">Recent sessions</h3>
            <ul className="mt-2 flex flex-col">
              {recent.map((s) => (
                <li key={s.id} className="py-2 border-b border-dashed border-[rgba(59,47,40,.15)] last:border-0 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{s.planTitle} · {fmtH(s.workMin)}{s.finishedEarly ? " · early" : ""}</span>
                    <span className="text-xs text-text-muted whitespace-nowrap">{new Date(s.startedAt).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })} · {"★".repeat(s.stars)}</span>
                  </div>
                  <div className="text-xs text-text-muted">{s.items.map((it) => `${byId.get(it.taskId)?.title ?? "a task"} ${it.from}→${it.to}%`).join(" · ")}</div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
