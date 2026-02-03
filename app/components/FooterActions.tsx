"use client";

import { useState } from "react";
import Link from "next/link";

type FooterActionsProps = {
  isLoggedIn: boolean;
};

export function FooterActions({ isLoggedIn }: FooterActionsProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("General");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"success" | "error" | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = feedbackText.trim();
    if (!message || feedbackLoading) return;
    setFeedbackLoading(true);
    setFeedbackStatus(null);
    setFeedbackError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, type: feedbackType }),
      });
      if (res.ok) {
        setFeedbackText("");
        setFeedbackStatus("success");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setFeedbackError(data?.error ?? "Could not send feedback. Try again.");
      setFeedbackStatus("error");
    } catch {
      setFeedbackError("Network error. Please try again.");
      setFeedbackStatus("error");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleOpenFeedback = () => {
    setFeedbackStatus(null);
    setFeedbackError(null);
    setFeedbackOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        {!isLoggedIn && (
          <Link
            href="/login"
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Sign In
          </Link>
        )}
        {!isLoggedIn && (
          <a
            href="#features"
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Features
          </a>
        )}
        {isLoggedIn && (
          <button
            type="button"
            onClick={handleOpenFeedback}
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Feedback
          </button>
        )}
        <a
          href="https://buymeacoffee.com/prinke"
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          Donate
        </a>
      </div>

      {feedbackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h3 id="feedback-dialog-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Send feedback
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
              Share ideas, report bugs, or tell us what you want to see next.
            </p>
            <form onSubmit={handleSendFeedback} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Type
                </span>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="mt-2 w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 cursor-pointer"
                >
                  <option value="General">General</option>
                  <option value="Bug">Bug</option>
                  <option value="Idea">Idea</option>
                  <option value="Praise">Praise</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Your message
                </span>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={5}
                  maxLength={1500}
                  placeholder="Write your feedback here..."
                  className="mt-2 w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
                />
              </label>
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {feedbackText.length}/1500
                </p>
                <button
                  type="submit"
                  disabled={!feedbackText.trim() || feedbackLoading}
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {feedbackLoading ? "Sending..." : "Send feedback"}
                </button>
              </div>
              {feedbackStatus === "success" && (
                <p className="text-sm text-green-600 dark:text-green-400">Thanks! Your feedback was sent.</p>
              )}
              {feedbackStatus === "error" && (
                <p className="text-sm text-red-600 dark:text-red-400">{feedbackError ?? "Could not send feedback."}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
