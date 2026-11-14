"use client";
import { useMemo, useState } from "react";
import { MoodScene } from "@/components/illustrations/Scenes";
import { MiniCalendar } from "@/components/MiniCalendar";
import { Stars } from "@/components/Stars";
import { TaskRow } from "@/components/TaskRow";
import { sampleClasses, sampleTasks } from "@/lib/sample";
import { finishByPhrase, greeting, remainingMin, sortTasks, windowFor, type SortMode } from "@/lib/engine";
import { useNow } from "@/lib/useNow";

export default function Home() {
  const [tasks, setTasks] = useState(sampleTasks);
  const [sort, setSort] = useState<SortMode>("priority");
  const [stars, setStars] = useState(0);
  const now = useNow();
  const classes = sampleClasses;
  const byId = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  if (!now) return <main className="mx-auto w-full max-w-md px-4 py-6" />;

  const total = tasks.reduce((s, t) => s + t.estimateMin, 0);
  const left = tasks.reduce((s, t) => s + remainingMin(t), 0);
  const load = total ? left / total : 0;
  const phrase = finishByPhrase(tasks, classes, { now, stars });
  const sorted = sortTasks(tasks, classes, sort, now);
  const win = windowFor(now.getHours());
  const timeStr = phrase.at.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const toggle = (id: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, progress: t.progress >= 100 ? 0 : 100 } : t)));

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-5">
      {/* 1 · illustration + phrase */}
      <section className="card p-5 pt-4 text-center">
        <p className="eyebrow">{greeting(now.getHours())}, Camila</p>
        <MoodScene load={load} className="w-full h-auto max-h-56 mx-auto my-1" />
        <p className="text-[17px] leading-snug text-text-blue">
          Start <span className="font-semibold">{phrase.task?.title}</span> right now and{" "}
          {phrase.finishesTask ? "finish" : "reach"}{" "}
          <span className="font-semibold">{phrase.percent}%</span> of your tasks by{" "}
          <span className="font-semibold">{timeStr}</span>.
        </p>
        <p className="mt-2 text-xs text-text-muted">
          {win === "analytical" && "A sharp hour. Good for the heavy, exact work."}
          {win === "reset" && "A soft hour. Keep it light and let your energy come back."}
          {win === "creative" && "A creative hour. Good for shaping, designing, and finishing touches."}
        </p>
      </section>

      {/* 2 · calendar */}
      <section className="card p-5">
        <MiniCalendar tasks={tasks} today={now} />
      </section>

      {/* 3 · tasks */}
      <section className="card p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-text-blue">Things to do</h3>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="text-xs rounded-full border border-[rgba(59,47,40,.25)] bg-paper-2 px-2.5 py-1 text-text"
          >
            <option value="priority">by priority</option>
            <option value="due">by due date</option>
            <option value="estimate">by time left</option>
            <option value="kind">mandatory first</option>
          </select>
        </div>
        <ul>
          {sorted.map((t) => (
            <TaskRow key={t.id} task={t} cls={byId.get(t.classId)} now={now} onToggle={() => toggle(t.id)} />
          ))}
        </ul>
      </section>

      {/* 4 · drive */}
      <section className="card p-5 text-center">
        <h3 className="text-lg font-semibold text-text-blue">How driven do you feel?</h3>
        <p className="text-xs text-text-muted mb-3">Five stars means ready for anything.</p>
        <Stars value={stars} onChange={setStars} size={34} />
        {stars > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <button className="btn btn-green justify-center">Plan my session</button>
          </div>
        )}
      </section>
    </main>
  );
}
