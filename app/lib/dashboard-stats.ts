import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";
const PREFERENCES_COLLECTION = "user_preferences";

export type DevotionSummary = {
  id: string;
  date: string;
  title: string;
  passage: string;
  summary: string;
  minutesSpent?: number;
  category?: string;
};

export type DashboardData = {
  devotions: DevotionSummary[];
  weeklyStats: { label: string; value: string }[];
  streak: {
    days: number;
    best: number;
    message: string;
    onGracePeriod?: boolean;
    graceStreakDays?: number;
    graceTimeLeft?: string;
  };
  todayDevotionId?: string;
};

/** Summarize devotion content for list display (first ~120 chars). */
function summarize(content: string, maxLen = 120): string {
  const text = (content ?? "").trim().replace(/\s+/g, " ");
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + "…";
}

/** Grace period: allow 1 missed day without breaking the streak. Miss 2+ days and streak ends. */
const STREAK_GRACE_DAYS = 1;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

/** Compute consecutive-day streak and best streak. Uses user timezone. Ends streak if gap > 1 + grace. */
function computeStreak(
  dates: Date[],
  timezone: string
): { current: number; best: number; onGracePeriod: boolean; graceStreakDays: number; graceRemainingMs: number } {
  if (dates.length === 0) return { current: 0, best: 0, onGracePeriod: false, graceStreakDays: 0, graceRemainingMs: 0 };

  const uniqueDays = Array.from(
    new Set(dates.map((d) => toDateStringInTimezone(d, timezone)))
  ).sort()
    .reverse();

  const diffDaysBetween = (a: string, b: string): number => {
    const aDate = new Date(a + "T00:00:00Z");
    const bDate = new Date(b + "T00:00:00Z");
    return Math.round((aDate.getTime() - bDate.getTime()) / MS_PER_DAY);
  };

  const best = (() => {
    let run = 1;
    let bestRun = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const diffDays = diffDaysBetween(uniqueDays[i - 1], uniqueDays[i]);
      if (diffDays >= 1 && diffDays <= 1 + STREAK_GRACE_DAYS) run++;
      else run = 1;
      bestRun = Math.max(bestRun, run);
    }
    return bestRun;
  })();

  const currentRun = (() => {
    let run = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const diffDays = diffDaysBetween(uniqueDays[i - 1], uniqueDays[i]);
      if (diffDays >= 1 && diffDays <= 1 + STREAK_GRACE_DAYS) run++;
      else break;
    }
    return run;
  })();

  const todayStr = toDateStringInTimezone(new Date(), timezone);
  const mostRecentDay = uniqueDays[0];
  const daysSinceLast = diffDaysBetween(todayStr, mostRecentDay);

  const withinCurrentWindow = daysSinceLast <= 1;
  const withinGraceWindow = daysSinceLast === 2;

  const graceRemainingMs = (() => {
    if (!withinGraceWindow) return 0;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date());
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
    const second = parseInt(parts.find((p) => p.type === "second")?.value ?? "0", 10);
    const elapsedSeconds = hour * 3600 + minute * 60 + second;
    const remainingSeconds = Math.max(0, 24 * 3600 - elapsedSeconds);
    return remainingSeconds * 1000;
  })();

  const current = withinCurrentWindow ? currentRun : 0;
  const onGracePeriod = withinGraceWindow && currentRun > 0;
  const graceStreakDays = onGracePeriod ? currentRun : 0;

  return { current, best, onGracePeriod, graceStreakDays, graceRemainingMs };
}

/**
 * Convert a UTC date to a date string in the given timezone (YYYY-MM-DD format).
 */
function toDateStringInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Get the start date string (YYYY-MM-DD) of the current week (Sunday) in the given timezone.
 */
function getWeekStartDateString(timezone: string): string {
  const now = new Date();

  // Get current date components in the user's timezone
  const tzFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  const parts = tzFormatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "0", 10);
  const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "0", 10);
  const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";

  // Map weekday to number (0 = Sunday)
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[weekday] ?? 0;

  // Calculate days back to Sunday
  const daysToSunday = dayOfWeek;

  // Create Sunday date string directly (YYYY-MM-DD)
  const sundayDay = day - daysToSunday;
  // Handle month/year rollover by creating a date and formatting it
  const tempDate = new Date(year, month - 1, sundayDay);
  const sundayYear = tempDate.getFullYear();
  const sundayMonth = tempDate.getMonth() + 1;
  const sundayDayFinal = tempDate.getDate();

  return `${sundayYear}-${String(sundayMonth).padStart(2, "0")}-${String(sundayDayFinal).padStart(2, "0")}`;
}

