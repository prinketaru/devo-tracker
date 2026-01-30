import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const PRAYER_REQUESTS_COLLECTION = "prayer_requests";

export type PrayerRequestStatus = "active" | "answered";

/** GET /api/prayer-requests – list prayer requests for the current user. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const coll = db.collection(PRAYER_REQUESTS_COLLECTION);

  const docs = await coll
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  const requests = docs.map((d) => ({
    id: d._id.toString(),
    userId: d.userId,
    text: d.text ?? "",
    status: (d.status as PrayerRequestStatus) ?? "active",
    createdAt: d.createdAt,
  }));

  return NextResponse.json(requests);
}

/** POST /api/prayer-requests – create a prayer request. */
export async function POST(request: Request) {
  // Read body first (before getSession) in case the request stream is consumed elsewhere
  let body: { text?: string; status?: PrayerRequestStatus } = {};
  try {
    const raw = await request.text();
    if (!raw || !raw.trim()) {
      return NextResponse.json(
        { error: "Request body is empty. Send JSON: { text: string }" },
        { status: 400 }
      );
    }
    body = JSON.parse(raw) as { text?: string; status?: PrayerRequestStatus };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const status: PrayerRequestStatus = body.status === "answered" ? "answered" : "active";

  if (!text) {
    return NextResponse.json(
      { error: "Text is required. Send JSON: { text: string }" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const coll = db.collection(PRAYER_REQUESTS_COLLECTION);

  const insertResult = await coll.insertOne({
    userId: session.user.id,
    text,
    status,
    createdAt: new Date(),
  });

  const id = insertResult.insertedId.toString();
  return NextResponse.json(
    { id, text, status, createdAt: new Date() },
    { status: 201 }
  );
}
