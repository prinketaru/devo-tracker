import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

const weeklyStats = [
  { label: "Days completed", value: "4 / 7" },
  { label: "Avg. time", value: "12 min" },
];

const streak = {
  days: 3,
  best: 7,
  message: "Keep going — you're building consistency.",
};

const devotionHistory = [
  {
    id: "dev-1",
    date: "Jan 28, 2026",
    title: "Steadfast in the morning",
    verse: "Psalm 5:3",
    summary:
      "Focused on starting the day with prayer and letting God set the tone.",
  },
  {
    id: "dev-2",
    date: "Jan 27, 2026",
    title: "Walking in wisdom",
    verse: "James 1:5",
    summary: "Asked for wisdom in a tough conversation at work.",
  },
  {
    id: "dev-3",
    date: "Jan 26, 2026",
    title: "Peace over worry",
    verse: "Philippians 4:6-7",
    summary: "Practiced releasing anxiety through prayer and gratitude.",
  },
];

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 dark:bg-zinc-950">
      <Header />
      <div className="mx-auto flex-1 w-full max-w-5xl px-6 py-12 xl:max-w-6xl xl:px-8 2xl:max-w-7xl 2xl:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900 xl:text-4xl 2xl:text-5xl dark:text-stone-50">
              Your Devotion Dashboard
            </h1>
            <p className="text-sm text-stone-600 xl:text-base 2xl:text-lg dark:text-stone-300">
              Track daily devotion moments and stay consistent.
            </p>
          </div>
          <Link
            href="/devotions/new"
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Start Today&apos;s Devotion
          </Link>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 xl:text-xl 2xl:text-2xl dark:text-stone-100">
                Recent Devotions
              </h2>
              <button
                type="button"
                className="text-sm text-amber-700 xl:text-base dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              >
                View all
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {devotionHistory.map((devotion) => (
                <article
                  key={devotion.id}
                  className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                      {devotion.date}
                    </p>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                      {devotion.verse}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-50">
                    {devotion.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                    {devotion.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-amber-200 dark:border-amber-400/30 bg-amber-50/70 dark:bg-amber-400/10 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">
                    Current Streak
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-stone-900 dark:text-stone-50">
                      {streak.days}
                    </span>
                    <span className="text-sm text-stone-600 dark:text-stone-300">
                      days
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                    {streak.message}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 dark:border-amber-400/30 bg-white/70 dark:bg-zinc-900/60 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                    Best
                  </p>
                  <p className="mt-1 text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {streak.best} days
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 xl:text-xl 2xl:text-2xl dark:text-stone-100">
                Weekly Stats
              </h2>
              <div className="mt-4 space-y-3">
                {weeklyStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                  >
                    <span className="text-stone-600 dark:text-stone-300">
                      {stat.label}
                    </span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

      </div>
      <Footer />
    </main>
  );
}

