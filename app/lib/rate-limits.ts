/**
 * Rate limit and usage tracking (MongoDB-backed).
 * SMTP2GO limits: 100 emails/day, 2000 emails/month (free tier).
 */

import { getDb } from "./mongodb";

const USAGE_COLLECTION = "usage_counters";

const EMAIL_DAILY_LIMIT = 100;
const EMAIL_MONTHLY_LIMIT = 2000;
const OTP_PER_EMAIL_PER_HOUR = 5;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function thisMonthUTC(): string {
  return new Date().toISOString().slice(0, 7);
}

function thisHourUTC(): string {
  return new Date().toISOString().slice(0, 13);
}

function sanitizeKey(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
}

type UsageDoc = { _id: string; count: number; updatedAt?: Date };

async function getCount(key: string): Promise<number> {
  const db = await getDb();
  const doc = await db.collection<UsageDoc>(USAGE_COLLECTION).findOne({ _id: key });
  return typeof doc?.count === "number" ? doc.count : 0;
}

async function incrementCount(key: string): Promise<number> {
  const db = await getDb();
  const result = await db
    .collection<UsageDoc>(USAGE_COLLECTION)
    .findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );
  return typeof result?.count === "number" ? result.count : 1;
}

export type EmailLimitResult =
  | { allowed: true; dailyCount: number; monthlyCount: number }
  | { allowed: false; reason: string; dailyCount: number; monthlyCount: number; retryAfter?: string };

/** Check if we can send another email (SMTP2GO: 100/day, 2000/month). */
export async function checkEmailLimit(): Promise<EmailLimitResult> {
  const dailyKey = `email_daily_${todayUTC()}`;
  const monthlyKey = `email_monthly_${thisMonthUTC()}`;
  const [dailyCount, monthlyCount] = await Promise.all([
    getCount(dailyKey),
    getCount(monthlyKey),
  ]);

  if (dailyCount >= EMAIL_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: `Email limit reached (${EMAIL_DAILY_LIMIT}/day). Try again tomorrow.`,
      dailyCount,
      monthlyCount,
      retryAfter: "tomorrow",
    };
  }
  if (monthlyCount >= EMAIL_MONTHLY_LIMIT) {
    return {
      allowed: false,
      reason: `Email limit reached (${EMAIL_MONTHLY_LIMIT}/month). Try again next month.`,
      dailyCount,
      monthlyCount,
      retryAfter: "next month",
    };
  }

  return { allowed: true, dailyCount, monthlyCount };
}

/** Record that an email was sent. Call only after successful send. */
export async function recordEmailSent(): Promise<void> {
  const dailyKey = `email_daily_${todayUTC()}`;
  const monthlyKey = `email_monthly_${thisMonthUTC()}`;
  await Promise.all([incrementCount(dailyKey), incrementCount(monthlyKey)]);
}

export type OtpLimitResult =
  | { allowed: true }
  | { allowed: false; reason: string; retryAfter?: string };

/** Check if we can send another OTP to this email (5/hour). */
export async function checkOtpLimit(email: string): Promise<OtpLimitResult> {
  const key = `otp_${sanitizeKey(email.toLowerCase())}_${thisHourUTC()}`;
  const count = await getCount(key);
  if (count >= OTP_PER_EMAIL_PER_HOUR) {
    return {
      allowed: false,
      reason: `Too many codes sent. Try again in an hour.`,
      retryAfter: "1 hour",
    };
  }
  return { allowed: true };
}

/** Record that an OTP was sent to this email. Call only after successful send. */
export async function recordOtpSent(email: string): Promise<void> {
  const key = `otp_${sanitizeKey(email.toLowerCase())}_${thisHourUTC()}`;
  await incrementCount(key);
}
