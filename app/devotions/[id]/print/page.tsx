import { notFound } from "next/navigation";
import { getSession } from "@/app/lib/auth-server";
import { getDb, parseObjectId } from "@/app/lib/mongodb";
import { PrintDevotionClient } from "./PrintDevotionClient";

const DEVOTIONS_COLLECTION = "devotions";

type Props = { params: Promise<{ id: string }> };

export default async function PrintDevotionPage({ params }: Props) {
  const session = await getSession();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const oid = parseObjectId(id);
  if (!oid) notFound();

  const db = await getDb();
  const doc = await db
    .collection(DEVOTIONS_COLLECTION)
    .findOne({ _id: oid, userId: session.user.id });

  if (!doc) notFound();

  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt);
  const devotion = {
    id: doc._id.toString(),
    title: (doc.title ?? "").trim() || "Untitled",
    passage: (doc.passage ?? "").trim() || "—",
    content: (doc.content ?? "").trim(),
    date: createdAt.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    minutesSpent: typeof doc.minutesSpent === "number" ? doc.minutesSpent : undefined,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
  };

  return (
    <div className="print-only min-h-screen bg-white p-8 text-stone-900">
      <PrintDevotionClient devotion={devotion} />
    </div>
  );
}
