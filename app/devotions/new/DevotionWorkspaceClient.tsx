"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { UserPreferencesInit } from "@/app/components/UserPreferencesInit";
import { DEFAULT_DEVOTION_TEMPLATE } from "@/app/lib/default-devotion-template";

const DevotionWorkspace = dynamic(
  () =>
    import("@/app/components/DevotionWorkspace").then(
      (mod) => mod.DevotionWorkspace,
    ),
  { ssr: false },
);

const MAX_TRACKED_MINUTES = 240; // cap at 4 hours

export default function DevotionWorkspaceClient() {
  const router = useRouter();
  const workspaceRef = useRef<{ getValues: () => { title: string; passage: string; content: string; tags: string[] } }>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialMarkdown, setInitialMarkdown] = useState<string>(DEFAULT_DEVOTION_TEMPLATE);

  useEffect(() => {
    const now = Date.now();
    sessionStartRef.current = now;
    setSessionStartedAt(now);
  }, []);

  useEffect(() => {
    fetch("/api/user/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { defaultTemplateMarkdown?: string } | null) => {
        if (data?.defaultTemplateMarkdown) setInitialMarkdown(data.defaultTemplateMarkdown);
      })
      .catch(() => {});
  }, []);

  const handleFinish = async () => {
    const values = workspaceRef.current?.getValues();
    if (!values) return;
    const durationMs = Date.now() - sessionStartRef.current;
    const minutesSpent = Math.min(MAX_TRACKED_MINUTES, Math.max(0, Math.round(durationMs / 60_000)));
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/devotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          passage: values.passage,
          content: values.content,
          tags: values.tags,
          minutesSpent: minutesSpent > 0 ? minutesSpent : undefined,
        }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    } catch {
      // fall through to re-enable button
    }
    setIsSubmitting(false);
  };

  return (
    <main className="h-svh bg-stone-50 dark:bg-zinc-950">
      <UserPreferencesInit />
      <div className="h-full flex flex-col">
        <div className="border-b border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur safe-area-x">
          <div className="mx-auto w-full max-w-none px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white transition-colors min-h-[44px] flex items-center touch-manipulation"
            >
              ← Back to dashboard
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFinish}
                className="rounded-md bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Finish devotion"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <DevotionWorkspace ref={workspaceRef} initialMarkdown={initialMarkdown} sessionStartedAt={sessionStartedAt} />
        </div>
      </div>
    </main>
  );
}

