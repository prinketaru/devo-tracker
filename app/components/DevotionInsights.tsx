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
        const normalized = {
          ...data,
          topBooks: Array.isArray(data.topBooks) ? data.topBooks : [],
        };
        setInsights(normalized);
      })
      .catch(() => setInsights(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm animate-pulse">
        <div className="h-5 w-40 rounded bg-stone-200 dark:bg-zinc-800" />
        <div className="mt-4 space-y-3">
          <div className="h-10 rounded-lg bg-stone-200 dark:bg-zinc-800" />
          <div className="h-10 rounded-lg bg-stone-200 dark:bg-zinc-800" />
          <div className="h-10 rounded-lg bg-stone-200 dark:bg-zinc-800" />
        </div>
      </section>
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
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    stats.push({ label: "Total time in devotions", value: timeStr });
  }

  return (
    <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        Devotion insights
      </h2>
      <div className="mt-4 space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          >
            <span className="text-stone-600 dark:text-stone-300">{stat.label}</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{stat.value}</span>
          </div>
        ))}
        {insights.topBooks && insights.topBooks.length > 0 && (
          <div className="pt-2 border-t border-stone-200 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Top books
            </p>
            <ul className="space-y-1">
              {insights.topBooks.map((p) => (
                <li key={p.book} className="flex justify-between text-sm">
                  <span className="text-stone-700 dark:text-stone-200 truncate max-w-[180px]">{p.book}</span>
                  <span className="text-stone-500 dark:text-stone-400 shrink-0">{p.count}x</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
