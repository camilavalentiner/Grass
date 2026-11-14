"use client";
import { useCallback, useMemo, useState } from "react";
import { MoodScene } from "@/components/illustrations/Scene";
import { MiniCalendar } from "@/components/MiniCalendar";
import { DayPeek } from "@/components/DayPeek";
import { Stars } from "@/components/Stars";
import { TaskRow } from "@/components/TaskRow";
import { TaskSheet } from "@/components/TaskSheet";
import { SettingsSheet } from "@/components/SettingsSheet";
import { PlanPicker } from "@/components/PlanPicker";
import { SessionSetup } from "@/components/SessionSetup";
import { SessionTimer } from "@/components/SessionTimer";
import { Celebration } from "@/components/Celebration";
import { actions, useAppState } from "@/lib/store";
import { buildPlans, type Plan } from "@/lib/plans";
import { difficultyFactor, effortLeft, finishByPhrase, greeting, sortTasks, windowFor, type SortMode } from "@/lib/engine";
import { useNow } from "@/lib/useNow";
import type { Task } from "@/lib/types";

type Filter = "all" | "mandatory" | "optional";

export default function Home() {
  const state = useAppState();
  const now = useNow(15_000);
  const [sort, setSort] = useState<SortMode>("priority");
  const [filter, setFilter] = useState<Filter>("all");
  const [showDone, setShowDone] = useState(false);
  const [editing, setEditing] = useState<Task | "new" | null>(null);
  const [settings, setSettings] = useState(false);
  const [day, setDay] = useState<Date | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [finished, setFinished] = useState<{ workMin: number; early: boolean } | null>(null);

  const classes = useMemo(() => state?.classes ?? [], [state]);
  const tasks = useMemo(() => state?.tasks ?? [], [state]);
  const byId = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const onFinish = useCallback((workMin: number, early: boolean) => setFinished({ workMin, early }), []);

  if (!state || !now) return <main className="mx-auto w-full max-w-md px-4 py-6" />;

  // drive: a rating from today counts; older ones are forgotten
  const driveStars = stars ?? (state.drive && new Date(state.drive.at).toDateString() === now.toDateString() ? state.drive.stars : 0);
  const totalEffort = tasks.reduce((s, t) => s + t.estimateMin * difficultyFactor(t.difficulty), 0);
  const leftEffort = tasks.reduce((s, t) => s + t.estimateMin * difficultyFactor(t.difficulty) * effortLeft(t.progress, t.difficulty), 0);
  const load = totalEffort ? leftEffort / totalEffort : 0;
  const phrase = finishByPhrase(tasks, classes, { now, stars: driveStars });
  const win = windowFor(now.getHours());
  const timeStr = phrase.at.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const visible = sortTasks(tasks.filter((t) => (filter === "all" || t.kind === filter) && (showDone || t.progress < 100)), classes, sort, now);
  const doneCount = tasks.filter((t) => t.progress >= 100).length;
  const plans = driveStars ? buildPlans(tasks, classes, driveStars, now) : [];

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-5">
      {/* 1 · illustration + phrase */}
      <section className="card p-5 pt-4 text-center">
        <div className="flex items-center justify-between">
          <span className="w-8" />
          <p className="eyebrow">{greeting(now.getHours())}, {state.name}</p>
          <button type="button" aria-label="Settings" onClick={() => setSettings(true)} className="w-8 h-8 rounded-full hover:bg-paper-2 text-text-muted grid place-items-center">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
          </button>
        </div>
        <MoodScene load={load} day={now} className="w-full max-w-[340px] mx-auto my-2" />
        {phrase.task ? (
          <p className="text-[17px] leading-snug text-text-blue">
            Start <span className="font-semibold">{phrase.task.title}</span> right now and {phrase.finishesTask ? "finish" : "reach"}{" "}
            <span className="font-semibold">{phrase.percent}%</span> of your tasks by <span className="font-semibold">{timeStr}</span>.
          </p>
        ) : (
          <p className="text-[17px] leading-snug text-text-blue">Everything is done. Go and lie in the grass.</p>
        )}
        <p className="mt-2 text-xs text-text-muted">
          {win === "analytical" && "A sharp hour. Good for the heavy, exact work."}
          {win === "reset" && "A soft hour. Keep it light and let your energy come back."}
          {win === "creative" && "A creative hour. Good for shaping, designing, and finishing touches."}
        </p>
      </section>

      {/* 2 · calendar */}
      <section className="card p-5">
        <MiniCalendar tasks={tasks} today={now} selected={day} onSelect={(d) => setDay(day && d.toDateString() === day.toDateString() ? null : d)} />
        {day && <DayPeek day={day} tasks={tasks} classes={classes} />}
      </section>

      {/* 3 · tasks */}
      <section className="card p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-text-blue">Things to do</h3>
          <div className="flex items-center gap-1.5">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="text-xs rounded-full border border-[rgba(59,47,40,.25)] bg-paper-2 px-2.5 py-1 text-text" aria-label="Sort tasks">
              <option value="priority">by priority</option>
              <option value="due">by due date</option>
              <option value="estimate">by time left</option>
              <option value="kind">mandated first</option>
            </select>
            <button type="button" className="btn !py-1 !px-3 text-sm" onClick={() => setEditing("new")} aria-label="Add task">+ Add</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1 text-xs">
          {(["all", "mandatory", "optional"] as Filter[]).map((f) => (
            <button key={f} type="button" className={`chip !py-1 ${filter === f ? "chip-on" : ""}`} onClick={() => setFilter(f)}>{f === "all" ? "All" : f === "mandatory" ? "Mandated" : "Optional"}</button>
          ))}
          {doneCount > 0 && <button type="button" className={`chip !py-1 ml-auto ${showDone ? "chip-on" : ""}`} onClick={() => setShowDone((v) => !v)}>{showDone ? "Hide" : "Show"} done · {doneCount}</button>}
        </div>
        {visible.length ? (
          <ul>
            {visible.map((t) => (
              <TaskRow key={t.id} task={t} cls={byId.get(t.classId)} now={now} onToggle={() => actions.toggleDone(t.id)} onOpen={() => setEditing(t)} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted py-4 text-center">Nothing here. Add a task or change the filter.</p>
        )}
      </section>

      {/* 4 · drive */}
      <section className="card p-5 text-center">
        <h3 className="text-lg font-semibold text-text-blue">How driven do you feel?</h3>
        <p className="text-xs text-text-muted mb-3">Five stars means ready for anything. Your plan follows the stars and the hour.</p>
        <Stars value={driveStars} onChange={(v) => { setStars(v); actions.setDrive(v); }} size={34} />
        {driveStars > 0 && (
          <div className="mt-4">
            <p className="eyebrow mb-2 text-left">Pick a session</p>
            <PlanPicker plans={plans} tasks={tasks} onPick={setPlan} />
          </div>
        )}
      </section>

      {/* overlays */}
      {editing && <TaskSheet task={editing} classes={classes} onClose={() => setEditing(null)} />}
      {settings && <SettingsSheet name={state.name} onClose={() => setSettings(false)} />}
      {plan && !state.active && <SessionSetup plan={plan} tasks={tasks} stars={driveStars} onClose={() => setPlan(null)} />}
      {state.active && !finished && <SessionTimer s={state.active} tasks={tasks} onFinish={onFinish} />}
      {state.active && finished && <Celebration s={state.active} workMin={finished.workMin} early={finished.early} tasks={tasks} name={state.name} onDone={() => { setFinished(null); setPlan(null); }} />}
    </main>
  );
}
