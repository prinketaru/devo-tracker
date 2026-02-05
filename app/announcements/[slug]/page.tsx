import Link from "next/link";
import Markdown from "react-markdown";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { getAnnouncements, getAnnouncementBySlug } from "@/app/lib/announcements";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const announcements = await getAnnouncements();
  return announcements.map((announcement) => ({
    slug: announcement.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);

  if (!announcement) {
    return {
      title: "Not Found | DayMark",
    };
  }

  return {
    title: `${announcement.title} | DayMark`,
    description: announcement.excerpt || announcement.content.slice(0, 160),
  };
}

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <Link
          href="/announcements"
          className="text-amber-600 dark:text-amber-400 hover:underline mb-8 inline-block"
        >
          ← Back to Updates
        </Link>

        <article className="prose dark:prose-invert max-w-none">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50 mb-3">
              {announcement.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-stone-600 dark:text-stone-400">
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
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm rounded-full">
                {announcement.category}
              </span>
            </div>
          </div>

          <div className="my-8 border-t border-stone-200 dark:border-zinc-700"></div>

          <Markdown>{announcement.content}</Markdown>
        </article>

        <div className="mt-12 border-t border-stone-200 dark:border-zinc-700 pt-8">
          <Link
            href="/announcements"
            className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            ← Back to Updates
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
