import { notFound, redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth-server";
import { getDb, parseObjectId } from "@/app/lib/mongodb";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { DevotionView } from "./DevotionView";

const DEVOTIONS_COLLECTION = "devotions";

type Props = { params: Promise<{ id: string }> };

export default async function DevotionViewPage({ params }: Props) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

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
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    minutesSpent: typeof doc.minutesSpent === "number" ? doc.minutesSpent : undefined,
  };

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <DevotionView devotion={devotion} />
      </div>
      <Footer />
    </main>
  );
}
