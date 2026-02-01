"use client";

import { useEffect, useState } from "react";

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
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <p className="text-sm text-stone-600 dark:text-stone-400">Loading…</p>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <p className="text-sm text-stone-600 dark:text-stone-400">Could not load devotion status.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-16 px-6">
      <div className="max-w-md mx-auto rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          {status.partnerName}&apos;s devotion status
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          You&apos;re their accountability partner. Check in on their devotion habit.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Completed today
            </p>
            <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {status.completedToday ? "Yes ✓" : "Not yet"}
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Current streak
            </p>
            <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {status.streak} days
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {status.streakMessage}
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-stone-500 dark:text-stone-400">
          No devotion content is shared. This link shows only whether they completed today and their streak.
        </p>
      </div>
    </main>
  );
}
