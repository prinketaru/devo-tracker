import Link from "next/link";
import Markdown from "react-markdown";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { getAnnouncements } from "@/app/lib/announcements";

export const metadata = {
  title: "Updates & Announcements | DayMark",
  description: "Latest updates, changelogs, and announcements for DayMark",
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50 mb-3">
            Updates & Announcements
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-300">
            Stay informed about the latest changes, features, and updates to DayMark.
          </p>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 dark:text-stone-400">
              No announcements yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {announcements.map((announcement) => (
              <article
                key={announcement.slug}
                className="border border-stone-200 dark:border-zinc-700 rounded-lg p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <Link
                      href={`/announcements/${announcement.slug}`}
                      className="text-2xl font-bold text-stone-900 dark:text-stone-50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      {announcement.title}
                    </Link>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm rounded-full whitespace-nowrap flex-shrink-0">
                    {announcement.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                  <time>
                    {new Date(announcement.date + 'T00:00:00').toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                  {announcement.author && (
                    <>
                      <span>•</span>
                      <span>By {announcement.author}</span>
                    </>
                  )}
                </div>

                <div className="mt-4 prose dark:prose-invert max-w-none">
                  <Markdown>{announcement.excerpt || announcement.content}</Markdown>
                </div>

                <Link
                  href={`/announcements/${announcement.slug}`}
                  className="inline-block mt-4 text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
