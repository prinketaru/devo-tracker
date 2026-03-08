"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
    <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white/90 dark:bg-[#171510]/80 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/announcements/${announcement.slug}`} className="block group">
          <div className="flex flex-wrap items-center gap-2">
            {announcement.category && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 uppercase tracking-wide text-xs"
              >
                {announcement.category}
              </Badge>
            )}
            <span className="text-sm font-semibold text-stone-900 dark:text-[#d6d3c8] group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              {announcement.title}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-[#b8b5ac]">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-stone-500 dark:text-[#7e7b72]"
            title="Dismiss this announcement"
            aria-label="Dismiss announcement banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
