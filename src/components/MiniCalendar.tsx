"use client";
import { dayDemand } from "@/lib/engine";
import type { Task } from "@/lib/types";

const demandColor = (d: number) => {
  const steps = ["--demand-0", "--demand-1", "--demand-2", "--demand-3", "--demand-4", "--demand-5"];
  return `var(${steps[Math.min(5, Math.round(d * 5))]})`;
};

export function MiniCalendar({ tasks, month, today = new Date() }: { tasks: Task[]; month?: Date; today?: Date }) {
  const m = month ?? today;
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const daysInMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthName = m.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-lg font-semibold text-text-blue">{monthName}</h3>
        <span className="text-xs text-text-muted">busy ↔ light</span>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] text-text-muted mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(m.getFullYear(), m.getMonth(), day);
          const isToday = date.toDateString() === today.toDateString();
          const demand = date >= new Date(today.toDateString()) ? dayDemand(date, tasks) : 0;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-0.5">
              <span className={`text-sm leading-none ${isToday ? "font-bold text-burgundy" : "text-text"}`}>{day}</span>
              <span
                className="block rounded-full"
                style={{ width: 8, height: 8, background: demand > 0.02 ? demandColor(demand) : "transparent", boxShadow: demand > 0.02 ? "0 0 0 1px rgba(59,47,40,.15)" : "none" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
