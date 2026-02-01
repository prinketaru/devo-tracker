import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { findUserByAuthId } from "@/app/lib/user-lookup";
import { getDashboardData } from "@/app/lib/dashboard-stats";

const ACCOUNTABILITY_COLLECTION = "accountability";
const PREFERENCES_COLLECTION = "user_preferences";

/** GET /api/accountability/status?token=xxx – returns partner's devotion status (public, token-auth). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const db = await getDb();
  const doc = await db
    .collection(ACCOUNTABILITY_COLLECTION)
    .findOne({ token, status: { $in: ["pending", "accepted"] } });

  if (!doc) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  const inviterId = doc.inviterId as string;
  const user = await findUserByAuthId(inviterId);
  const partnerName =
    (user?.name?.trim()) ||
    (typeof user?.email === "string" ? user.email.split("@")[0] : null) ||
    "Someone";

  const prefsDoc = await db.collection(PREFERENCES_COLLECTION).findOne({ userId: inviterId });
  const timezone = (prefsDoc?.timezone as string) ?? "UTC";

  const { streak, todayDevotionId } = await getDashboardData(inviterId, timezone);
  const completedToday = !!todayDevotionId;

  return NextResponse.json({
    partnerName,
    streak: streak.onGracePeriod ? streak.graceStreakDays : streak.days,
    streakMessage: streak.message,
    completedToday,
    onGracePeriod: streak.onGracePeriod,
  });
}
