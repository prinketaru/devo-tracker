import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";

/** GET /api/devotions/dates?from=YYYY-MM-DD&to=YYYY-MM-DD – returns YYYY-MM-DD dates that have devotions (for calendar). */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  if (!from || !to) {
    return NextResponse.json({ error: "from and to (YYYY-MM-DD) required" }, { status: 400 });
  }

  const db = await getDb();
  const docs = await db
    .collection(DEVOTIONS_COLLECTION)
    .find({
      userId: session.user.id,
      createdAt: {
        $gte: new Date(from + "T00:00:00.000Z"),
        $lte: new Date(to + "T23:59:59.999Z"),
      },
    })
    .project({ createdAt: 1 })
    .toArray();

  const dates = Array.from(
    new Set(
      docs.map((d) => {
        const date = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
        return date.toISOString().slice(0, 10);
      })
    )
  );

  return NextResponse.json({ dates });
}
