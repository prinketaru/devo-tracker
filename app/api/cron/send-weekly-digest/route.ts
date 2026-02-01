import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { findUserByAuthId } from "@/app/lib/user-lookup";
import { sendEmail } from "@/app/lib/smtp2go";
import { getWeeklyDigestEmail } from "@/app/lib/email-templates";

const PREFERENCES_COLLECTION = "user_preferences";
const DEVOTIONS_COLLECTION = "devotions";

/** Get start of current week (Sunday) in timezone as YYYY-MM-DD. */
function getWeekStart(timezone: string): string {
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
  return sunday.toISOString().slice(0, 10);
}

/** POST /api/cron/send-weekly-digest – call with CRON_SECRET; sends weekly summary to users with weeklyDigest. */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const prefsColl = db.collection(PREFERENCES_COLLECTION);
  const devotionsColl = db.collection(DEVOTIONS_COLLECTION);

  const prefsDocs = await prefsColl.find({ weeklyDigest: true }).toArray();
  let sent = 0;

  for (const doc of prefsDocs) {
    const userId = doc.userId as string;
    const timezone = (doc.timezone as string) || "UTC";
    const user = await findUserByAuthId(userId);
    const email = user?.email;
    if (!email || typeof email !== "string") continue;

    const weekStart = getWeekStart(timezone);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const devotions = await devotionsColl
      .find({
        userId,
        createdAt: {
          $gte: new Date(weekStart + "T00:00:00.000Z"),
          $lt: new Date(weekEndStr + "T00:00:00.000Z"),
        },
      })
      .toArray();

    const uniqueDays = new Set(devotions.map((d) => (d.createdAt as Date).toISOString().slice(0, 10)));
    const count = uniqueDays.size;
    const name = user?.name || "there";

    const { subject, text, html } = getWeeklyDigestEmail(name, count, devotions.length);
    const res = await sendEmail({ to: email, subject, text, html });
    if (res.ok) sent++;
    else if (res.rateLimited) break;
  }

  return NextResponse.json({ ok: true, sent });
}
