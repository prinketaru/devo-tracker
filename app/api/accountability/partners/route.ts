import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const ACCOUNTABILITY_COLLECTION = "accountability";

/** GET /api/accountability/partners – list accountability partners for the current user. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const docs = await db
    .collection(ACCOUNTABILITY_COLLECTION)
    .find({ inviterId: session.user.id, status: { $in: ["pending", "accepted"] } })
    .sort({ createdAt: -1 })
    .toArray();

  const partners = docs.map((d) => ({
    id: d._id.toString(),
    email: d.inviteeEmail as string,
    status: d.status as string,
  }));

  return NextResponse.json({ partners });
}
