"use client";

import { useRef, useState, useEffect } from "react";
import { DEVOTION_CATEGORIES, DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";

type MarkCompleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; passage: string; content: string; notes?: string; category?: string }) => Promise<void>;
  initialTitle?: string;
  initialPassage?: string;
};

export function MarkCompleteModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = "",
  initialPassage = "",
}: MarkCompleteModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const passageRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const title = titleRef.current?.value?.trim() ?? "";
      const passage = passageRef.current?.value?.trim() ?? "";
      const notes = notesRef.current?.value?.trim() ?? "";
      const category = categoryRef.current?.value || undefined;

      await onSave({ title, passage, content: "", notes, category });
      onClose();
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-log-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-zinc-800">
          <h2 id="quick-log-title" className="text-xl font-semibold text-stone-900 dark:text-stone-100">
            Quick log
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Title <span className="font-normal normal-case tracking-normal text-stone-400 dark:text-stone-500">(optional)</span>
              </span>
              <input
                ref={titleRef}
                type="text"
                defaultValue={initialTitle}
                placeholder="e.g. Morning with Psalm 23"
                className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Passage <span className="font-normal normal-case tracking-normal text-stone-400 dark:text-stone-500">(optional)</span>
              </span>
              <input
                ref={passageRef}
                type="text"
                defaultValue={initialPassage}
                placeholder="e.g. Psalm 23:1-6"
                className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Notes <span className="font-normal normal-case tracking-normal text-stone-400 dark:text-stone-500">(optional)</span>
              </span>
              <textarea
                ref={notesRef}
                rows={3}
                placeholder="A brief reflection or prayer..."
                className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-500/70 resize-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Category
              </span>
              <select
                ref={categoryRef}
                defaultValue="devotion"
                className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
              >
                {DEVOTION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {DEVOTION_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </label>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
