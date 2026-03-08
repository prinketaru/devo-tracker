"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/app/components/Footer";
import { DevotionCard } from "@/app/components/DevotionCard";
import { DevotionCalendar } from "@/app/components/DevotionCalendar";
import { DEVOTION_CATEGORIES, DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, BookOpen, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type DevotionItem = {
  id: string;
  date: string;
  title: string;
  passage: string;
  content: string;
  summary?: string;
  tags?: string[];
  minutesSpent?: number;
  category?: string;
};

/** Shape returned by /api/devotions (includes createdAt). */
type ApiDevotion = Omit<DevotionItem, "date"> & { createdAt?: string | number };

function summarize(content: string, maxLen = 120): string {
  const text = (content ?? "").trim().replace(/\s+/g, " ");
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + "…";
}

export default function DevotionsListPage() {
  const router = useRouter();
  const [devotions, setDevotions] = useState<DevotionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tag, setTag] = useState("");
  const [category, setCategory] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [nextDateTarget, setNextDateTarget] = useState<"from" | "to">("from");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  const limit = 20;

  const hasActiveFilters = !!(search || from || to || tag || category);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (tag) params.set("tag", tag);
    if (category) params.set("category", category);
    setLoading(true);
    fetch(`/api/devotions?${params}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data: { devotions?: ApiDevotion[]; total?: number } | null) => {
        if (!data) return;
        const list = Array.isArray(data.devotions) ? data.devotions : [];
        setDevotions(
          list.map((d) => ({
            ...d,
            date: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
            summary: summarize(d.content ?? ""),
          }))
        );
        setTotal(data.total ?? 0);
      })
      .catch(() => setDevotions([]))
      .finally(() => setLoading(false));
  }, [page, search, from, to, tag, category, router]);

  useEffect(() => {
    fetch("/api/user/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { timezone?: string } | null) => {
        if (data?.timezone) setTimezone(data.timezone);
      })
      .catch(() => { });
  }, []);

  const applyFilters = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setFrom("");
    setTo("");
    setTag("");
    setCategory("");
    setPage(1);
  };

  const handleCalendarDateClick = (dateStr: string) => {
    if (nextDateTarget === "from") {
      setFrom(dateStr);
      setTo("");
      setNextDateTarget("to");
    } else {
      setTo(dateStr);
      const currentFrom = from;
      if (currentFrom && dateStr < currentFrom) {
        setFrom(dateStr);
        setTo(currentFrom);
      }
      setNextDateTarget("from");
    }
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 gap-1 text-stone-500 dark:text-[#7e7b72]">
              <Link href="/dashboard">
                <ChevronLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-[#d6d3c8] leading-tight">
              All Notes
            </h1>
            {!loading && (
              <p className="mt-1 text-sm text-stone-500 dark:text-[#7e7b72]">
                {total === 0 ? "No notes yet" : `${total} note${total !== 1 ? "s" : ""}${hasActiveFilters ? " found" : ""}`}
              </p>
            )}
          </div>
          <Button asChild>
            <Link href="/devotions/new">
              <Plus className="h-4 w-4" />
              New note
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_272px]">

          {/* ── Left: search + list ── */}
          <div className="min-w-0">

            {/* Search & filter bar */}
            <div className="mb-4 rounded-xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] overflow-hidden">
              {/* Main row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-stone-400 dark:text-[#7e7b72]" />
                <input
                  type="text"
                  placeholder="Search title, passage, content, tags…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); }}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="flex-1 min-w-0 bg-transparent text-sm text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none"
                />
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    title="Clear all filters"
                    className="p-1 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 dark:text-[#7e7b72] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filtersOpen || (from || to || tag || category)
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                    }`}
                  aria-expanded={filtersOpen}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>
              </div>

              {/* Expanded filters */}
              {filtersOpen && (
                <div className="border-t border-stone-100 dark:border-[#2a2720] px-4 py-3 flex flex-wrap gap-2">
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); applyFilters(); }}
                    className="rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#252320] px-3 py-1.5 text-xs text-stone-700 dark:text-[#d6d3c8]"
                  >
                    <option value="">All categories</option>
                    {DEVOTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {DEVOTION_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <label className="text-xs text-stone-500 dark:text-[#7e7b72] whitespace-nowrap">From</label>
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => { setFrom(e.target.value); applyFilters(); }}
                      className="rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#252320] px-2 py-1.5 text-xs text-stone-700 dark:text-[#d6d3c8]"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <label className="text-xs text-stone-500 dark:text-[#7e7b72]">To</label>
                    <input
                      type="date"
                      value={to}
                      onChange={(e) => { setTo(e.target.value); applyFilters(); }}
                      className="rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#252320] px-2 py-1.5 text-xs text-stone-700 dark:text-[#d6d3c8]"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Tag…"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    className="rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#252320] px-3 py-1.5 text-xs text-stone-700 dark:text-[#d6d3c8] placeholder:text-stone-400 w-28"
                  />
                </div>
              )}
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (from || to || tag || category) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {category && (
                  <FilterChip label={`Category: ${DEVOTION_CATEGORY_LABELS[category as keyof typeof DEVOTION_CATEGORY_LABELS] ?? category}`} onRemove={() => { setCategory(""); applyFilters(); }} />
                )}
                {from && <FilterChip label={`From: ${from}`} onRemove={() => { setFrom(""); applyFilters(); }} />}
                {to && <FilterChip label={`To: ${to}`} onRemove={() => { setTo(""); applyFilters(); }} />}
                {tag && <FilterChip label={`Tag: ${tag}`} onRemove={() => { setTag(""); applyFilters(); }} />}
              </div>
            )}

            {/* Devotion list */}
            {loading ? (
              <LoadingSkeleton />
            ) : devotions.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
              <>
                <div className="space-y-3">
                  {devotions.map((d) => (
                    <DevotionCard
                      key={d.id}
                      devotion={{
                        id: d.id,
                        date: d.date,
                        title: d.title || "Untitled",
                        passage: d.passage || "—",
                        summary: d.summary ?? summarize(d.content ?? ""),
                        category: d.category,
                        minutesSpent: d.minutesSpent,
                      }}
                      onDelete={(id) => {
                        setDevotions((prev) => prev.filter((x) => x.id !== id));
                        setTotal((t) => Math.max(0, t - 1));
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-stone-500 dark:text-[#7e7b72]">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        Next <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right: calendar sidebar ── */}
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-4">
              {/* Month navigation header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
                    else setCalMonth((m) => m - 1);
                  }}
                  className="rounded-md p-1.5 text-stone-400 dark:text-[#7e7b72] hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-stone-600 dark:text-[#b8b5ac]">
                  {new Date(calYear, calMonth - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
                    else setCalMonth((m) => m + 1);
                  }}
                  className="rounded-md p-1.5 text-stone-400 dark:text-[#7e7b72] hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {/* Calendar grid */}
              <DevotionCalendar
                timezone={timezone}
                year={calYear}
                month={calMonth}
                onDateClick={handleCalendarDateClick}
                filterFrom={from || undefined}
                filterTo={to || undefined}
                hideLabel
              />
              <p className="mt-3 text-xs text-stone-400 dark:text-[#7e7b72] text-center leading-snug">
                Click a date for <strong className="text-stone-600 dark:text-stone-400">From</strong>, then <strong className="text-stone-600 dark:text-stone-400">To</strong>
              </p>
            </div>

            {(from || to) && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-700/30 bg-amber-50 dark:bg-amber-400/5 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                {from && <p><span className="opacity-60">From</span> {from}</p>}
                {to && <p><span className="opacity-60">To</span> {to}</p>}
                <button
                  type="button"
                  onClick={() => { setFrom(""); setTo(""); setNextDateTarget("from"); setPage(1); }}
                  className="mt-1 text-amber-700 dark:text-amber-300 underline hover:no-underline"
                >
                  Clear date range
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

/* ── Small helper components ── */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 px-3 py-1 text-xs text-stone-700 dark:text-stone-300">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Remove filter">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-stone-100 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-20 rounded-full bg-stone-200 dark:bg-stone-700" />
            <div className="h-2.5 w-14 rounded-full bg-stone-100 dark:bg-stone-800" />
          </div>
          <div className="h-4 w-1/2 rounded-full bg-stone-200 dark:bg-stone-700 mb-2" />
          <div className="h-3 w-3/4 rounded-full bg-stone-100 dark:bg-stone-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-6 py-16 text-center">
      <BookOpen className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-700 mb-3" />
      <p className="text-sm font-medium text-stone-700 dark:text-[#d6d3c8]">
        {hasFilters ? "No notes match your filters" : "No notes yet"}
      </p>
      <p className="mt-1 text-xs text-stone-500 dark:text-[#7e7b72]">
        {hasFilters ? "Try adjusting or clearing your search." : "Start writing to see your notes here."}
      </p>
      {hasFilters ? (
        <Button variant="link" size="sm" onClick={onClear} className="mt-3">
          Clear filters
        </Button>
      ) : (
        <Button asChild className="mt-3">
          <Link href="/devotions/new">
            <Plus className="h-4 w-4" />
            New note
          </Link>
        </Button>
      )}
    </div>
  );
}
