import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { findUserByAuthId } from "@/app/lib/user-lookup";
import { sendEmail } from "@/app/lib/smtp2go";
import { getWeeklyDigestEmail } from "@/app/lib/email-templates";

const PREFERENCES_COLLECTION = "user_preferences";
const DEVOTIONS_COLLECTION = "devotions";

/** Convert a date to YYYY-MM-DD in a given timezone. */
function toDateStringInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/** Get start of current week (Sunday) in timezone as YYYY-MM-DD. */
function getWeekStartDateString(timezone: string): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "0", 10);
  const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "0", 10);
  const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const daysBack = dayMap[weekday] ?? 0;
  const sunday = new Date(year, month - 1, day - daysBack);
  return `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;
}

async function sendWeeklyDigest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 25000; // 25 seconds to leave buffer before 30s timeout

  const db = await getDb();
  const prefsColl = db.collection(PREFERENCES_COLLECTION);
  const devotionsColl = db.collection(DEVOTIONS_COLLECTION);

  const prefsDocs = await prefsColl.find({ weeklyDigest: true }).toArray();
  let sent = 0;
  let processed = 0;

  for (const doc of prefsDocs) {
    // Check if approaching timeout
    if (Date.now() - startTime > MAX_EXECUTION_TIME) {
      console.log(`[Weekly Digest] Stopping early due to timeout risk. Processed ${processed}/${prefsDocs.length}`);
      break;
    }

    processed++;
    const userId = doc.userId as string;
    const timezone = (doc.timezone as string) || "UTC";

    const user = await findUserByAuthId(userId);
    const email = user?.email;
    if (!email || typeof email !== "string") continue;

    const weekStartStr = getWeekStartDateString(timezone);
    const [startYear, startMonth, startDay] = weekStartStr.split("-").map(Number);
    const weekEndDate = new Date(startYear, startMonth - 1, startDay);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    const weekEndStr = `${weekEndDate.getFullYear()}-${String(weekEndDate.getMonth() + 1).padStart(2, "0")}-${String(weekEndDate.getDate()).padStart(2, "0")}`;

    const recentStart = new Date();
    recentStart.setDate(recentStart.getDate() - 8);

    const devotions = await devotionsColl
      .find({
        userId,
        createdAt: { $gte: recentStart },
      })
      .toArray();

    const devotionsInWeek = devotions.filter((d) => {
      const createdAt = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
      const dateStr = toDateStringInTimezone(createdAt, timezone);
      return dateStr >= weekStartStr && dateStr < weekEndStr;
    });

    const uniqueDays = new Set(
      devotionsInWeek.map((d) =>
        toDateStringInTimezone(d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt), timezone)
      )
    );
    const count = uniqueDays.size;
    const name = user?.name || "there";

    const { subject, text, html } = getWeeklyDigestEmail(name, count, devotionsInWeek.length);
    const res = await sendEmail({ to: email, subject, text, html });
    if (res.ok) sent++;
    else if (res.rateLimited) {
      console.log(`[Weekly Digest] Rate limited after ${sent} emails`);
      break;
    }
  }

  const executionTime = Date.now() - startTime;
  console.log(`[Weekly Digest] Sent ${sent}/${processed} emails in ${executionTime}ms`);

  return NextResponse.json({
    ok: true,
    sent,
    processed,
    totalUsers: prefsDocs.length,
    executionTimeMs: executionTime
  });
}

/** POST /api/cron/send-weekly-digest – call with CRON_SECRET; sends weekly summary to users with weeklyDigest. */
export async function POST(request: Request) {
  return sendWeeklyDigest(request);
}

/** GET /api/cron/send-weekly-digest – same as POST, supports cron services that default to GET */
export async function GET(request: Request) {
  return sendWeeklyDigest(request);
}
