import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(id: string): ObjectId | null {
  if (!id || id.length !== 24) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/** GET /api/devotions/[id] – get a single devotion (owner only). */
export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const oid = parseId(id);
  if (!oid) {
    return NextResponse.json({ error: "Invalid devotion id" }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(DEVOTIONS_COLLECTION);
  const doc = await coll.findOne({ _id: oid, userId: session.user.id });

  if (!doc) {
    return NextResponse.json({ error: "Devotion not found" }, { status: 404 });
  }

  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt);
  return NextResponse.json({
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title ?? "",
    passage: doc.passage ?? "",
    content: doc.content ?? "",
    createdAt,
    date: createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    minutesSpent: typeof doc.minutesSpent === "number" ? doc.minutesSpent : undefined,
  });
}

/** PATCH /api/devotions/[id] – update a devotion (owner only). */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const oid = parseId(id);
  if (!oid) {
    return NextResponse.json({ error: "Invalid devotion id" }, { status: 400 });
  }

  let body: { title?: string; passage?: string; content?: string; tags?: string[]; minutesSpent?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: { title?: string; passage?: string; content?: string; tags?: string[]; minutesSpent?: number } = {};
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.passage === "string") updates.passage = body.passage.trim();
  if (typeof body.content === "string") updates.content = body.content;
  if (Array.isArray(body.tags)) updates.tags = body.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean);
  if (typeof body.minutesSpent === "number" && body.minutesSpent >= 0) updates.minutesSpent = body.minutesSpent;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(DEVOTIONS_COLLECTION);

  const result = await coll.findOneAndUpdate(
    { _id: oid, userId: session.user.id },
    { $set: updates },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Devotion not found" }, { status: 404 });
  }

  const doc = result as { _id: unknown; title?: string; passage?: string; content?: string; createdAt: Date; tags?: string[]; minutesSpent?: number };
  return NextResponse.json({
    id: (doc._id as ObjectId).toString(),
    title: doc.title ?? "",
    passage: doc.passage ?? "",
    content: doc.content ?? "",
    createdAt: doc.createdAt,
    tags: doc.tags ?? [],
    minutesSpent: doc.minutesSpent,
  });
}

/** DELETE /api/devotions/[id] – delete a devotion (owner only). */
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const oid = parseId(id);
  if (!oid) {
    return NextResponse.json({ error: "Invalid devotion id" }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(DEVOTIONS_COLLECTION);

  const result = await coll.deleteOne({ _id: oid, userId: session.user.id });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Devotion not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
