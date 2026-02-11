import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";
const PRAYER_REQUESTS_COLLECTION = "prayer_requests";
const PREFERENCES_COLLECTION = "user_preferences";

/** GET /api/backup – full backup (devotions, prayers, preferences) as JSON. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const userId = session.user.id;

  const [devotions, prayers, prefs] = await Promise.all([
    db.collection(DEVOTIONS_COLLECTION).find({ userId }).sort({ createdAt: -1 }).toArray(),
    db.collection(PRAYER_REQUESTS_COLLECTION).find({ userId }).sort({ createdAt: -1 }).toArray(),
    db.collection(PREFERENCES_COLLECTION).findOne({ userId }),
  ]);

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId,
    devotions: devotions.map((d) => ({
      title: d.title ?? "",
      passage: d.passage ?? "",
      content: d.content ?? "",
      createdAt: d.createdAt,
      category: d.category,
      tags: d.tags ?? [],
      minutesSpent: d.minutesSpent,
    })),
    prayerRequests: prayers.map((p) => ({
      text: p.text ?? "",
      status: p.status ?? "active",
      category: (p as { category?: string }).category ?? "other",
      createdAt: p.createdAt,
    })),
    preferences: prefs
      ? {
          timezone: prefs.timezone,
          reminders: prefs.reminders ?? [],
          defaultTemplateMarkdown: prefs.defaultTemplateMarkdown,
          profileImageUrl: prefs.profileImageUrl,
          reminderEmails: prefs.reminderEmails,
          weeklyDigest: prefs.weeklyDigest,
          gracePeriodWarnings: prefs.gracePeriodWarnings,
        }
      : null,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="devo-tracker-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

/** POST /api/backup – restore from backup JSON (merge devotions/prayers; overwrite preferences if provided). */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { devotions?: unknown[]; prayerRequests?: unknown[]; preferences?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = await getDb();
  const userId = session.user.id;

  const restored: { devotions: number; prayerRequests: number; preferences: boolean } = { devotions: 0, prayerRequests: 0, preferences: false };

  if (Array.isArray(body.devotions) && body.devotions.length > 0) {
    const toInsert = body.devotions
      .filter((d): d is { title?: string; passage?: string; content?: string; createdAt?: string; tags?: string[]; minutesSpent?: number; category?: string } => typeof d === "object" && d !== null)
      .map((d) => ({
        userId,
        title: typeof d.title === "string" ? d.title : "",
        passage: typeof d.passage === "string" ? d.passage : "",
        content: typeof d.content === "string" ? d.content : "",
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        category: typeof d.category === "string" ? d.category : undefined,
        tags: Array.isArray(d.tags) ? d.tags.filter((t): t is string => typeof t === "string") : [],
        minutesSpent: typeof d.minutesSpent === "number" ? d.minutesSpent : undefined,
      }));
    if (toInsert.length) {
      await db.collection(DEVOTIONS_COLLECTION).insertMany(toInsert);
      restored.devotions = toInsert.length;
    }
  }

  if (Array.isArray(body.prayerRequests) && body.prayerRequests.length > 0) {
    const validCategories = ["family", "health", "ministry", "personal", "other"];
    const toInsert = body.prayerRequests
      .filter((p): p is { text?: string; status?: string; category?: string; createdAt?: string } => typeof p === "object" && p !== null)
      .map((p) => ({
        userId,
        text: typeof p.text === "string" ? p.text : "",
        status: p.status === "answered" ? "answered" : "active",
        category: typeof p.category === "string" && validCategories.includes(p.category) ? p.category : "other",
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      }));
    if (toInsert.length) {
      await db.collection(PRAYER_REQUESTS_COLLECTION).insertMany(toInsert);
      restored.prayerRequests = toInsert.length;
    }
  }

  if (body.preferences && typeof body.preferences === "object") {
    const p = body.preferences as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (typeof p.timezone === "string") updates.timezone = p.timezone;
    if (Array.isArray(p.reminders)) updates.reminders = p.reminders;
    if (typeof p.defaultTemplateMarkdown === "string") updates.defaultTemplateMarkdown = p.defaultTemplateMarkdown;
    if (typeof p.profileImageUrl === "string") updates.profileImageUrl = p.profileImageUrl;
    if (typeof p.reminderEmails === "boolean") updates.reminderEmails = p.reminderEmails;
    if (typeof p.weeklyDigest === "boolean") updates.weeklyDigest = p.weeklyDigest;
    if (typeof p.gracePeriodWarnings === "boolean") updates.gracePeriodWarnings = p.gracePeriodWarnings;
    if (Object.keys(updates).length > 0) {
      await db.collection(PREFERENCES_COLLECTION).updateOne({ userId }, { $set: updates }, { upsert: true });
      restored.preferences = true;
    }
  }

  return NextResponse.json({ success: true, restored });
}
