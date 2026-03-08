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
  /** If true, the month/year label above the grid is hidden (useful when parent renders navigation). */
  hideLabel?: boolean;
};

export function DevotionCalendar({
  timezone,
  year,
  month,
  onDateClick,
  filterFrom,
  filterTo,
  hideLabel = false,
}: DevotionCalendarProps) {
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/devotions/dates?from=${from}&to=${to}&timezone=${encodeURIComponent(timezone)}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { dates: [] }))
      .then((data: { dates?: string[] }) => setDates(new Set(data.dates ?? [])))
      .catch(() => { })
      .then(() => setLoading(false));
  }, [from, to, timezone]);

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthLabel = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

  const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="w-full">
      {!hideLabel && (
        <p className="text-xs font-medium text-stone-500 dark:text-[#7e7b72] mb-3">{monthLabel}</p>
      )}
      {loading ? (
        <div className="grid grid-cols-7 gap-1 text-center text-xs animate-pulse">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={i} className="font-medium text-stone-400/70 dark:text-stone-500/70 py-1">
              {d}
            </div>
          ))}
          {Array.from({ length: blanks.length + days.length }, (_, i) => (
            <div key={`s-${i}`} className="h-7 rounded bg-stone-100 dark:bg-[#252320]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-y-0.5 gap-x-0.5 text-center text-xs">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={i} className="font-medium text-stone-400 dark:text-[#7e7b72] py-1 text-[10px] uppercase tracking-wide">
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
            const baseClass = [
              "py-1.5 rounded-md transition-colors select-none",
              hasDevotion
                ? "bg-amber-400/20 text-amber-800 dark:text-amber-200 font-semibold"
                : "text-stone-600 dark:text-[#7e7b72]",
              inFilterRange ? "ring-1 ring-inset ring-blue-400/60 dark:ring-blue-400/50" : "",
              onDateClick ? "cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-700/50" : "",
            ].join(" ");
            if (onDateClick) {
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDateClick(dateStr)}
                  className={baseClass}
                >
                  {d}
                </button>
              );
            }
            return (
              <div key={d} className={baseClass}>
                {d}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
