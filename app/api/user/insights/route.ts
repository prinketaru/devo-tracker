import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";
const PREFERENCES_COLLECTION = "user_preferences";

/** GET /api/user/insights – devotion stats (most active hour, top books, total time). */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const prefsDoc = await db.collection(PREFERENCES_COLLECTION).findOne({ userId: session.user.id });
  const timezone = (prefsDoc?.timezone as string) ?? "UTC";

  const docs = await db
    .collection(DEVOTIONS_COLLECTION)
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  const hourCounts: Record<number, number> = {};
  const bookCounts: Record<string, number> = {};
  let totalMinutes = 0;

  const getBookFromPassage = (passage: string): string | null => {
    const tokens = passage.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;

    const bookTokens: string[] = [];
    let i = 0;

    const first = tokens[0];
    if (/^\d+(st|nd|rd|th)?$/i.test(first) || /^(I|II|III)$/i.test(first)) {
      bookTokens.push(first);
      i = 1;
    }

    for (; i < tokens.length; i++) {
      const token = tokens[i];
      if (/\d/.test(token)) break;
      bookTokens.push(token);
    }

    const book = bookTokens.join(" ").trim();
    return book || null;
  };

  for (const d of docs) {
    const dt = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
    const hourStr = dt.toLocaleTimeString("en-CA", { timeZone: timezone, hour12: false, hour: "2-digit" });
    const hour = parseInt(hourStr, 10) || 0;
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;

    const passage = (d.passage ?? "").trim();
    if (passage && passage !== "—") {
      const book = getBookFromPassage(passage);
      if (book) {
        bookCounts[book] = (bookCounts[book] ?? 0) + 1;
      }
    }

    const mins = (d as { minutesSpent?: number }).minutesSpent;
    if (typeof mins === "number" && mins > 0) {
      totalMinutes += mins;
    }
  }

  let mostActiveHour = 0;
  let mostActiveCount = 0;
  for (const [h, c] of Object.entries(hourCounts)) {
    const count = c;
    if (count > mostActiveCount) {
      mostActiveCount = count;
      mostActiveHour = parseInt(h, 10);
    }
  }

  const topBooks = Object.entries(bookCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([book, count]) => ({ book, count }));

  const formatHour = (h: number) => {
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    if (h < 12) return `${h} AM`;
    return `${h - 12} PM`;
  };

  return NextResponse.json({
    mostActiveHour: mostActiveCount > 0 ? formatHour(mostActiveHour) : null,
    totalDevotions: docs.length,
    totalMinutes: totalMinutes > 0 ? totalMinutes : null,
    topBooks,
  });
}
