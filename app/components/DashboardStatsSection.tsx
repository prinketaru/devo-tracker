"use client";

import { DevotionCalendar } from "./DevotionCalendar";
import { DevotionInsights } from "./DevotionInsights";
import { BarChart2 } from "lucide-react";

type WeeklyStat = { label: string; value: string };

type DashboardStatsSectionProps = {
  timezone: string;
  weeklyStats: WeeklyStat[];
};

export function DashboardStatsSection({ timezone, weeklyStats }: DashboardStatsSectionProps) {
  const now = new Date();

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-200 dark:border-[#2a2720]">
        <BarChart2 className="w-4 h-4 text-stone-500 dark:text-[#7e7b72]" />
        <h2 className="text-base font-semibold text-stone-900 dark:text-[#d6d3c8]">Stats &amp; Calendar</h2>
      </div>

      {/* Content: two-col on md+ */}
      <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-[#2a2720]">

        {/* Weekly Stats */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-[#7e7b72]">
            Weekly Stats
          </p>
          {weeklyStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-3 py-2.5 text-sm"
            >
              <span className="text-stone-600 dark:text-[#b8b5ac]">{stat.label}</span>
              <span className="font-semibold text-stone-900 dark:text-[#d6d3c8]">{stat.value}</span>
            </div>
          ))}

          {/* Insights sits below weekly stats in the left column */}
          <div className="pt-2">
            <DevotionInsights />
          </div>
        </div>

        {/* Calendar */}
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-[#7e7b72] mb-3">
            Calendar
          </p>
          <DevotionCalendar
            timezone={timezone}
            year={now.getFullYear()}
            month={now.getMonth() + 1}
          />
        </div>
      </div>
    </div>
  );
}
