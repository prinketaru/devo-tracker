import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/app/lib/auth-server";
import { getDb, parseObjectId } from "@/app/lib/mongodb";
import { validatePrayerText } from "@/app/lib/validation";
import type { PrayerRequestStatus } from "../route";

const PRAYER_REQUESTS_COLLECTION = "prayer_requests";

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/prayer-requests/[id] – update text or status (owner only). */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const oid = parseObjectId(id);
  if (!oid) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { PRAYER_CATEGORIES } = await import("../route");
  type PrayerCategory = import("../route").PrayerCategory;

  let body: { text?: string; status?: string; category?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: { text?: string; status?: PrayerRequestStatus; category?: string } = {};
  if (typeof body.text === "string") updates.text = body.text.trim();
  if (body.status === "answered" || body.status === "active") updates.status = body.status;
  if (typeof body.category === "string" && PRAYER_CATEGORIES.includes(body.category as PrayerCategory)) {
    updates.category = body.category;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  if (updates.text !== undefined) {
    const validationError = validatePrayerText(updates.text);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
  }

  const db = await getDb();
  const coll = db.collection(PRAYER_REQUESTS_COLLECTION);

  const result = await coll.findOneAndUpdate(
    { _id: oid, userId: session.user.id },
    { $set: updates },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });
  }

  const doc = result as { _id: ObjectId; text: string; status: string; category?: string; createdAt: Date };
  return NextResponse.json({
    id: doc._id.toString(),
    text: doc.text ?? "",
    status: doc.status ?? "active",
    category: doc.category ?? "other",
    createdAt: doc.createdAt,
  });
}

/** DELETE /api/prayer-requests/[id] – delete a prayer request (owner only). */
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const oid = parseObjectId(id);
  if (!oid) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(PRAYER_REQUESTS_COLLECTION);

  const result = await coll.deleteOne({ _id: oid, userId: session.user.id });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
