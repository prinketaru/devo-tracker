import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { sendEmail } from "@/app/lib/smtp2go";
import { getReminderEmail } from "@/app/lib/email-templates";

const PREFERENCES_COLLECTION = "user_preferences";
const USER_COLLECTION = "user"; // Better Auth default

function nowInTimezone(timezone: string): { hour: number; minute: number } {
  const str = new Date().toLocaleTimeString("en-CA", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [hour, minute] = str.split(":").map(Number);
  return { hour, minute };
}

function toHHmm(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/** POST /api/cron/send-reminder-emails – call with CRON_SECRET; sends reminder emails to users whose reminder time is now (in their TZ). */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const prefsColl = db.collection(PREFERENCES_COLLECTION);
  const userColl = db.collection(USER_COLLECTION);

  const prefsDocs = await prefsColl.find({ reminderEmails: true, reminders: { $exists: true, $ne: [] } }).toArray();
  let sent = 0;

  for (const doc of prefsDocs) {
    const userId = doc.userId as string;
    const timezone = (doc.timezone as string) || "UTC";
    const reminders = Array.isArray(doc.reminders) ? doc.reminders as { id: string; time: string }[] : [];
    const { hour, minute } = nowInTimezone(timezone);
    const nowHHmm = toHHmm(hour, minute);

    const shouldSend = reminders.some((r) => r.time === nowHHmm);
    if (!shouldSend) continue;

    const user = await userColl.findOne({ id: userId }) as { email?: string } | null;
    const email = user?.email;
    if (!email || typeof email !== "string") continue;

    const { subject, text, html } = getReminderEmail();
    const { ok } = await sendEmail({ to: email, subject, text, html });
    if (ok) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
