import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const PREFERENCES_COLLECTION = "user_preferences";

/**
 * POST /api/user/onboarding
 * Mark onboarding as completed for the current user.
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const prefsColl = db.collection(PREFERENCES_COLLECTION);

    // Update or create preferences with onboardingCompleted flag
    await prefsColl.updateOne(
      { userId: session.user.id },
      { $set: { onboardingCompleted: true } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking onboarding as complete:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 500 }
    );
  }
}
