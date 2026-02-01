"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ExportDevotionModal } from "@/app/components/ExportDevotionModal";

type Devotion = {
  id: string;
  title: string;
  passage: string;
  content: string;
  date: string;
  tags: string[];
  minutesSpent?: number;
};

export function DevotionView({ devotion }: { devotion: Devotion }) {
  const [exportOpen, setExportOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/devotions"
          className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          ← Back to devotions
        </Link>
      </div>
      <article className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
      <header className="mb-8 border-b border-stone-200 dark:border-zinc-800 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
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
              {devotion.minutesSpent != null && devotion.minutesSpent > 0 && (
                <>
                  <span className="mx-2">·</span>
                  <span>{devotion.minutesSpent} min</span>
                </>
              )}
            </p>
            {devotion.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {devotion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href={`/devotions/${devotion.id}/edit`}
              className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="devotion-notes prose prose-stone dark:prose-invert max-w-none text-base leading-relaxed">
        {devotion.content ? (
          <ReactMarkdown>{devotion.content}</ReactMarkdown>
        ) : (
          <p className="text-stone-500 dark:text-stone-400 italic">No content.</p>
        )}
      </div>
    </article>
      <ExportDevotionModal
        devotionId={devotion.id}
        devotion={devotion}
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </div>
  );
}
