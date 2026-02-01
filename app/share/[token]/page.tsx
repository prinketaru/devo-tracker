import { notFound } from "next/navigation";
import { getDb } from "@/app/lib/mongodb";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Props = { params: Promise<{ token: string }> };

export default async function SharedDevotionPage({ params }: Props) {
  const { token } = await params;
  if (!token || token.length < 8) notFound();

  const db = await getDb();
  const doc = await db
    .collection("devotions")
    .findOne({ shareToken: token });

  if (!doc) notFound();

  const createdAt = doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt);
  const devotion = {
    title: (doc.title ?? "").trim() || "Untitled",
    passage: (doc.passage ?? "").trim() || "—",
    content: (doc.content ?? "").trim(),
    date: createdAt.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <header className="mb-8 border-b border-stone-200 dark:border-zinc-800 pb-6">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {devotion.title}
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              {devotion.date}
              {devotion.passage !== "—" && (
                <>
                  <span className="mx-2">·</span>
                  <span className="font-medium">{devotion.passage}</span>
                </>
              )}
            </p>
          </header>
          <div className="devotion-notes prose prose-stone dark:prose-invert max-w-none text-base leading-relaxed">
            <ReactMarkdown>{devotion.content}</ReactMarkdown>
          </div>
          <footer className="mt-10 pt-6 border-t border-stone-200 dark:border-zinc-800">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
            >
              ← Devo Tracker
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
