import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const ACCOUNTABILITY_COLLECTION = "accountability";

/** DELETE /api/accountability/partners/[id] – revoke an accountability partner link. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid partner ID" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection(ACCOUNTABILITY_COLLECTION).updateOne(
    { _id: new ObjectId(id), inviterId: session.user.id, status: { $in: ["pending", "accepted"] } },
    { $set: { status: "revoked", updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Partner not found or already revoked" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
