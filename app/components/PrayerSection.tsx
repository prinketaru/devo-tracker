"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type PrayerRequest = {
  id: string;
  text: string;
  status: "active" | "answered";
  createdAt: string;
};

export function PrayerSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchRequests = () => {
    fetch("/api/prayer-requests", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PrayerRequest[]) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const body = JSON.stringify({ text, status: "active" });
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNewText("");
        inputRef.current?.focus();
        fetchRequests();
        router.refresh();
      } else {
        setSubmitError((data as { error?: string }).error ?? "Failed to add prayer request");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "answered") => {
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        router.refresh();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        router.refresh();
      }
    } catch {
      // ignore
    }
  };

  const activeRequests = requests.filter((r) => r.status === "active");
  const answeredRequests = requests.filter((r) => r.status === "answered");

  return (
    <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        Prayer Requests
      </h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Add requests and mark them answered when God moves.
      </p>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          name="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a prayer request..."
          className="flex-1 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-500/70"
          disabled={submitting}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!newText.trim() || submitting}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>
      {submitError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{submitError}</p>
      )}

      <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No prayer requests yet. Add one above.
          </p>
        ) : (
          <>
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="group flex items-start gap-2 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              >
                <span className="flex-1 text-stone-700 dark:text-stone-200">
                  {req.text}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(req.id, "answered")}
                    className="rounded px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                    title="Mark answered"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(req.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {answeredRequests.length > 0 && (
              <div className="pt-2 border-t border-stone-200 dark:border-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                  Answered
                </p>
                {answeredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="group flex items-start gap-2 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 px-3 py-2 text-sm"
                  >
                    <span className="flex-1 text-stone-500 dark:text-stone-400 line-through">
                      {req.text}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(req.id, "active")}
                        className="rounded px-2 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                        title="Mark active again"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
