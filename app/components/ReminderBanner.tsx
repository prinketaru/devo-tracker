"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function ReminderBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem("reminder-banner-dismissed");
    if (dismissed === "1") {
      setIsDismissed(true);
    }
    setIsLoading(false);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("reminder-banner-dismissed", "1");
    setIsDismissed(true);
  };

  if (isLoading || isDismissed) {
    return null;
  }

  return (
    <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 p-5 shadow-sm">
      <Link
        href="/settings"
        className="flex-1 block hover:opacity-90 transition-opacity"
      >
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Set up a devotion reminder
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            Get a notification at the times you choose so you never miss a devotion.
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/settings"
          className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          Add reminder →
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-amber-200/50 dark:hover:bg-amber-950/50 transition-colors"
          title="Dismiss this banner"
          aria-label="Dismiss reminder banner"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
}
