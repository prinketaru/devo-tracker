import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";
import { DEFAULT_DEVOTION_TEMPLATE } from "@/app/lib/default-devotion-template";

const PREFERENCES_COLLECTION = "user_preferences";

/** GET /api/user/preferences – timezone and default template for current user. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const coll = db.collection(PREFERENCES_COLLECTION);
  const doc = await coll.findOne({ userId: session.user.id });

  const timezone = doc?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const defaultTemplateMarkdown = doc?.defaultTemplateMarkdown ?? DEFAULT_DEVOTION_TEMPLATE;
  const reminders = Array.isArray(doc?.reminders) ? doc.reminders : [];
  const profileImageUrl = typeof doc?.profileImageUrl === "string" ? doc.profileImageUrl : undefined;
  const reminderEmails = doc?.reminderEmails !== false;
  const weeklyDigest = doc?.weeklyDigest !== false;
  const gracePeriodWarnings = doc?.gracePeriodWarnings !== false;

  return NextResponse.json({
    timezone,
    defaultTemplateMarkdown,
    reminders,
    profileImageUrl,
    reminderEmails,
    weeklyDigest,
    gracePeriodWarnings,
    preferencesExist: !!doc,
  });
}

/** PATCH /api/user/preferences – update timezone and/or default template. */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { timezone?: string; defaultTemplateMarkdown?: string; reminders?: { id: string; time: string }[]; profileImageUrl?: string; reminderEmails?: boolean; weeklyDigest?: boolean; gracePeriodWarnings?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: { timezone?: string; defaultTemplateMarkdown?: string; reminders?: { id: string; time: string }[]; profileImageUrl?: string; reminderEmails?: boolean; weeklyDigest?: boolean; gracePeriodWarnings?: boolean } = {};
  if (typeof body.timezone === "string") updates.timezone = body.timezone;
  if (typeof body.defaultTemplateMarkdown === "string") updates.defaultTemplateMarkdown = body.defaultTemplateMarkdown;
  if (body.profileImageUrl !== undefined) {
    updates.profileImageUrl = typeof body.profileImageUrl === "string" && body.profileImageUrl.trim() !== "" ? body.profileImageUrl.trim() : "";
  }
  if (typeof body.reminderEmails === "boolean") updates.reminderEmails = body.reminderEmails;
  if (typeof body.weeklyDigest === "boolean") updates.weeklyDigest = body.weeklyDigest;
  if (typeof body.gracePeriodWarnings === "boolean") updates.gracePeriodWarnings = body.gracePeriodWarnings;
  if (Array.isArray(body.reminders)) {
    updates.reminders = body.reminders.filter(
      (r: unknown): r is { id: string; time: string } =>
        typeof r === "object" && r !== null && "id" in r && "time" in r &&
        typeof (r as { id: unknown }).id === "string" &&
        typeof (r as { time: unknown }).time === "string" &&
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test((r as { time: string }).time)
    );
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ timezone: undefined, defaultTemplateMarkdown: undefined, reminders: undefined, profileImageUrl: undefined });
  }

  const db = await getDb();
  const coll = db.collection(PREFERENCES_COLLECTION);

  await coll.updateOne(
    { userId: session.user.id },
    { $set: updates },
    { upsert: true }
  );

  const doc = await coll.findOne({ userId: session.user.id });
  const profileImageUrl = updates.profileImageUrl !== undefined ? updates.profileImageUrl : (typeof doc?.profileImageUrl === "string" ? doc.profileImageUrl : undefined);
  const reminderEmails = updates.reminderEmails !== undefined ? updates.reminderEmails : doc?.reminderEmails;
  const weeklyDigest = updates.weeklyDigest !== undefined ? updates.weeklyDigest : doc?.weeklyDigest;
  const gracePeriodWarnings = updates.gracePeriodWarnings !== undefined ? updates.gracePeriodWarnings : doc?.gracePeriodWarnings;
  return NextResponse.json({
    timezone: doc?.timezone ?? updates.timezone,
    defaultTemplateMarkdown: doc?.defaultTemplateMarkdown ?? updates.defaultTemplateMarkdown,
    reminders: doc?.reminders ?? updates.reminders ?? [],
    profileImageUrl,
    reminderEmails: reminderEmails !== false,
    weeklyDigest: weeklyDigest !== false,
    gracePeriodWarnings: gracePeriodWarnings !== false,
  });
}
