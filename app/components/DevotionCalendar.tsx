"use client";

import { useEffect, useState } from "react";

type DevotionCalendarProps = {
  timezone: string;
  year: number;
  month: number;
  /** When set, calendar days are clickable; receives YYYY-MM-DD. */
  onDateClick?: (date: string) => void;
  /** Optional filter range (YYYY-MM-DD); dates in range are highlighted as "shown". */
  filterFrom?: string;
  filterTo?: string;
};

export function DevotionCalendar({ timezone, year, month, onDateClick, filterFrom, filterTo }: DevotionCalendarProps) {
  const [dates, setDates] = useState<Set<string>>(new Set());

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);

  useEffect(() => {
    fetch(`/api/devotions/dates?from=${from}&to=${to}&timezone=${encodeURIComponent(timezone)}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { dates: [] }))
      .then((data: { dates?: string[] }) => setDates(new Set(data.dates ?? [])))
      .catch(() => {});
  }, [from, to, timezone]);

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthLabel = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium text-stone-500 dark:text-stone-400 py-1">
            {d}
          </div>
        ))}
        {blanks.map((i) => (
          <div key={`b-${i}`} className="py-2" />
        ))}
        {days.map((d) => {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const hasDevotion = dates.has(dateStr);
          const inFilterRange =
            (filterFrom && dateStr >= filterFrom && !filterTo) ||
            (filterTo && dateStr <= filterTo && !filterFrom) ||
            (filterFrom && filterTo && dateStr >= filterFrom && dateStr <= filterTo);
          const baseClass = `py-2 rounded ${hasDevotion ? "bg-amber-500/20 dark:bg-amber-400/20 text-amber-800 dark:text-amber-200 font-medium" : "text-stone-600 dark:text-stone-400"} ${inFilterRange ? "ring-2 ring-blue-500/70 dark:ring-blue-400/70" : ""}`;
          const clickableClass = onDateClick ? " cursor-pointer hover:ring-2 hover:ring-amber-500/50 dark:hover:ring-amber-400/50" : "";
          const content = <>{d}</>;
          if (onDateClick) {
            return (
              <button
                key={d}
                type="button"
                onClick={() => onDateClick(dateStr)}
                className={baseClass + clickableClass}
              >
                {content}
              </button>
            );
          }
          return (
            <div key={d} className={baseClass}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
