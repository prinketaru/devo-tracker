import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { getGraceStatus } from "@/app/lib/dashboard-stats";

export const dynamic = "force-dynamic";

const PREFERENCES_COLLECTION = "user_preferences";
const CONTENT_COLLECTION = "devotions";

/**
 * Reminder cron handler.
 *
 * Firebase Cloud Messaging has been removed. Push notifications are
 * currently disabled pending integration of a new provider.
 *
 * The cron still runs so that logic for computing which users need
 * notifications (timezone-aware, grace period checks) is maintained
 * and ready to be connected to the new provider.
 */
async function handleReminders(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();
        const prefsColl = db.collection(PREFERENCES_COLLECTION);
        const usersColl = db.collection("user");
        const contentColl = db.collection(CONTENT_COLLECTION);

        const allUsers = await usersColl.find({}).toArray();

        if (allUsers.length === 0) {
            return NextResponse.json({ message: "No users found" });
        }

        let processedUsers = 0;
        const pendingNotifications: {
            userId: string;
            type: "reminder" | "streak_rescue";
            title: string;
            body: string;
        }[] = [];

        for (const user of allUsers) {
            processedUsers++;
            const userId = user.id || user._id.toString();

            const prefs = await prefsColl.findOne({ userId });

            const timezone = (prefs?.timezone as string) || "UTC";
            const reminders = (prefs?.reminders as { id: string; time: string }[]) || [];
            const allowGraceWarnings = prefs?.gracePeriodWarnings !== false;

            const now = new Date();
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
            const parts = formatter.formatToParts(now);
            const hourStr = parts.find((p) => p.type === "hour")?.value ?? "00";
            const minuteStr = parts.find((p) => p.type === "minute")?.value ?? "00";

            const currentHour = parseInt(hourStr, 10);
            const currentMinute = parseInt(minuteStr, 10);
            const currentTimeStr = `${hourStr}:${minuteStr}`;

            const todayInUserTz = new Intl.DateTimeFormat("en-CA", {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(now);

            const recentDevotion = await contentColl.findOne({
                userId,
                category: "devotion",
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            });

            let completedToday = false;
            if (recentDevotion) {
                const dDate =
                    recentDevotion.createdAt instanceof Date
                        ? recentDevotion.createdAt
                        : new Date(recentDevotion.createdAt);
                const dDateStr = new Intl.DateTimeFormat("en-CA", {
                    timeZone: timezone,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }).format(dDate);
                if (dDateStr === todayInUserTz) completedToday = true;
            }

            const hasReminderNow = reminders.some((r) => r.time === currentTimeStr);
            const isDefaultTime =
                reminders.length === 0 && currentHour === 18 && currentMinute === 0;

            if ((hasReminderNow || isDefaultTime) && !completedToday) {
                pendingNotifications.push({
                    userId,
                    type: "reminder",
                    title: "Time to pray 🙏",
                    body: "Take a moment with God today.",
                });
            }

            if (
                allowGraceWarnings &&
                (currentHour === 9 || currentHour === 20) &&
                currentMinute === 0 &&
                !completedToday
            ) {
                const alreadyQueued = pendingNotifications.some(
                    (n) => n.userId === userId
                );
                if (!alreadyQueued) {
                    const { onGracePeriod, graceStreakDays } = await getGraceStatus(
                        userId,
                        timezone
                    );
                    if (onGracePeriod) {
                        pendingNotifications.push({
                            userId,
                            type: "streak_rescue",
                            title: "🔥 Streak Frozen!",
                            body: `You missed yesterday. Complete a devotion now to save your ${graceStreakDays}-day streak!`,
                        });
                    }
                }
            }
        }

        // TODO: send pendingNotifications via new push provider
        console.log(
            `[Cron] Computed ${pendingNotifications.length} pending notifications for ${processedUsers} users. Push delivery is pending a new provider.`
        );

        return NextResponse.json({
            success: true,
            processedUsers,
            pendingNotifications: pendingNotifications.length,
            note: "Push delivery disabled pending new provider integration.",
        });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    return handleReminders(req);
}

export async function POST(req: Request) {
    return handleReminders(req);
}
