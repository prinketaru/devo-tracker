"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const PRAYER_CATEGORIES = ["family", "health", "ministry", "personal", "other"] as const;
type PrayerCategory = (typeof PRAYER_CATEGORIES)[number];

const CATEGORY_LABELS: Record<string, string> = {
  family: "Family",
  health: "Health",
  ministry: "Ministry",
  personal: "Personal",
  other: "Other",
};

// Dot color per category — matches the reference design feel
const CATEGORY_DOT: Record<string, string> = {
  personal: "bg-blue-500",
  health: "bg-pink-500",
  family: "bg-orange-400",
  ministry: "bg-violet-500",
  other: "bg-emerald-500",
};

type PrayerRequest = {
  id: string;
  text: string;
  status: "active" | "answered";
  category?: string;
  createdAt: string;
};

export function PrayerSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<PrayerCategory>("personal");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = () => {
    fetch("/api/prayer-requests", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PrayerRequest[]) =>
        setRequests(Array.isArray(data) ? data.filter((r) => r.status === "active") : [])
      )
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Focus input when add form opens
  useEffect(() => {
    if (adding) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [adding]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, status: "active", category: newCategory }),
      });
      if (res.ok) {
        setNewText("");
        setAdding(false);
        fetchRequests();
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeRequests = requests.slice(0, 5); // show max 5 on dashboard

  return (
    <section className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          <h2 className="text-base font-semibold text-stone-900 dark:text-[#d6d3c8]">
            Prayer Requests
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center justify-center w-6 h-6 rounded-full text-stone-500 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-[#d6d3c8] transition-colors"
          aria-label="Add prayer request"
        >
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Inline add form */}
      {adding && (
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add a prayer request..."
            className="w-full rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-3 py-1.5 text-sm text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 dark:placeholder:text-[#4a4840] outline-none focus:ring-1 focus:ring-amber-500/70"
            disabled={submitting}
          />
          <div className="flex items-center gap-2">
            <Select value={newCategory} onValueChange={(v) => setNewCategory(v as PrayerCategory)}>
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRAYER_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="submit"
              disabled={!newText.trim() || submitting}
              className="rounded-lg bg-[#f0a531] px-3 py-1.5 text-xs font-medium text-stone-900 hover:bg-[#c0831a] transition-colors disabled:opacity-40"
            >
              {submitting ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      )}

      {/* Prayer list */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          <p className="text-xs text-stone-400 dark:text-[#4a4840]">Loading…</p>
        ) : activeRequests.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-[#4a4840]">No active prayer requests.</p>
        ) : (
          activeRequests.map((req) => (
            <div key={req.id} className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${CATEGORY_DOT[req.category ?? "other"] ?? "bg-stone-400"}`}
              />
              <p className="text-sm leading-snug text-stone-700 dark:text-[#c8c4ba] line-clamp-2">
                {req.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer link */}
      <Link
        href="/prayer"
        className="text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
      >
        View all prayers →
      </Link>
    </section>
  );
}
