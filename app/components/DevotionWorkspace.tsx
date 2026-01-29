"use client";

import { useState } from "react";
import { ForwardRefEditor } from "./ForwardRefEditor";

const starterMarkdown = `# Today's Devotion

## Scripture
_Add the passage you read today._

## Reflection
What stood out? What is God inviting you to do?

## Prayer
Write a simple prayer response.
`;

type TabId = "bible" | "notes";

export function DevotionWorkspace() {
  const [activeTab, setActiveTab] = useState<TabId>("bible");

  return (
    <section className="h-full">
      <div className="h-full grid gap-0 lg:grid-cols-[2fr_1fr]">
        <div className="min-h-0 border-b border-stone-200 dark:border-zinc-800 lg:border-b-0 lg:border-r">
          <div className="h-full flex flex-col gap-3 p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Title
                </span>
                <input
                  type="text"
                  placeholder="e.g. Morning with Psalm 23"
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Passage
                </span>
                <input
                  type="text"
                  placeholder="e.g. Psalm 23:1-6"
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
                />
              </label>
            </div>

            <div className="flex-1 min-h-0">
              <ForwardRefEditor
                markdown={starterMarkdown}
                className="devotion-editor h-full min-h-0 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-stone-900 dark:text-stone-100 font-sans prose prose-stone dark:prose-invert max-w-none"
              />
            </div>
          </div>
        </div>

        <aside className="min-h-0 p-4 sm:p-6">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("bible")}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                activeTab === "bible"
                  ? "bg-amber-600 text-white"
                  : "border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
              }`}
            >
              Bible
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                activeTab === "notes"
                  ? "bg-amber-600 text-white"
                  : "border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
              }`}
            >
              Reading Plan
            </button>
          </div>

          <div className="mt-4 h-[calc(100%-2.75rem)] min-h-0 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-sm text-stone-700 dark:text-stone-200 overflow-auto">
            {activeTab === "bible" ? (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Bible Reading
                </h3>
                <p>
                  Add a Bible passage here or embed a Bible reader once you
                  connect your data source.
                </p>
                <div className="rounded-lg border border-dashed border-stone-300 dark:border-zinc-700 px-4 py-6 text-center text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Bible content placeholder
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Weekly Reading Plan
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-stone-600 dark:text-stone-300">
                  <li>Day 1: Psalm 23</li>
                  <li>Day 2: Proverbs 3</li>
                  <li>Day 3: John 15</li>
                  <li>Day 4: Romans 12</li>
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