/** Get grace period status for a user (for API/cron use). */
export async function getGraceStatus(
  userId: string,
  timezone: string
): Promise<{ onGracePeriod: boolean; graceStreakDays: number; streak: number }> {
  const db = await getDb();
  const docs = await db
    .collection(DEVOTIONS_COLLECTION)
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  const devotionDocs = docs.filter((d) => {
    const cat = (d as { category?: string }).category;
    return cat === "devotion" || !cat;
  });
  const allDates = devotionDocs.map((d) =>
    d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt)
  );
  const { current, onGracePeriod, graceStreakDays } = computeStreak(allDates, timezone);
  const streak = onGracePeriod ? graceStreakDays : current;
  return { onGracePeriod, graceStreakDays, streak };
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "0m";
  const totalMinutes = Math.ceil(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

/** Fetch dashboard data for a user: recent devotions, weekly stats, streak. */
export async function getDashboardData(userId: string, timezone?: string): Promise<DashboardData> {
  const db = await getDb();
  const devotionsColl = db.collection(DEVOTIONS_COLLECTION);

  const docs = await devotionsColl
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const devotions: DevotionSummary[] = docs.map((d) => {
    const createdAt = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
    return {
      id: d._id.toString(),
      date: createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      title: (d.title ?? "").trim() || "Untitled",
      passage: (d.passage ?? "").trim() || "—",
      summary: summarize(d.content ?? ""),
      category: typeof (d as any).category === "string" ? (d as any).category : "devotion",
      minutesSpent: (() => {
        const mins = (d as { minutesSpent?: unknown }).minutesSpent;
        return typeof mins === "number" ? mins : undefined;
      })(),
    };
  });

  const devotionDocs = docs.filter((d) => {
    const cat = (d as { category?: string }).category;
    return cat === "devotion" || !cat;
  });
  const allDates = devotionDocs.map((d) =>
    d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt)
  );

  const userTimezone = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const weekStartStr = getWeekStartDateString(userTimezone);

  // Calculate week end (next Sunday) - add 7 days to the start date string
  const [startYear, startMonth, startDay] = weekStartStr.split("-").map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  startDate.setDate(startDate.getDate() + 7);
  const weekEndStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;

  const uniqueDaysThisWeek = new Set<string>();
  devotionDocs.forEach((d) => {
    const createdAt = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
    const dateStr = toDateStringInTimezone(createdAt, userTimezone);
    if (dateStr >= weekStartStr && dateStr < weekEndStr) {
      uniqueDaysThisWeek.add(dateStr);
    }
  });

  const thisWeekCount = uniqueDaysThisWeek.size;
  const daysInWeek = 7;
  const thisWeekDocs = devotionDocs.filter((d) => {
    const dateStr = toDateStringInTimezone(d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt), userTimezone);
    return dateStr >= weekStartStr && dateStr < weekEndStr;
  });
  const minutesThisWeek = thisWeekDocs
    .map((d) => {
      const mins = (d as { minutesSpent?: unknown }).minutesSpent;
      return typeof mins === "number" ? mins : null;
    })
    .filter((m): m is number => m != null);
  const avgMinutes = minutesThisWeek.length > 0
    ? Math.round(minutesThisWeek.reduce((a, b) => a + b, 0) / minutesThisWeek.length)
    : null;
  const weeklyStats = [
    { label: "Days completed", value: `${thisWeekCount} / ${daysInWeek}` },
    { label: "Avg. time", value: avgMinutes != null ? `${avgMinutes} min` : "—" },
  ];

  const { current: streakDays, best: bestStreak, onGracePeriod, graceStreakDays, graceRemainingMs } = computeStreak(allDates, userTimezone);

  const streakMessages = [
    "Keep going — you're building consistency.",
    "You're on a roll!",
    "Strong streak. One day at a time.",
  ];
  const message =
    onGracePeriod
      ? "You missed yesterday — do a devotion to keep your streak!"
      : streakDays > 0
        ? streakMessages[Math.min(streakDays - 1, streakMessages.length - 1)]
        : "Log a devotion to start your streak.";

  // Check if today already has a devotion
  const todayStr = toDateStringInTimezone(new Date(), userTimezone);
  const todayDevotion = devotionDocs.find((d) => {
    const createdAt = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
    const devotionDateStr = toDateStringInTimezone(createdAt, userTimezone);
    return devotionDateStr === todayStr;
  });
  const todayDevotionId = todayDevotion ? todayDevotion._id.toString() : undefined;

  return {
    devotions,
    weeklyStats,
    streak: {
      days: streakDays,
      best: bestStreak,
      message,
      onGracePeriod,
      graceStreakDays,
      graceTimeLeft: onGracePeriod ? formatDuration(graceRemainingMs) : undefined,
    },
    todayDevotionId,
  };
}
