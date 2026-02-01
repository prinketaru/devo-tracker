import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { findUserByAuthId } from "@/app/lib/user-lookup";
import { sendEmail } from "@/app/lib/smtp2go";
import { getGracePeriodEmail } from "@/app/lib/email-templates";
import { getGraceStatus } from "@/app/lib/dashboard-stats";

const PREFERENCES_COLLECTION = "user_preferences";

function todayInTimezone(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

/** POST /api/cron/send-grace-period-emails – call with CRON_SECRET; sends grace period warnings to users who missed a day. */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const prefsColl = db.collection(PREFERENCES_COLLECTION);

  const prefsDocs = await prefsColl.find({ gracePeriodWarnings: { $ne: false } }).toArray();
  let sent = 0;

  for (const doc of prefsDocs) {
    const userId = doc.userId as string;
    const timezone = (doc.timezone as string) || "UTC";

    const { onGracePeriod, graceStreakDays } = await getGraceStatus(userId, timezone);
    if (!onGracePeriod || graceStreakDays <= 0) continue;

    const todayStr = todayInTimezone(timezone);
    const lastSent = doc.gracePeriodEmailSentAt as string | undefined;
    if (lastSent === todayStr) continue;

    const user = await findUserByAuthId(userId);
    const email = user?.email;
    if (!email || typeof email !== "string") continue;

    const { subject, text, html } = getGracePeriodEmail(graceStreakDays);
    const res = await sendEmail({ to: email, subject, text, html });
    if (res.ok) {
      await prefsColl.updateOne(
        { userId },
        { $set: { gracePeriodEmailSentAt: todayStr } }
      );
      sent++;
    } else if (res.rateLimited) break;
  }

  return NextResponse.json({ ok: true, sent });
}
