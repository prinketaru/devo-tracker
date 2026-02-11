import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { getMessaging } from "@/app/lib/firebase-admin";
import { getGraceStatus } from "@/app/lib/dashboard-stats";

export const dynamic = 'force-dynamic'; // Prevent caching

const PREFERENCES_COLLECTION = "user_preferences";
const DEVOTIONS_COLLECTION = "completed_devotions"; // Or wherever you check for completion
// Actually looking at dashboard-stats, it checks "devotions" collection for category="devotion"
const CONTENT_COLLECTION = "devotions";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();
        const prefsColl = db.collection(PREFERENCES_COLLECTION);
        const usersColl = db.collection("user");
        // We need to check if they completed a devotion today
        const contentColl = db.collection(CONTENT_COLLECTION);

        // 1. Find users with FCM tokens
        const usersWithTokens = await usersColl
            .find({ fcmToken: { $exists: true, $ne: null } })
            .toArray();

        if (usersWithTokens.length === 0) {
            return NextResponse.json({ message: "No users with FCM tokens found" });
        }

        const messagesToSend: any[] = [];
        let processedUsers = 0;

        for (const user of usersWithTokens) {
            processedUsers++;
            const userId = user.id || user._id.toString();

            // Get User Preferences
            const prefs = await prefsColl.findOne({ userId: userId });

            // Defaults
            const timezone = (prefs?.timezone as string) || "UTC";
            const reminders = (prefs?.reminders as { id: string; time: string }[]) || [];
            const allowGraceWarnings = prefs?.gracePeriodWarnings !== false;

            // Calculate User's Local Time
            const now = new Date();
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // 00-23
            });
            const parts = formatter.formatToParts(now);
            const hourStr = parts.find(p => p.type === "hour")?.value || "00";
            const minuteStr = parts.find(p => p.type === "minute")?.value || "00";

            const currentHour = parseInt(hourStr, 10);
            const currentMinute = parseInt(minuteStr, 10);
            const currentTimeStr = `${hourStr}:${minuteStr}`; // HH:MM

            // Helper: Check completion for "today" in user's timezone
            const todayInUserTz = new Intl.DateTimeFormat("en-CA", {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(now); // YYYY-MM-DD

            const recentDevotion = await contentColl.findOne({
                userId: userId,
                category: "devotion",
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            let completedToday = false;
            if (recentDevotion) {
                const dDate = recentDevotion.createdAt instanceof Date ? recentDevotion.createdAt : new Date(recentDevotion.createdAt);
                const dDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(dDate);
                if (dDateStr === todayInUserTz) {
                    completedToday = true;
                }
            }

            // Logic 1: Scheduled Reminders
            // Match exact HH:MM
            const hasReminderForNow = reminders.some(r => r.time === currentTimeStr);

            // Default Fallback: If NO reminders set, assume 6 PM (18:00)
            const isDefaultTime = reminders.length === 0 && currentHour === 18 && currentMinute === 0;

            if ((hasReminderForNow || isDefaultTime) && !completedToday) {
                messagesToSend.push({
                    token: user.fcmToken,
                    notification: {
                        title: "Time to pray 🙏",
                        body: "Take a moment with God today.",
                    },
                    data: { type: "reminder" }
                });
            }

            // Logic 2: Streak Rescue (Grace Period Warning)
            // Check at 9:00 AM and 8:00 PM
            if (allowGraceWarnings && (currentHour === 9 || currentHour === 20) && currentMinute === 0) {
                // Only check if we didn't already send a reminder in this same loop
                const alreadySending = messagesToSend.some(m => m.token === user.fcmToken);

                if (!alreadySending && !completedToday) {
                    const { onGracePeriod, graceStreakDays } = await getGraceStatus(userId, timezone);

                    if (onGracePeriod) {
                        messagesToSend.push({
                            token: user.fcmToken,
                            notification: {
                                title: "🔥 Streak Frozen!",
                                body: `You missed yesterday. Complete a devotion now to save your ${graceStreakDays}-day streak!`,
                            },
                            data: { type: "streak_rescue" }
                        });
                    }
                }
            }
        }

        if (messagesToSend.length === 0) {
            return NextResponse.json({ message: "No notifications need to be sent this hour." });
        }

        // Send Batch (Multicast doesn't support different bodies per token easily without grouping)
        // Use sendEach or group by message type.
        // For simplicity and volume, let's group by "title/body".

        // Grouping
        const batches = new Map<string, string[]>(); // key: JSON(notification), val: tokens[]

        for (const msg of messagesToSend) {
            const key = JSON.stringify(msg.notification);
            if (!batches.has(key)) {
                batches.set(key, []);
            }
            batches.get(key)?.push(msg.token);
        }

        let successCount = 0;
        let failureCount = 0;

        for (const [key, tokens] of batches.entries()) {
            const notification = JSON.parse(key);
            // Chunk triggers if > 500 tokens (Firebase limit)
            const CHUNK_SIZE = 500;
            for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
                const chunk = tokens.slice(i, i + CHUNK_SIZE);
                const response = await getMessaging().sendEachForMulticast({
                    notification,
                    tokens: chunk
                });
                successCount += response.successCount;
                failureCount += response.failureCount;
            }
        }

        console.log(`[Cron] Sent ${successCount} notifications, failed ${failureCount}. Processed ${processedUsers} users.`);

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failureCount,
            processedUsers
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
