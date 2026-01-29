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

type TabId = "bible" | "prayer";

type PrayerRequest = { id: string; text: string };

export function DevotionWorkspace() {
  const [activeTab, setActiveTab] = useState<TabId>("bible");
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [newRequest, setNewRequest] = useState("");

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
              onClick={() => setActiveTab("prayer")}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                activeTab === "prayer"
                  ? "bg-amber-600 text-white"
                  : "border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
              }`}
            >
              Prayer Requests
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
              <div className="flex h-full flex-col gap-4">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Prayer Requests
                </h3>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = newRequest.trim();
                    if (!trimmed) return;
                    setPrayerRequests((prev) => [
                      ...prev,
                      { id: crypto.randomUUID(), text: trimmed },
                    ]);
                    setNewRequest("");
                  }}
                >
                  <input
                    type="text"
                    value={newRequest}
                    onChange={(e) => setNewRequest(e.target.value)}
                    placeholder="Add a prayer request…"
                    className="min-w-0 flex-1 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500/70 dark:placeholder:text-stone-500"
                  />
                  <button
                    type="submit"
                    disabled={!newRequest.trim()}
                    className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </form>
                <ul className="min-h-0 flex-1 space-y-2 overflow-auto">
                  {prayerRequests.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      No prayer requests yet. Add one above.
                    </p>
                  ) : (
                    prayerRequests.map((req) => (
                      <li
                        key={req.id}
                        className="group flex items-start gap-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 px-3 py-2 text-sm text-stone-700 dark:text-stone-200"
                      >
                        <span className="min-w-0 flex-1">{req.text}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setPrayerRequests((prev) =>
                              prev.filter((r) => r.id !== req.id)
                            )
                          }
                          className="shrink-0 rounded p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-zinc-600 dark:hover:text-stone-200 transition-colors"
                          aria-label="Remove prayer request"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

