"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type DevotionSummary = {
  id: string;
  date: string;
  title: string;
  passage: string;
  summary: string;
  minutesSpent?: number;
};

type DevotionCardProps = {
  devotion: DevotionSummary;
};

export function DevotionCard({ devotion }: DevotionCardProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/devotions/${devotion.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setConfirmOpen(false);
        router.refresh();
        return;
      }
    } catch {
      // keep dialog open
    }
    setDeleting(false);
  };

  return (
    <>
      <article
        className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              {devotion.date}
            </p>
            {devotion.minutesSpent != null && devotion.minutesSpent > 0 && (
              <span className="text-xs text-stone-500 dark:text-stone-400" title="Time spent">
                {devotion.minutesSpent} min
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
              {devotion.passage}
            </span>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((open) => !open);
                }}
                className="rounded p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label="Options"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full z-10 mt-1 min-w-32 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-lg"
                  role="menu"
                >
                  <Link
                    href={`/devotions/${devotion.id}/edit`}
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmOpen(true);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-50">
          {devotion.title}
        </h3>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {devotion.summary}
        </p>
      </article>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-devotion-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h3 id="delete-devotion-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Delete devotion?
            </h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
              This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
