import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/lib/auth-server";
import { getDashboardData } from "@/app/lib/dashboard-stats";
import { getDb } from "@/app/lib/mongodb";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { DevotionCard } from "@/app/components/DevotionCard";
import { MarkCompleteButton } from "@/app/components/MarkCompleteButton";
import { PrayerSection } from "@/app/components/PrayerSection";
import { UserPreferencesInit } from "@/app/components/UserPreferencesInit";
import { VerseOfTheDay } from "@/app/components/VerseOfTheDay";
import { DashboardStatsSection } from "@/app/components/DashboardStatsSection";

const PREFERENCES_COLLECTION = "user_preferences";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's timezone and reminders
  const db = await getDb();
  const prefsColl = db.collection(PREFERENCES_COLLECTION);
  const prefsDoc = await prefsColl.findOne({ userId: session.user.id });
  const timezone = prefsDoc?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const reminders = Array.isArray(prefsDoc?.reminders) ? prefsDoc.reminders : [];
  const hasReminders = reminders.length > 0;

  const { devotions, weeklyStats, streak, todayDevotionId } = await getDashboardData(session.user.id, timezone);
  const devotionHistory = devotions;

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <UserPreferencesInit />
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Verse of the Day + Current Streak - side by side at top */}
        <div className="grid gap-6 sm:grid-cols-2">
          <VerseOfTheDay />
          <section className={`rounded-2xl border-2 p-6 shadow-lg ${streak.onGracePeriod ? "border-amber-500/60 dark:border-amber-400/50 bg-amber-100/60 dark:bg-amber-950/40" : "border-amber-300 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-400/10"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">
                Current Streak
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-stone-900 dark:text-stone-50">
                  {streak.onGracePeriod ? streak.graceStreakDays : streak.days}
                </span>
                <span className="text-sm text-stone-600 dark:text-stone-300">
                  days
                </span>
                {streak.onGracePeriod && (
                  <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                    Missed today
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm ${streak.onGracePeriod ? "font-medium text-amber-800 dark:text-amber-200" : "text-stone-600 dark:text-stone-300"}`}>
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
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-50">
              Your Devotion Dashboard
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Track daily devotion moments and stay consistent.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <MarkCompleteButton timezone={timezone} todayDevotionId={todayDevotionId} />
            <Link
              href="/devotions/new"
              className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              Start Today&apos;s Devotion
            </Link>
          </div>
        </div>

        {!hasReminders && (
          <Link
            href="/settings"
            className="mt-8 block rounded-2xl border border-amber-200 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 p-5 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Set up a devotion reminder
                </h2>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                  Get a notification at the times you choose so you never miss a devotion.
                </p>
              </div>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Add reminder →
              </span>
            </div>
          </Link>
        )}

        {/* Recent Devotions + Prayer */}
        <section className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Recent Devotions
              </h2>
              <Link
                href="/devotions"
                className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="mt-5">
              {devotionHistory.length > 0 ? (
                <div className="space-y-4">
                  {devotionHistory.slice(0, 3).map((devotion) => (
                    <DevotionCard key={devotion.id} devotion={devotion} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-300 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 px-6 py-12 text-center">
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                    No devotions yet
                  </p>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-500">
                    Start your journey by creating your first devotion.
                  </p>
                  <Link
                    href="/devotions/new"
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
                  >
                    Create your first devotion
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <PrayerSection />
          </div>
        </section>

        {/* Stats (Weekly Stats, Calendar, Insights) */}
        <div className="mt-6">
          <DashboardStatsSection timezone={timezone} weeklyStats={weeklyStats} />
        </div>

      </div>
      <Footer />
    </main>
  );
}

