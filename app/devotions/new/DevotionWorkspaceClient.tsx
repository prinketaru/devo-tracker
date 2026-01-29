"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const DevotionWorkspace = dynamic(
  () =>
    import("@/app/components/DevotionWorkspace").then(
      (mod) => mod.DevotionWorkspace,
    ),
  { ssr: false },
);

export default function DevotionWorkspaceClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="h-svh bg-stone-50 dark:bg-zinc-950">
      <div className="h-full flex flex-col">
        <div className="border-b border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur">
          <div className="mx-auto flex w-full max-w-none items-center justify-between px-4 py-3 sm:px-6 xl:px-8 2xl:px-10">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              ← Back to dashboard
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => {
                  setIsSubmitting(true);
                  // Placeholder: wire to DB later
                  setTimeout(() => setIsSubmitting(false), 600);
                }}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Finish devotion"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <DevotionWorkspace />
        </div>
      </div>
    </main>
  );
}

