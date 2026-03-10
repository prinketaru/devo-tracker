"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { UserPreferencesInit } from "@/app/components/UserPreferencesInit";
import { OfflineBanner, saveOfflineDraft, clearOfflineDraft } from "@/app/components/OfflineBanner";
import { DEFAULT_DEVOTION_TEMPLATE } from "@/app/lib/default-devotion-template";
import { DEVOTION_CATEGORIES, DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const workspaceRef = useRef<{ getValues: () => { title: string; passage: string; content: string; tags: string[]; category?: string } }>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialMarkdown, setInitialMarkdown] = useState<string>(DEFAULT_DEVOTION_TEMPLATE);

  // Lifted state from workspace for the top bar
  const [title, setTitle] = useState("");
  const [passage, setPassage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("devotion");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const now = Date.now();
    sessionStartRef.current = now;
    setSessionStartedAt(now);
  }, []);

  useEffect(() => {
    fetch("/api/user/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { defaultTemplateMarkdown?: string } | null) => {
        if (data && "defaultTemplateMarkdown" in data && typeof data.defaultTemplateMarkdown === "string") {
          setInitialMarkdown(data.defaultTemplateMarkdown);
        }
      })
      .catch(() => { });
  }, []);

  const handleAddTag = () => {
    const newTags = tagInput.split(/\s*,\s*/).map(t => t.trim()).filter(Boolean);
    const merged = Array.from(new Set([...tags, ...newTags]));
    setTags(merged);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

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
          title,
          passage,
          content: values.content,
          tags,
          category,
          minutesSpent: minutesSpent > 0 ? minutesSpent : undefined,
        }),
      });
      if (res.ok) {
        clearOfflineDraft();
        router.push("/dashboard");
        router.refresh();
        return;
      }
      if (res.status === 503 || !navigator.onLine) {
        saveOfflineDraft({ title: values.title, passage: values.passage, content: values.content });
      }
    } catch {
      if (!navigator.onLine && values) {
        saveOfflineDraft({ title: values.title, passage: values.passage, content: values.content });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <main className="h-svh bg-background">
      <UserPreferencesInit />
      <OfflineBanner />
      <div className="h-full flex flex-col">
        <div className="border-b border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1a1814] safe-area-x z-10">
          <div className="w-full px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 h-14">

            {/* Left side: Back + Branding + Title Input */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link
                href="/dashboard"
                className="text-stone-500 hover:text-stone-900 dark:text-[#7e7b72] dark:hover:text-stone-200 transition-colors flex items-center gap-1.5 touch-manipulation whitespace-nowrap"
                title="Back to dashboard"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </Link>

              <div className="w-px h-4 bg-stone-200 dark:bg-[#38332a] hidden sm:block" />

              <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
                <div className="h-6 w-6 rounded-md bg-linear-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                  D
                </div>
                <span className="font-bold text-sm text-stone-900 dark:text-[#d6d3c8] tracking-tight">DayMark</span>
              </div>

              <div className="w-px h-4 bg-stone-200 dark:bg-[#38332a] hidden sm:block" />

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled devotion…"
                className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-[#5a5548] outline-none border-none ring-0 focus:ring-0 min-w-[120px]"
              />
            </div>

            {/* Right side: Passage + Date + Export/Save */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

              {/* Passage Input */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-[#38332a] bg-stone-50 dark:bg-[#23201a]">
                <svg className="w-3.5 h-3.5 text-stone-400 dark:text-[#7e7b72]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <input
                  type="text"
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="Passage..."
                  className="bg-transparent text-xs text-stone-600 dark:text-[#a8a29e] placeholder:text-stone-400 dark:placeholder:text-[#5a5548] outline-none border-none ring-0 focus:ring-0 w-24 sm:w-32"
                />
              </div>

              {/* Date */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 dark:text-[#7e7b72]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {format(new Date(), "MMM d, yyyy")}
              </div>

              <button
                type="button"
                onClick={() => setShowTagsDialog(true)}
                title="Tags & Category"
                className="w-8 h-8 flex items-center justify-center rounded-md text-stone-500 hover:text-stone-900 dark:text-[#7e7b72] dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#2a2720] transition-colors relative"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                {tags.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tags.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleFinish}
                data-save-devotion
                className="rounded-md bg-[#f0a531] px-4 py-1.5 text-xs font-semibold text-stone-900 hover:bg-[#c0831a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Finish Devotion"}
              </button>

              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                className="hidden lg:flex w-8 h-8 items-center justify-center rounded-md text-stone-500 hover:text-stone-900 dark:text-[#7e7b72] dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#2a2720] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{sidebarCollapsed ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}</svg>
              </button>
            </div>
          </div>
        </div>

        <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tags &amp; Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#23201a] px-3 py-2 text-sm text-stone-900 dark:text-stone-200 outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {DEVOTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {DEVOTION_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Management */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tags (comma-separated)..."
                    className="flex-1 rounded-md border border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#23201a] px-3 py-2 text-sm text-stone-900 dark:text-stone-200 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="rounded-md bg-stone-200 dark:bg-[#38332a] px-3 py-2 text-sm font-medium text-stone-900 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-[#4a3f35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Current Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-sm text-amber-900 dark:text-amber-200"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-bold"
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setShowTagsDialog(false)}
                className="rounded-md border border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#23201a] px-4 py-2 text-sm font-medium text-stone-900 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#2a2720] transition-colors"
              >
                Done
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex-1 min-h-0">
          <DevotionWorkspace
            ref={workspaceRef}
            initialMarkdown={initialMarkdown}
            passageQuery={passage}
            sessionStartedAt={sessionStartedAt}
            sidebarCollapsed={sidebarCollapsed}
            onSidebarCollapsedChange={setSidebarCollapsed}
            onChangeMetadata={(newTags, newCategory) => {
              setTags(newTags);
              setCategory(newCategory);
            }}
          />
        </div>
      </div>
    </main>
  );
}

