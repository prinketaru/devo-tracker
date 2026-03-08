import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/lib/auth-server";
import { getDashboardData } from "@/app/lib/dashboard-stats";
import { getDb } from "@/app/lib/mongodb";
import { Footer } from "@/app/components/Footer";
import { DashboardDevotionRow } from "@/app/components/DashboardDevotionRow";
import { MarkCompleteButton } from "@/app/components/MarkCompleteButton";
import { PrayerSection } from "@/app/components/PrayerSection";
import { UserPreferencesInit } from "@/app/components/UserPreferencesInit";
import { VerseOfTheDay } from "@/app/components/VerseOfTheDay";
import { DashboardStatsSection } from "@/app/components/DashboardStatsSection";
import { ReminderBanner } from "@/app/components/ReminderBanner";
import { OnboardingWrapper } from "@/app/components/OnboardingWrapper";
import { AnnouncementBanner } from "@/app/components/AnnouncementBanner";
import { getAnnouncements } from "@/app/lib/announcements";
import { Flame, BookOpen, Heart, TrendingUp } from "lucide-react";

const PREFERENCES_COLLECTION = "user_preferences";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's timezone, reminders, and onboarding status
  const db = await getDb();
  const prefsColl = db.collection(PREFERENCES_COLLECTION);
  const prefsDoc = await prefsColl.findOne({ userId: session.user.id });
  const timezone = prefsDoc?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const reminders = Array.isArray(prefsDoc?.reminders) ? prefsDoc.reminders : [];
  const hasReminders = reminders.length > 0;
  const showOnboarding = !prefsDoc?.onboardingCompleted;

  const { devotions, weeklyStats, streak, todayDevotionId, totalDevotions, activePrayers, answeredPrayers, thisWeekCount } = await getDashboardData(session.user.id, timezone);

  // Derive greeting from server time in user's timezone
  const hourInTz = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
  const greeting =
    hourInTz < 12 ? "Good morning" : hourInTz < 17 ? "Good afternoon" : "Good evening";
  const firstName = (session.user.name ?? "").split(" ")[0] || "friend";

  const devotionHistory = devotions;
  const announcements = await getAnnouncements();
  const latestAnnouncement = announcements[0];

  return (
    <main className="min-h-screen bg-background">
      <OnboardingWrapper showOnboarding={showOnboarding} />
      <UserPreferencesInit />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {latestAnnouncement && (
          <div className="mb-6">
            <AnnouncementBanner announcement={latestAnnouncement} />
          </div>
        )}

        {/* Hero header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900 dark:text-[#d6d3c8]">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-[#7e7b72]">
              {todayDevotionId
                ? "Today's devotion is done ✓"
                : "You haven't completed today's devotion yet."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <MarkCompleteButton timezone={timezone} todayDevotionId={todayDevotionId} />
            <Link
              href="/devotions/new"
              className="inline-flex items-center justify-center rounded-md bg-[#f0a531] px-4 py-2 text-sm font-medium text-stone-900 hover:bg-[#c0831a] transition-colors"
            >
              + Log Devotion
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Streak */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/40 dark:border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-orange-400/10 to-amber-50 dark:to-[#1e1c18] p-5 shadow-md flex flex-col gap-3">
            {/* Decorative geometric shape */}
            <div className="animate-streak-drift pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-2xl bg-amber-400/20 dark:bg-amber-500/15" />
            <div className="animate-streak-pulse pointer-events-none absolute -right-2 -top-2 h-14 w-14 rounded-xl bg-amber-400/25 dark:bg-amber-500/20" />
            <Flame className="relative w-6 h-6 text-[#f0a531]" />
            <div className="relative">
              <p className="text-4xl font-bold text-[#f0a531]">
                {streak.onGracePeriod ? streak.graceStreakDays : streak.days}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-600 dark:text-[#b8b5ac]">
                Day Streak
              </p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-[#7e7b72]">
                Best: {streak.best} days
              </p>
            </div>
          </div>

          {/* Total Devotions */}
          <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-5 shadow-sm flex flex-col gap-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <div>
              <p className="text-4xl font-bold text-stone-900 dark:text-[#d6d3c8]">
                {totalDevotions}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-600 dark:text-[#b8b5ac]">
                Total Devotions
              </p>
              {thisWeekCount > 0 && (
                <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">
                  ↑ {thisWeekCount} this week
                </p>
              )}
            </div>
          </div>

          {/* Active Prayers */}
          <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-5 shadow-sm flex flex-col gap-3">
            <Heart className="w-6 h-6 text-pink-400" />
            <div>
              <p className="text-4xl font-bold text-stone-900 dark:text-[#d6d3c8]">
                {activePrayers}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-600 dark:text-[#b8b5ac]">
                Active Prayers
              </p>
              {answeredPrayers > 0 && (
                <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">
                  {answeredPrayers} answered ✓
                </p>
              )}
            </div>
          </div>

          {/* This Week */}
          <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-5 shadow-sm flex flex-col gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-4xl font-bold text-stone-900 dark:text-[#d6d3c8]">
                {thisWeekCount}
                <span className="text-xl font-semibold text-stone-500 dark:text-[#7e7b72]">/7</span>
              </p>
              <p className="mt-1 text-sm font-medium text-stone-600 dark:text-[#b8b5ac]">
                This Week
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-stone-200 dark:bg-[#2a2720] overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.round((thisWeekCount / 7) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verse of the Day */}
        <div className="mt-8">
          <VerseOfTheDay />
        </div>

        {!hasReminders && <ReminderBanner />}

        {/* Recent Devotions + Prayer */}
        <section className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* Minimal devotion list */}
          <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-[#2a2720]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h2 className="text-base font-semibold text-stone-900 dark:text-[#d6d3c8]">Recent Notes</h2>
              </div>
              <Link
                href="/devotions/new"
                className="flex items-center justify-center w-6 h-6 text-stone-500 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-[#d6d3c8] transition-colors"
                aria-label="New devotion"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </Link>
            </div>

            {/* Rows */}
            {devotionHistory.length > 0 ? (
              <div className="divide-y divide-stone-200 dark:divide-[#2a2720]">
                {devotionHistory.slice(0, 3).map((devotion) => (
                  <DashboardDevotionRow key={devotion.id} devotion={devotion} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-3">
                <p className="text-sm text-stone-500 dark:text-[#7e7b72]">No devotions yet</p>
                <Link
                  href="/devotions/new"
                  className="inline-flex items-center justify-center rounded-md bg-[#f0a531] px-4 py-2 text-sm font-medium text-stone-900 hover:bg-[#c0831a] transition-colors"
                >
                  Create your first devotion
                </Link>
              </div>
            )}

            {/* Footer */}
            {devotionHistory.length > 0 && (
              <div className="px-5 py-3 border-t border-stone-200 dark:border-[#2a2720] mt-auto">
                <Link
                  href="/devotions"
                  className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  View all notes →
                </Link>
              </div>
            )}
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

