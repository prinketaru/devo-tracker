"use client";

import { useState, useEffect } from "react";

const DRAFT_KEY = "devo-tracker-offline-draft";

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineBanner() {
  const isOnline = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-100 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-900 dark:text-amber-200">
      You&apos;re offline. Drafts are saved locally and will sync when you&apos;re back online.
    </div>
  );
}

export function saveOfflineDraft(values: { title: string; passage: string; content: string }) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      ...values,
      savedAt: new Date().toISOString(),
    }));
  } catch {
    // ignore
  }
}

export function getOfflineDraft(): { title: string; passage: string; content: string } | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { title?: string; passage?: string; content?: string };
    return {
      title: parsed.title ?? "",
      passage: parsed.passage ?? "",
      content: parsed.content ?? "",
    };
  } catch {
    return null;
  }
}

export function clearOfflineDraft() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
