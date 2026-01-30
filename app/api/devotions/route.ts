import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";

/** GET /api/devotions – list devotions (paginate, search, date filter, tag). */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const from = searchParams.get("from") ?? ""; // YYYY-MM-DD
  const to = searchParams.get("to") ?? "";   // YYYY-MM-DD
  const tag = (searchParams.get("tag") ?? "").trim();

  const db = await getDb();
  const coll = db.collection(DEVOTIONS_COLLECTION);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = { userId: session.user.id };

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from + "T00:00:00.000Z");
    if (to) filter.createdAt.$lte = new Date(to + "T23:59:59.999Z");
  }
  if (tag) filter.tags = tag;
  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: re }, { passage: re }, { content: re }];
  }

  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    coll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    coll.countDocuments(filter),
  ]);

  const devotions = docs.map((d) => ({
    id: d._id.toString(),
    userId: d.userId,
    title: d.title ?? "",
    passage: d.passage ?? "",
    content: d.content ?? "",
    createdAt: d.createdAt,
    date: formatDevotionDate(d.createdAt),
    tags: Array.isArray(d.tags) ? d.tags : [],
    minutesSpent: typeof d.minutesSpent === "number" ? d.minutesSpent : undefined,
  }));

  return NextResponse.json({ devotions, total, page, limit });
}

/** POST /api/devotions – create a devotion for the current user. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; passage?: string; content?: string; tags?: string[]; minutesSpent?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const passage = typeof body.passage === "string" ? body.passage.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean) : [];
  const minutesSpent = typeof body.minutesSpent === "number" && body.minutesSpent >= 0 ? body.minutesSpent : undefined;

  const db = await getDb();
  const coll = db.collection(DEVOTIONS_COLLECTION);

  const doc: { userId: string; title: string; passage: string; content: string; createdAt: Date; tags?: string[]; minutesSpent?: number } = {
    userId: session.user.id,
    title,
    passage,
    content,
    createdAt: new Date(),
  };
  if (tags.length) doc.tags = tags;
  if (minutesSpent != null) doc.minutesSpent = minutesSpent;

  const insertResult = await coll.insertOne(doc);

  const id = insertResult.insertedId.toString();
  return NextResponse.json({ id, title, passage, content, tags, minutesSpent, createdAt: new Date() }, { status: 201 });
}

function formatDevotionDate(d: Date): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
