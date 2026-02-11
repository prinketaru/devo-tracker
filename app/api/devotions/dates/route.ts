import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";
const PREFERENCES_COLLECTION = "user_preferences";

/** GET /api/devotions/dates?from=YYYY-MM-DD&to=YYYY-MM-DD&timezone=... – returns YYYY-MM-DD dates that have devotions (for calendar). */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const timezoneParam = searchParams.get("timezone");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to (YYYY-MM-DD) required" }, { status: 400 });
  }

  const db = await getDb();
  const prefsColl = db.collection(PREFERENCES_COLLECTION);

  // Get user's timezone - use param if provided, otherwise fetch from preferences
  let timezone: string = timezoneParam || "";
  if (!timezone) {
    const prefs = await prefsColl.findOne({ userId: session.user.id });
    timezone = prefs?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  }

  // Expand the query range to include times across timezones
  // The 'from' and 'to' are in UTC from the client's toISOString()
  // We need to query a wider range because the user's timezone might shift dates
  const expandedFrom = new Date(from + "T00:00:00.000Z");
  expandedFrom.setUTCDate(expandedFrom.getUTCDate() - 1); // Include previous day

  const expandedTo = new Date(to + "T23:59:59.999Z");
  expandedTo.setUTCDate(expandedTo.getUTCDate() + 1); // Include next day

  const docs = await db
    .collection(DEVOTIONS_COLLECTION)
    .find({
      userId: session.user.id,
      createdAt: {
        $gte: expandedFrom,
        $lte: expandedTo,
      },
    })
    .project({ createdAt: 1 })
    .toArray();

  const dates = Array.from(
    new Set(
      docs.map((d) => {
        const date = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
        return dateToStringInTimezone(date, timezone);
      })
    )
  ).filter((dateStr) => {
    // Only include dates within the requested range (after converting back to timezone)
    return dateStr >= from && dateStr <= to;
  });

  return NextResponse.json({ dates });
}

function dateToStringInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}
