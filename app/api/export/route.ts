import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";

const DEVOTIONS_COLLECTION = "devotions";
const PRAYER_REQUESTS_COLLECTION = "prayer_requests";

/** GET /api/export?format=json|markdown – export devotions and prayer requests. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "markdown" ? "markdown" : "json";

  const db = await getDb();
  const devotions = await db.collection(DEVOTIONS_COLLECTION).find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray();
  const prayers = await db.collection(PRAYER_REQUESTS_COLLECTION).find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray();

  const exportDevotions = devotions.map((d) => ({
    id: d._id.toString(),
    title: d.title ?? "",
    passage: d.passage ?? "",
    content: d.content ?? "",
    createdAt: d.createdAt,
    tags: d.tags ?? [],
    minutesSpent: d.minutesSpent,
  }));
  const exportPrayers = prayers.map((p) => ({
    id: p._id.toString(),
    text: p.text ?? "",
    status: p.status ?? "active",
    createdAt: p.createdAt,
  }));

  if (format === "markdown") {
    const lines: string[] = ["# DayMark Export", "", `Exported ${new Date().toISOString()}`, ""];
    lines.push("## Devotions", "");
    for (const d of exportDevotions) {
      const date = d.createdAt instanceof Date ? d.createdAt.toISOString().slice(0, 10) : String(d.createdAt).slice(0, 10);
      lines.push(`### ${d.title || "Untitled"} — ${date}`, "");
      if (d.passage) lines.push(`**Passage:** ${d.passage}`, "");
      if (d.tags?.length) lines.push(`**Tags:** ${d.tags.join(", ")}`, "");
      if (d.minutesSpent != null) lines.push(`**Minutes:** ${d.minutesSpent}`, "");
      lines.push(d.content || "", "", "---", "");
    }
    lines.push("## Prayer Requests", "");
    for (const p of exportPrayers) {
      lines.push(`- [${p.status}] ${p.text}`, "");
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="devo-tracker-export-${new Date().toISOString().slice(0, 10)}.md"`,
      },
    });
  }

  const payload = { exportedAt: new Date().toISOString(), devotions: exportDevotions, prayerRequests: exportPrayers };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="devo-tracker-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
