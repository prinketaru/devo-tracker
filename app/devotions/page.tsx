"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { DevotionCard } from "@/app/components/DevotionCard";
import { DevotionCalendar } from "@/app/components/DevotionCalendar";

type DevotionItem = {
  id: string;
  date: string;
  title: string;
  passage: string;
  content: string;
  summary?: string;
  tags?: string[];
  minutesSpent?: number;
};

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
  const [timezone, setTimezone] = useState("UTC");
  const [nextDateTarget, setNextDateTarget] = useState<"from" | "to">("from");
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  const limit = 20;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (tag) params.set("tag", tag);
    setLoading(true);
    fetch(`/api/devotions?${params}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data: { devotions?: DevotionItem[]; total?: number } | null) => {
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
  }, [page, search, from, to, tag, router]);

  useEffect(() => {
    fetch("/api/user/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { timezone?: string } | null) => {
        if (data?.timezone) setTimezone(data.timezone);
      })
      .catch(() => {});
  }, []);

  const applyFilters = () => {
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
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">All Devotions</h1>
          <Link
            href="/dashboard"
            className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Search title, passage, content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="flex-1 min-w-[160px] rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="w-24 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Apply
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
            ) : devotions.length === 0 ? (
              <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
                <p className="text-stone-600 dark:text-stone-400">No devotions match.</p>
                <Link href="/devotions/new" className="mt-4 inline-block text-amber-600 dark:text-amber-400 hover:underline">
                  Create one
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {devotions.map((d) => (
                    <DevotionCard
                      key={d.id}
                      devotion={{
                        id: d.id,
                        date: d.date,
                        title: d.title || "Untitled",
                        passage: d.passage || "—",
                        summary: d.summary ?? summarize(d.content ?? ""),
                        minutesSpent: d.minutesSpent,
                      }}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-md border border-stone-200 dark:border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-md border border-stone-200 dark:border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Click a date for <strong>From</strong>, then for <strong>To</strong>.
            </p>
            <DevotionCalendar
              timezone={timezone}
              year={calYear}
              month={calMonth}
              onDateClick={handleCalendarDateClick}
              filterFrom={from || undefined}
              filterTo={to || undefined}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 1) {
                    setCalYear((y) => y - 1);
                    setCalMonth(12);
                  } else setCalMonth((m) => m - 1);
                }}
                className="rounded-md border border-stone-200 dark:border-zinc-700 px-3 py-1.5 text-sm"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 12) {
                    setCalYear((y) => y + 1);
                    setCalMonth(1);
                  } else setCalMonth((m) => m + 1);
                }}
                className="rounded-md border border-stone-200 dark:border-zinc-700 px-3 py-1.5 text-sm"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
