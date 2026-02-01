import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";
import { getGraceStatus } from "@/app/lib/dashboard-stats";

const PREFERENCES_COLLECTION = "user_preferences";

/** GET /api/user/grace-status – returns { onGracePeriod, graceStreakDays } for current user. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const doc = await db.collection(PREFERENCES_COLLECTION).findOne({ userId: session.user.id });
  const timezone = doc?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { onGracePeriod, graceStreakDays } = await getGraceStatus(session.user.id, timezone);
  return NextResponse.json({ onGracePeriod, graceStreakDays });
}
