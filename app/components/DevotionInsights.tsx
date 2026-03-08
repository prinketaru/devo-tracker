"use client";

import { useState, useEffect } from "react";

type Insights = {
  mostActiveHour: string | null;
  totalDevotions: number;
  totalMinutes: number | null;
  topBooks?: { book: string; count: number }[];
};

export function DevotionInsights() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/insights", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Insights | null) => {
        if (!data) return setInsights(null);
        setInsights({ ...data, topBooks: Array.isArray(data.topBooks) ? data.topBooks : [] });
      })
      .catch(() => setInsights(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 w-32 rounded bg-stone-200 dark:bg-[#2a2720]" />
        <div className="h-9 rounded-xl bg-stone-200 dark:bg-[#2a2720]" />
        <div className="h-9 rounded-xl bg-stone-200 dark:bg-[#2a2720]" />
      </div>
    );
  }

  if (!insights || insights.totalDevotions < 2) return null;

  const stats: { label: string; value: string }[] = [];
  if (insights.mostActiveHour) {
    stats.push({ label: "Most active time", value: insights.mostActiveHour });
  }
  if (insights.totalMinutes != null && insights.totalMinutes > 0) {
    const hours = Math.floor(insights.totalMinutes / 60);
    const mins = insights.totalMinutes % 60;
    stats.push({ label: "Total time", value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m` });
  }

  if (stats.length === 0 && (!insights.topBooks || insights.topBooks.length === 0)) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-[#7e7b72]">
        Insights
      </p>

      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-3 py-2.5 text-sm"
        >
          <span className="text-stone-600 dark:text-[#b8b5ac]">{stat.label}</span>
          <span className="font-semibold text-stone-900 dark:text-[#d6d3c8]">{stat.value}</span>
        </div>
      ))}

      {insights.topBooks && insights.topBooks.length > 0 && (
        <div className="rounded-xl border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-[#7e7b72] mb-2">
            Top books
          </p>
          <ul className="space-y-1.5">
            {insights.topBooks.map((p) => (
              <li key={p.book} className="flex justify-between text-sm">
                <span className="text-stone-700 dark:text-[#c8c4ba] truncate max-w-[180px]">{p.book}</span>
                <span className="text-stone-400 dark:text-[#7e7b72] shrink-0">{p.count}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
