"use client";

import { useEffect, useState } from "react";

type VerseData = { reference: string; text: string | null; error?: string };

export function VerseOfTheDay() {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/verse-of-the-day", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VerseData | null) => {
        setVerse(data ?? { reference: "Psalm 119:105", text: null });
      })
      .catch(() => setVerse({ reference: "Psalm 119:105", text: null }))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !verse) {
    return (
      <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 mb-2">
          Verse of the Day
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-400 animate-pulse">Loading…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 mb-2">
        Verse of the Day
      </p>
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300 italic">
        &ldquo;{verse.text ?? `Open ${verse.reference} in your Bible`}&rdquo;
      </p>
      <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        — {verse.reference}
      </p>
      {verse.error && (
        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{verse.error}</p>
      )}
    </section>
  );
}
