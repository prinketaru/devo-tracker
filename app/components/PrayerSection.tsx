"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import PrayerActionMenu from "./PrayerActionMenu";

const PRAYER_CATEGORIES = ["family", "health", "ministry", "personal", "other"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  family: "Family",
  health: "Health",
  ministry: "Ministry",
  personal: "Personal",
  other: "Other",
};

type PrayerRequest = {
  id: string;
  text: string;
  status: "active" | "answered";
  category?: string;
  createdAt: string;
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

export function PrayerSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("personal");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const fetchRequests = () => {
    const url = filterCategory
      ? `/api/prayer-requests?category=${encodeURIComponent(filterCategory)}`
      : "/api/prayer-requests";
    fetch(url, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PrayerRequest[]) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [filterCategory]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const body = JSON.stringify({ text, status: "active", category: newCategory });
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
        if (status === "answered") {
          setCelebrateId(id);
          setTimeout(() => setCelebrateId(null), 2000);
        }
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
      }
    } catch {
      // ignore
    } finally {
      router.refresh();
    }
  };

  const handleEdit = async (id: string) => {
    const text = editText.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, text } : r))
        );
        setEditingId(null);
        setEditText("");
      }
    } catch {
      // ignore
    }
  };

  const startEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    return req.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeRequests = filteredRequests.filter((r) => r.status === "active");
  const answeredRequests = filteredRequests.filter((r) => r.status === "answered");

  return (
    <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        Prayer Requests
      </h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Add requests and mark them answered when God moves.
      </p>

      {/* Search Bar */}
      <div className="mt-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search prayers..."
          className="w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-500/70"
        />
      </div>

      {/* Category Filters */}
      {PRAYER_CATEGORIES.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterCategory("")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              !filterCategory
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {PRAYER_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                filterCategory === c
                  ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                  : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700"
              }`}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>
      )}

      {/* Add Prayer Form */}
      <form onSubmit={handleAdd} className="mt-4 flex flex-col sm:flex-row gap-2">
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
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 min-w-[120px]"
        >
          {PRAYER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c] ?? c}
            </option>
          ))}
        </select>
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

      {/* Prayer List */}
      <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-stone-500 dark:text-stone-400">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 p-4 text-center">
            <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
              No prayer requests yet
            </p>
            <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-500">
              Start by adding your first prayer above.
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <p className="text-xs text-stone-500 dark:text-stone-400 text-center py-2">
            No prayers match your search
          </p>
        ) : (
          <>
            {/* Active Prayers */}
            {activeRequests.map((req) => (
              <div
                key={req.id}
                id={`prayer-item-${req.id}`}
                className={`group rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-all ${
                  celebrateId === req.id ? "scale-105 border-green-400 dark:border-green-600 shadow-md" : ""
                }`}
              >
                {editingId === req.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 rounded border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-amber-500/70"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(req.id)}
                        className="px-2 py-1 rounded text-xs font-medium bg-amber-600 text-white hover:bg-amber-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 rounded text-xs font-medium bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-zinc-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-700 dark:text-stone-200 break-words leading-relaxed text-sm">
                          {req.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {req.category && (
                            <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-stone-500 dark:text-stone-400 capitalize">
                              {CATEGORY_LABELS[req.category] ?? req.category}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400 dark:text-stone-500">
                            {getRelativeTime(req.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <PrayerActionMenu
                          onEdit={() => startEdit(req.id, req.text)}
                          onAnswered={() => handleStatusChange(req.id, "answered")}
                          onDelete={() => handleDelete(req.id)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Answered Prayers */}
            {answeredRequests.length > 0 && (
              <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-500 flex items-center gap-1">
                  <span>✓</span> Answered ({answeredRequests.length})
                </p>
                {answeredRequests.map((req) => (
                  <div
                    key={req.id}
                    id={`prayer-item-${req.id}`}
                    className="group rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 px-3 py-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-500 dark:text-stone-400 line-through break-words leading-relaxed">
                          {req.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {req.category && (
                            <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-stone-400 dark:text-stone-500 capitalize">
                              {CATEGORY_LABELS[req.category] ?? req.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <PrayerActionMenu
                          onRestore={() => handleStatusChange(req.id, "active")}
                          onDelete={() => handleDelete(req.id)}
                          isAnswered={true}
                        />
                      </div>
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
