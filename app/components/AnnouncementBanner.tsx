"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export type AnnouncementBannerData = {
  slug: string;
  title: string;
  category?: string;
  date?: string;
};

type Props = {
  announcement: AnnouncementBannerData;
};

export function AnnouncementBanner({ announcement }: Props) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = useMemo(
    () => `announcement-banner-dismissed:${announcement.slug}`,
    [announcement.slug]
  );

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === "1") {
      setIsDismissed(true);
    }
    setIsLoading(false);
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "1");
    setIsDismissed(true);
  };

  if (isLoading || isDismissed) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/announcements/${announcement.slug}`} className="block group">
          <div className="flex flex-wrap items-center gap-2">
            {announcement.category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                {announcement.category}
              </span>
            )}
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              {announcement.title}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            Read the latest announcement →
          </p>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/announcements/${announcement.slug}`}
            className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="Dismiss this announcement"
            aria-label="Dismiss announcement banner"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}
