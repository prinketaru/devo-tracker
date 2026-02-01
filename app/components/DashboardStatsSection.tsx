"use client";

import { DevotionCalendar } from "./DevotionCalendar";
import { DevotionInsights } from "./DevotionInsights";

type WeeklyStat = { label: string; value: string };

type DashboardStatsSectionProps = {
  timezone: string;
  weeklyStats: WeeklyStat[];
};

export function DashboardStatsSection({ timezone, weeklyStats }: DashboardStatsSectionProps) {
  const now = new Date();

  return (
    <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 px-6 py-4 border-b border-stone-200 dark:border-zinc-800">
        Stats &amp; Calendar
      </h2>
      <div className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">
              Weekly Stats
            </h3>
            <div className="space-y-3">
              {weeklyStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                >
                  <span className="text-stone-600 dark:text-stone-300">{stat.label}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">
              Calendar
            </h3>
            <DevotionCalendar
              timezone={timezone}
              year={now.getFullYear()}
              month={now.getMonth() + 1}
            />
          </div>

          <DevotionInsights />
      </div>
    </section>
  );
}
