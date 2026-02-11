"use client";

import { useState, useEffect } from "react";

type ShareDevotionModalProps = {
  devotionId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function ShareDevotionModal({ devotionId, isOpen, onClose }: ShareDevotionModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(true);
      fetch(`/api/devotions/${devotionId}/share`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { shareUrl?: string | null } | null) => {
          setShareUrl(data?.shareUrl ?? null);
        })
        .catch(() => setShareUrl(null))
        .finally(() => setLoading(false));
    } else {
      setShareUrl(null);
    }
  }, [isOpen, devotionId]);

  const fetchShareLink = async () => {
    if (shareUrl) return shareUrl;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/devotions/${devotionId}/share`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.shareUrl) {
        setShareUrl(data.shareUrl);
        return data.shareUrl;
      }
      setError((data as { error?: string }).error ?? "Failed to create share link.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleCopy = async (urlToCopy?: string | null) => {
    const url = urlToCopy ?? shareUrl ?? (await fetchShareLink());
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-devotion-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-6 shadow-xl">
        <h2 id="share-devotion-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Share devotion
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Anyone with this link can view your devotion (read-only).
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-6 flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl ?? (loading ? "Loading…" : "")}
            placeholder={loading ? "" : "Click to create link"}
            className="flex-1 rounded-md border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 truncate"
          />
          <button
            type="button"
            onClick={async () => {
              if (shareUrl) handleCopy();
              else {
                const url = await fetchShareLink();
                if (url) handleCopy(url);
              }
            }}
            disabled={loading}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {copied ? "Copied!" : shareUrl ? "Copy" : loading ? "..." : "Create link"}
          </button>
          {shareUrl && (
            <button
              type="button"
              onClick={async () => {
                if (deleteLoading) return;
                setDeleteLoading(true);
                try {
                  const res = await fetch(`/api/devotions/${devotionId}/share`, {
                    method: "DELETE",
                    credentials: "include",
                  });
                  if (res.ok) {
                    setShareUrl(null);
                  }
                } finally {
                  setDeleteLoading(false);
                }
              }}
              disabled={deleteLoading}
              className="rounded-md border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 shrink-0"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
