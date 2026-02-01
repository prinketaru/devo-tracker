import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/app/lib/auth-server";
import { getDb, parseObjectId } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";

type RouteContext = { params: Promise<{ id: string }> };

function generateShareToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/** POST /api/devotions/[id]/share – generate a share link for the devotion. */
export async function POST(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const oid = parseObjectId(id);
  if (!oid) {
    return NextResponse.json({ error: "Invalid devotion id" }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(DEVOTIONS_COLLECTION);
  const shareToken = generateShareToken();

  const result = await coll.findOneAndUpdate(
    { _id: oid, userId: session.user.id },
    { $set: { shareToken } },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Devotion not found" }, { status: 404 });
  }

  const baseUrl = process.env.BETTER_AUTH_URL || (typeof process.env.VERCEL_URL === "string" ? `https://${process.env.VERCEL_URL}` : null) || "http://localhost:3000";
  const shareUrl = `${baseUrl}/share/${shareToken}`;

  return NextResponse.json({ shareToken, shareUrl });
}

/** DELETE /api/devotions/[id]/share – revoke the share link. */
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const oid = parseObjectId(id);
  if (!oid) {
    return NextResponse.json({ error: "Invalid devotion id" }, { status: 400 });
  }

  const db = await getDb();
  const coll = db.collection(DEVOTIONS_COLLECTION);

  const result = await coll.findOneAndUpdate(
    { _id: oid, userId: session.user.id },
    { $unset: { shareToken: "" } },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Devotion not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
