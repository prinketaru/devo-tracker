"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

const DevotionWorkspace = dynamic(
  () =>
    import("@/app/components/DevotionWorkspace").then(
      (mod) => mod.DevotionWorkspace,
    ),
  { ssr: false },
);

type DevotionData = {
  id: string;
  title: string;
  passage: string;
  content: string;
  date: string;
  tags?: string[];
  minutesSpent?: number;
};

const MAX_TRACKED_MINUTES = 240;

type Props = { devotionId: string };

export default function EditDevotionClient({ devotionId }: Props) {
  const router = useRouter();
  const workspaceRef = useRef<{ getValues: () => { title: string; passage: string; content: string; tags: string[] } }>(null);
  const sessionStartRef = useRef<number | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devotion, setDevotion] = useState<DevotionData | null>(null);

  useEffect(() => {
    fetch(`/api/devotions/${devotionId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) setError("Devotion not found.");
          else setError("Failed to load devotion.");
          return null;
        }
        return res.json();
      })
      .then((data: DevotionData | null) => {
        setDevotion(data);
        const now = Date.now();
        sessionStartRef.current = now;
        setSessionStartedAt(now);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load devotion.");
        setLoading(false);
      });
  }, [devotionId]);

  const handleSave = async () => {
    const values = workspaceRef.current?.getValues();
    if (!values || !devotion) return;
    const start = sessionStartRef.current ?? Date.now();
    const durationMs = Date.now() - start;
    const sessionMinutes = Math.min(MAX_TRACKED_MINUTES, Math.max(0, Math.round(durationMs / 60_000)));
    const minutesSpent = (devotion.minutesSpent ?? 0) + sessionMinutes;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/devotions/${devotionId}`, {
        method: "PATCH",
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
      setError("Failed to save.");
    } catch {
      setError("Failed to save.");
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <main className="min-h-svh bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-sm text-stone-600 dark:text-stone-400">Loading…</p>
      </main>
    );
  }

  if (error || !devotion) {
    return (
      <main className="min-h-svh bg-stone-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Not found."}</p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="h-svh bg-stone-50 dark:bg-zinc-950">
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
              {error && (
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <DevotionWorkspace
            ref={workspaceRef}
            initialMarkdown={devotion.content}
            initialTitle={devotion.title}
            initialPassage={devotion.passage}
            initialTags={devotion.tags ?? []}
            sessionStartedAt={sessionStartedAt}
          />
        </div>
      </div>
    </main>
  );
}
