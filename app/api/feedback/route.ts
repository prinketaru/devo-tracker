import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;

const MAX_MESSAGE_LENGTH = 1500;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    message?: string;
    type?: string;
  } | null;

  const message = (body?.message ?? "").trim();
  const type = (body?.type ?? "General").trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const safeMessage = message.slice(0, MAX_MESSAGE_LENGTH);
  const timestampSeconds = Math.floor(Date.now() / 1000);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (!DISCORD_WEBHOOK_URL) {
    return NextResponse.json({ error: "Feedback webhook not configured." }, { status: 500 });
  }

  const userName = session.user.name ?? "Unknown";
  const userEmail = session.user.email ?? "Unknown";
  const userId = session.user.id;

  const content = [
    "**New Feedback**",
    `**Type:** ${type}`,
    `**User:** ${userName} (${userEmail})`,
    `**User ID:** ${userId}`,
    `**Time:** <t:${timestampSeconds}:F> (<t:${timestampSeconds}:R>)`,
    "",
    safeMessage,
    "",
    "```",
    `userAgent: ${userAgent}`,
    "```",
  ].join("\n");

  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.slice(0, 2000) }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to send feedback." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
