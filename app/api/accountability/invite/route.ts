import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";
import { sendEmail } from "@/app/lib/smtp2go";

const ACCOUNTABILITY_COLLECTION = "accountability";
const USER_COLLECTION = "user";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/** POST /api/accountability/invite – invite a partner by email. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(ACCOUNTABILITY_COLLECTION);

  const existing = await coll.findOne({
    inviterId: session.user.id,
    inviteeEmail: email,
    status: { $in: ["pending", "accepted"] },
  });
  if (existing) {
    if (existing.status === "accepted") {
      return NextResponse.json({ error: "This partner has already accepted" }, { status: 400 });
    }
    const token = (existing as { token?: string }).token ?? generateToken();
    await coll.updateOne({ _id: existing._id }, { $set: { token, updatedAt: new Date() } });
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const acceptUrl = `${baseUrl}/accountability/accept?token=${token}`;
    const emailRes = await sendEmail({
      to: email,
      subject: `${session.user.name || "Someone"} invited you to be their devotion accountability partner`,
      text: `You've been invited to be an accountability partner for Devo Tracker.\n\nView their devotion status (streak, completed today) at: ${acceptUrl}\n\nThis link lets you see if they completed their devotion—no devotion content is shared.`,
      html: `<p>You've been invited to be an accountability partner for Devo Tracker.</p><p><a href="${acceptUrl}">View their devotion status</a> (streak, completed today)</p><p>This link lets you see if they completed their devotion—no devotion content is shared.</p>`,
    });
    if (!emailRes.ok && emailRes.rateLimited) {
      return NextResponse.json({ error: emailRes.error }, { status: 429 });
    }
    return NextResponse.json({ success: true, inviteUrl: acceptUrl });
  }

  const token = generateToken();
  await coll.insertOne({
    inviterId: session.user.id,
    inviteeEmail: email,
    token,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const acceptUrl = `${baseUrl}/accountability/accept?token=${token}`;

  const emailRes = await sendEmail({
    to: email,
    subject: `${session.user.name || "Someone"} invited you to be their devotion accountability partner`,
    text: `You've been invited to be an accountability partner for Devo Tracker.\n\nView their devotion status (streak, completed today) at: ${acceptUrl}\n\nThis link lets you see if they completed their devotion—no devotion content is shared.`,
    html: `<p>You've been invited to be an accountability partner for Devo Tracker.</p><p><a href="${acceptUrl}">View their devotion status</a> (streak, completed today)</p><p>This link lets you see if they completed their devotion—no devotion content is shared.</p>`,
  });
  if (!emailRes.ok && emailRes.rateLimited) {
    return NextResponse.json({ error: emailRes.error }, { status: 429 });
  }
  return NextResponse.json({ success: true, inviteUrl: acceptUrl });
}
