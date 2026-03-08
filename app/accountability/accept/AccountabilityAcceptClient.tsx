"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = {
  partnerName: string;
  streak: number;
  streakMessage: string;
  completedToday: boolean;
  onGracePeriod?: boolean;
};

export function AccountabilityAcceptClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/accountability/status?token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Status | null) => setStatus(data ?? null))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F9F8F5] dark:bg-[#171510] flex items-center justify-center p-6">
        <p className="text-sm text-stone-500 dark:text-[#7e7b72]">Loading…</p>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="min-h-screen bg-[#F9F8F5] dark:bg-[#171510] flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-8 text-center shadow-sm">
          <p className="text-sm text-stone-500 dark:text-[#7e7b72]">Could not load devotion status.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
          >
            ← Back to DayMark
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F8F5] dark:bg-[#171510] py-16 px-6">
      <div className="max-w-md mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="text-xs font-medium text-stone-500 dark:text-[#7e7b72] hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          ← Back to DayMark
        </Link>

        {/* Card */}
        <div className="mt-4 rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-8 shadow-sm">

          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-400/15 text-lg">
              🤝
            </span>
            <div>
              <h1 className="text-lg font-semibold text-stone-900 dark:text-[#EDE9E0]">
                {status.partnerName}&apos;s devotion status
              </h1>
              <p className="text-xs text-stone-500 dark:text-[#7e7b72]">
                You&apos;re their accountability partner
              </p>
            </div>
          </div>

          <div className="mt-5 h-px bg-linear-to-r from-amber-400/60 via-amber-200/30 to-transparent dark:from-amber-500/40 dark:via-amber-400/10" />

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">

            {/* Completed today */}
            <div className="rounded-xl border border-stone-200 dark:border-[#2a2720] bg-[#F9F8F5] dark:bg-[#171510] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-[#7e7b72]">
                Completed today
              </p>
              <p className={`mt-2 text-2xl font-bold ${
                status.completedToday
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-stone-900 dark:text-[#EDE9E0]"
              }`}>
                {status.completedToday ? "Yes ✓" : "Not yet"}
              </p>
            </div>

            {/* Streak */}
            <div className="rounded-xl border border-stone-200 dark:border-[#2a2720] bg-[#F9F8F5] dark:bg-[#171510] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-[#7e7b72]">
                Current streak
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {status.streak} <span className="text-base font-medium text-stone-500 dark:text-[#7e7b72]">days</span>
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-[#7e7b72]">
                {status.streakMessage}
              </p>
            </div>
          </div>

          {/* Privacy note */}
          <p className="mt-6 text-xs text-stone-400 dark:text-[#7e7b72] leading-relaxed">
            No devotion content is shared. This link shows only whether they completed today and their streak.
          </p>
        </div>
      </div>
    </main>
  );
}
