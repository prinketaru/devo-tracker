import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";
import { validatePrayerText } from "@/app/lib/validation";

const PRAYER_REQUESTS_COLLECTION = "prayer_requests";

export type PrayerRequestStatus = "active" | "answered";

export const PRAYER_CATEGORIES = ["family", "health", "ministry", "personal", "other"] as const;
export type PrayerCategory = (typeof PRAYER_CATEGORIES)[number];

/** GET /api/prayer-requests – list prayer requests for the current user. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim();

  const db = await getDb();
  const coll = db.collection(PRAYER_REQUESTS_COLLECTION);

  const filter: { userId: string; category?: string } = { userId: session.user.id };
  if (category && PRAYER_CATEGORIES.includes(category as PrayerCategory)) {
    filter.category = category;
  }

  const docs = await coll
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  const requests = docs.map((d) => ({
    id: d._id.toString(),
    userId: d.userId,
    text: d.text ?? "",
    status: (d.status as PrayerRequestStatus) ?? "active",
    category: (d.category as string) ?? "other",
    createdAt: d.createdAt,
  }));

  return NextResponse.json(requests);
}

/** POST /api/prayer-requests – create a prayer request. */
export async function POST(request: Request) {
  let body: { text?: string; status?: PrayerRequestStatus; category?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const status: PrayerRequestStatus = body.status === "answered" ? "answered" : "active";
  const category = typeof body.category === "string" && PRAYER_CATEGORIES.includes(body.category as PrayerCategory)
    ? body.category
    : "other";

  if (!text) {
    return NextResponse.json(
      { error: "Text is required. Send JSON: { text: string }" },
      { status: 400 }
    );
  }

  const validationError = validatePrayerText(text);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(PRAYER_REQUESTS_COLLECTION);

  const insertResult = await coll.insertOne({
    userId: session.user.id,
    text,
    status,
    category,
    createdAt: new Date(),
  });

  const id = insertResult.insertedId.toString();
  return NextResponse.json(
    { id, text, status, category, createdAt: new Date() },
    { status: 201 }
  );
}
