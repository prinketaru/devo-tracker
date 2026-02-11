"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { ForwardRefEditor } from "./ForwardRefEditor";
import { DEVOTION_CATEGORIES, DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import PrayerActionMenu from "./PrayerActionMenu";

const DEFAULT_EDITOR_WIDTH_PERCENT = 66;
const MIN_EDITOR_WIDTH_PERCENT = 30;
const MAX_EDITOR_WIDTH_PERCENT = 95;

const PRAYER_CATEGORIES = ["family", "health", "ministry", "personal", "other"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  family: "Family",
  health: "Health",
  ministry: "Ministry",
  personal: "Personal",
  other: "Other",
};

export type DevotionWorkspaceValues = {
  title: string;
  passage: string;
  content: string;
  tags: string[];
  category?: string;
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

type DevotionWorkspaceProps = {
  initialMarkdown: string;
  initialTitle?: string;
  initialPassage?: string;
  initialTags?: string[];
  initialCategory?: string;
  /** When set, a live elapsed timer is shown (timestamp when session started). */
  sessionStartedAt?: number;
};

export const DevotionWorkspace = forwardRef<
  { getValues: () => DevotionWorkspaceValues },
  DevotionWorkspaceProps
>(function DevotionWorkspace({ initialMarkdown, initialTitle = "", initialPassage = "", initialTags = [], initialCategory = "devotion", sessionStartedAt }, ref) {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [prayersLoading, setPrayersLoading] = useState(false);
  const [newPrayerText, setNewPrayerText] = useState("");
  const [newPrayerCategory, setNewPrayerCategory] = useState("personal");
  const [addingPrayer, setAddingPrayer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [prayerPanelOpen, setPrayerPanelOpen] = useState(false);
  const [prayerFilterCategory, setPrayerFilterCategory] = useState("");
  const [prayerSearchQuery, setPrayerSearchQuery] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"bible" | "prayer" | "resources">("bible");
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const [editorWidthPercent, setEditorWidthPercent] = useState(DEFAULT_EDITOR_WIDTH_PERCENT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const percent = Math.min(MAX_EDITOR_WIDTH_PERCENT, Math.max(MIN_EDITOR_WIDTH_PERCENT, (x / rect.width) * 100));
      setEditorWidthPercent(percent);
    };

    const onMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);
  const [passageQuery, setPassageQuery] = useState("");
  const [passageLoading, setPassageLoading] = useState(false);
  const [passageError, setPassageError] = useState<string | null>(null);
  const [passageResult, setPassageResult] = useState<{ canonical: string; passages: string[] } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerHidden, setTimerHidden] = useState(false);

  useEffect(() => {
    if (!sessionStartedAt || sessionStartedAt <= 0) return;
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionStartedAt]);

  const fetchPassage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = passageQuery.trim();
    if (!q || passageLoading) return;
    setPassageLoading(true);
    setPassageError(null);
    setPassageResult(null);
    try {
      const res = await fetch(`/api/esv-passage?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPassageError((data as { error?: string }).error ?? "Failed to fetch passage.");
        return;
      }
      setPassageResult({
        canonical: (data as { canonical?: string }).canonical ?? q,
        passages: (data as { passages?: string[] }).passages ?? [],
      });
    } catch {
      setPassageError("Network error. Please try again.");
    } finally {
      setPassageLoading(false);
    }
  };

  const fetchPrayerRequests = () => {
    setPrayersLoading(true);
    const url = prayerFilterCategory
      ? `/api/prayer-requests?category=${encodeURIComponent(prayerFilterCategory)}`
      : "/api/prayer-requests";
    fetch(url, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PrayerRequest[]) => setPrayerRequests(Array.isArray(data) ? data : []))
      .catch(() => setPrayerRequests([]))
      .finally(() => setPrayersLoading(false));
  };

  useEffect(() => {
    fetchPrayerRequests();
  }, [prayerFilterCategory]);

  const handleAddPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newPrayerText.trim();
    if (!text || addingPrayer) return;
    setAddingPrayer(true);
    try {
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, status: "active", category: newPrayerCategory }),
      });
      if (res.ok) {
        setNewPrayerText("");
        fetchPrayerRequests();
      }
    } catch {
      // ignore
    } finally {
      setAddingPrayer(false);
    }
  };

  const handleUpdatePrayerStatus = async (id: string, status: "active" | "answered") => {
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPrayerRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        if (status === "answered") {
          setCelebrateId(id);
          setTimeout(() => setCelebrateId(null), 2000);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleUpdatePrayerText = async (id: string) => {
    const text = editText.trim();
    if (!text) {
      setEditingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setPrayerRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, text } : r))
        );
        setEditingId(null);
        setEditText("");
      }
    } catch {
      // ignore
    }
  };

  const handleDeletePrayer = async (id: string) => {
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPrayerRequests((prev) => prev.filter((r) => r.id !== id));
        if (editingId === id) {
          setEditingId(null);
          setEditText("");
        }
      }
    } catch {
      // ignore
    }
  };

  const startEditing = (req: PrayerRequest) => {
    setEditingId(req.id);
    setEditText(req.text);
  };

  const resources = {
    bibles: [
      { name: "ESV.org", url: "https://www.esv.org/", description: "ESV text & audio (used in Bible tab)" },
      { name: "Bible Gateway (NIV, KJV, etc.)", url: "https://www.biblegateway.com/", description: "Multiple versions, search" },
      { name: "Bible.com (YouVersion)", url: "https://www.bible.com/", description: "Read, listen, plans" },
      { name: "Blue Letter Bible", url: "https://www.blueletterbible.org/", description: "Study tools, commentaries" },
      { name: "NET Bible", url: "https://netbible.org/", description: "Free study notes" },
    ],
    commentaries: [
      { name: "Matthew Henry", url: "https://www.ccel.org/ccel/henry/mhc", description: "Complete commentary on OT & NT" },
      { name: "John Calvin", url: "https://www.ccel.org/ccel/calvin/calcom", description: "Commentaries on Scripture" },
      { name: "Charles Spurgeon", url: "https://www.romans45.org/spurgeon/treasury/treasury.htm", description: "Treasury of David (Psalms)" },
      { name: "Spurgeon Sermons", url: "https://www.spurgeon.org/resource-library/", description: "Sermons & resources" },
      { name: "Barnes' Notes", url: "https://www.studylight.org/commentaries/eng/bnb.html", description: "Albert Barnes, whole Bible" },
      { name: "Gill's Exposition", url: "https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible/", description: "John Gill, verse-by-verse" },
      { name: "Jamieson-Fausset-Brown", url: "https://www.ccel.org/ccel/jamieson/jfb", description: "JFB commentary on OT & NT" },
    ],
    tools: [
      { name: "Bible Hub", url: "https://biblehub.com/", description: "Concordance, commentaries" },
      { name: "StudyLight", url: "https://www.studylight.org/", description: "Commentaries & lexicons" },
      { name: "Got Questions", url: "https://www.gotquestions.org/", description: "Q&A, topical" },
      { name: "Crosswalk", url: "https://www.crosswalk.com/", description: "Devotionals & articles" },
    ],
  };

  const titleRef = useRef<HTMLInputElement>(null);
  const passageRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const editorRef = useRef<MDXEditorMethods>(null);
  const appliedInitialMarkdownRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const current = editorRef.current.getMarkdown();
    const applied = appliedInitialMarkdownRef.current;

    const isEmpty = !current || current.trim().length === 0;
    const matchesApplied = applied != null && current === applied;

    if (isEmpty || matchesApplied) {
      editorRef.current.setMarkdown(initialMarkdown);
      appliedInitialMarkdownRef.current = initialMarkdown;
    } else if (applied == null) {
      appliedInitialMarkdownRef.current = initialMarkdown;
    }
  }, [initialMarkdown]);

  useImperativeHandle(
    ref,
    () => ({
      getValues() {
        const tagsRaw = tagsRef.current?.value?.trim() ?? "";
        const tags = tagsRaw ? tagsRaw.split(/\s*,\s*/).map((t) => t.trim()).filter(Boolean) : [];
        return {
          title: titleRef.current?.value?.trim() ?? "",
          passage: passageRef.current?.value?.trim() ?? "",
          content: editorRef.current?.getMarkdown() ?? "",
          tags,
          category: categoryRef.current?.value || undefined,
        };
      },
    }),
    []
  );

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const editorWidth = sidebarCollapsed ? 100 : editorWidthPercent;

  return (
    <section className="h-full overflow-auto safe-area-x relative">
      <div
        ref={containerRef}
        className="h-full grid grid-cols-1 gap-0 lg:flex lg:flex-row"
        style={{ "--editor-width": `${editorWidth}%` } as React.CSSProperties}
      >
        <div className="min-h-[60vh] lg:min-h-0 lg:w-[var(--editor-width)] lg:shrink-0 border-b border-stone-200 dark:border-zinc-800 lg:border-b-0 lg:border-r flex flex-col">
          <div className="h-full flex flex-col gap-3 p-3 sm:p-6">
            {sessionStartedAt != null && sessionStartedAt > 0 && (
              <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400" aria-live="polite">
                {timerHidden ? (
                  <button
                    type="button"
                    onClick={() => setTimerHidden(false)}
                    className="text-xs font-semibold uppercase tracking-[0.2em] hover:text-amber-600 dark:hover:text-amber-400"
                    title="Show timer"
                    aria-label="Show timer"
                  >
                    Show timer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTimerHidden(true)}
                    className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
                    title="Hide timer"
                    aria-label="Hide timer"
                  >
                    <span className="tabular-nums font-medium" title="Time in this session">
                      {formatElapsed(elapsedSeconds)}
                    </span>
                    <span className="text-xs">in this session</span>
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Title
                </span>
                <input
                  ref={titleRef}
                  type="text"
                  defaultValue={initialTitle}
                  placeholder="e.g. Morning with Psalm 23"
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 min-h-[44px]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Passage
                </span>
                <input
                  ref={passageRef}
                  type="text"
                  defaultValue={initialPassage}
                  placeholder="e.g. Psalm 23:1-6"
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 min-h-[44px]"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Tags
                </span>
                <input
                  ref={tagsRef}
                  type="text"
                  defaultValue={initialTags.join(", ")}
                  placeholder="e.g. Psalms, grateful heart, prayer"
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 min-h-[44px]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Category
                </span>
                <select
                  ref={categoryRef}
                  defaultValue={initialCategory}
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 min-h-[44px]"
                >
                  {DEVOTION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {DEVOTION_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex-1 min-h-[200px] lg:min-h-0">
              <ForwardRefEditor
                ref={editorRef}
                key={initialMarkdown}
                markdown={initialMarkdown}
                className="devotion-editor h-full min-h-0 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 sm:px-4 py-3 text-stone-900 dark:text-stone-100 font-sans prose prose-stone dark:prose-invert max-w-none text-base"
              />
            </div>
          </div>
        </div>

        {/* Resize handle (desktop only) */}
        {!sidebarCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={handleResizeStart}
            className="hidden lg:flex w-1 flex-shrink-0 cursor-col-resize items-center justify-center group hover:bg-amber-500/20 active:bg-amber-500/30 transition-colors touch-none"
          >
            <div className="w-0.5 h-12 rounded-full bg-stone-300 dark:bg-zinc-600 group-hover:bg-amber-500 group-hover:w-1 transition-all" />
          </div>
        )}

        {/* Expand button when sidebar collapsed (desktop) */}
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 rounded-l-lg border border-r-0 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-4 shadow-lg text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-zinc-800 transition-colors"
            title="Show Bible & resources"
            aria-label="Expand sidebar"
          >
            <span className="text-xs font-medium">◀</span>
          </button>
        )}

        <aside
          className={`min-h-0 p-3 sm:p-6 lg:flex lg:flex-col lg:min-w-0 lg:flex-1 ${sidebarCollapsed ? "lg:hidden" : ""}`}
        >
          {/* Mobile: collapsible panel so editor gets full width by default */}
          <button
            type="button"
            onClick={() => setPrayerPanelOpen((o) => !o)}
            className="lg:hidden w-full mt-4 flex items-center justify-between gap-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-left text-sm font-semibold text-stone-900 dark:text-stone-100 min-h-[44px] touch-manipulation"
            aria-expanded={prayerPanelOpen}
          >
            <span className="flex items-center gap-2">
              <span>Tools & Resources</span>
              <span className="text-stone-400 dark:text-stone-500 font-normal">
                • {sidebarTab === "bible" ? "Bible" : sidebarTab === "prayer" ? "Prayer" : "Resources"}
              </span>
            </span>
            <span className="shrink-0 text-stone-400 dark:text-stone-500" aria-hidden>
              {prayerPanelOpen ? "▼" : "▶"}
            </span>
          </button>
          <div
            className={`mt-4 lg:mt-0 max-h-[75vh] lg:max-h-none flex-1 min-h-0 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 sm:p-4 text-sm text-stone-700 dark:text-stone-200 overflow-auto flex flex-col ${prayerPanelOpen ? "flex" : "hidden lg:flex"}`}
          >
            {/* Tab switcher and collapse (desktop) */}
            <div className="flex items-center gap-2 mb-3">
            <div className="flex flex-1 min-w-0 rounded-lg border border-stone-200 dark:border-zinc-700 p-0.5 bg-stone-100 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setSidebarTab("bible")}
                className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors min-h-[40px] sm:min-h-[36px] touch-manipulation ${sidebarTab === "bible" ? "bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"}`}
              >
                Bible
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("prayer")}
                className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors min-h-[40px] sm:min-h-[36px] touch-manipulation ${sidebarTab === "prayer" ? "bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"}`}
              >
                Prayer
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("resources")}
                className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors min-h-[40px] sm:min-h-[36px] touch-manipulation ${sidebarTab === "resources" ? "bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"}`}
              >
                Resources
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:flex shrink-0 rounded-md border border-stone-200 dark:border-zinc-700 p-2 text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-zinc-800 transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <span className="text-xs">▶</span>
            </button>
            </div>

            {sidebarTab === "bible" && (
              <div className="space-y-3 flex-1 min-h-0 flex flex-col overflow-auto">
                <h3 className="hidden lg:block text-base font-semibold text-stone-900 dark:text-stone-100">
                  Look up passage (ESV)
                </h3>
                <form onSubmit={fetchPassage} className="flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={passageQuery}
                    onChange={(e) => setPassageQuery(e.target.value)}
                    placeholder="e.g. John 3:16"
                    className="flex-1 min-w-0 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-1 focus:ring-inset focus:ring-amber-500/70 min-h-[40px]"
                    disabled={passageLoading}
                  />
                  <button
                    type="submit"
                    disabled={!passageQuery.trim() || passageLoading}
                    className="shrink-0 rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] touch-manipulation"
                  >
                    {passageLoading ? "…" : "Fetch"}
                  </button>
                </form>
                {passageError && (
                  <p className="text-xs text-red-600 dark:text-red-400 shrink-0">{passageError}</p>
                )}
                {passageResult && (
                  <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 p-3 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
                      {passageResult.canonical}
                    </p>
                    <div
                      className="esv-passage text-sm text-stone-700 dark:text-stone-200 leading-relaxed"
                      style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif" }}
                      dangerouslySetInnerHTML={{ __html: passageResult.passages.join("") }}
                    />
                    <p className="mt-3 pt-3 border-t border-stone-200 dark:border-zinc-700 text-[10px] text-stone-500 dark:text-stone-400 leading-snug">
                      Scripture quotations are from the{" "}
                      <a
                        href="https://www.esv.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        ESV® Bible
                      </a>{" "}
                      (The Holy Bible, English Standard Version®), © 2001 by Crossway.
                    </p>
                  </div>
                )}
                {!passageResult && !passageError && !passageLoading && (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Enter a reference (e.g. John 3:16) and click Fetch.
                  </p>
                )}
              </div>
            )}

            {sidebarTab === "prayer" && (
            <div className="space-y-2 flex-1 min-h-0 flex flex-col">
              <h3 className="hidden lg:block text-base font-semibold text-stone-900 dark:text-stone-100">
                Prayer Requests
              </h3>

              {/* Search Bar */}
              <div className="shrink-0">
                <input
                  type="text"
                  value={prayerSearchQuery}
                  onChange={(e) => setPrayerSearchQuery(e.target.value)}
                  placeholder="Search prayers..."
                  className="w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-1 focus:ring-amber-500/70 min-h-[36px]"
                />
              </div>

              {/* Category Filters */}
              {PRAYER_CATEGORIES.length > 1 && (
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPrayerFilterCategory("")}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      !prayerFilterCategory
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
                      onClick={() => setPrayerFilterCategory(c)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors capitalize ${
                        prayerFilterCategory === c
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                          : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {CATEGORY_LABELS[c] ?? c}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddPrayer} className="flex flex-col sm:flex-row gap-2 shrink-0">
                <input
                  type="text"
                  value={newPrayerText}
                  onChange={(e) => setNewPrayerText(e.target.value)}
                  placeholder="Add request..."
                  className="flex-1 min-w-0 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm sm:text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-1 focus:ring-amber-500/70 min-h-[40px]"
                  disabled={addingPrayer}
                />
                <select
                  value={newPrayerCategory}
                  onChange={(e) => setNewPrayerCategory(e.target.value)}
                  className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-2 text-xs text-stone-900 dark:text-stone-100 outline-none focus:ring-1 focus:ring-amber-500/70 min-h-[40px] min-w-[70px]"
                >
                  {PRAYER_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c] ?? c}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!newPrayerText.trim() || addingPrayer}
                  className="shrink-0 rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                >
                  {addingPrayer ? "..." : "Add"}
                </button>
              </form>

                {prayersLoading ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400">Loading...</p>
                ) : prayerRequests.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-stone-300 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 p-3 text-center">
                    <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                      No prayer requests
                    </p>
                    <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-500">
                      Add your first prayer above
                    </p>
                  </div>
                ) : prayerRequests.filter((r) => {
                  if (!prayerSearchQuery) return true;
                  return r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase());
                }).length === 0 ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400 text-center py-2">
                    No matching prayers
                  </p>
                ) : (
                  <ul className="space-y-2 flex-1 min-h-0 overflow-auto">
                    {prayerRequests
                      .filter((r) => {
                        if (!prayerSearchQuery) return r.status === "active";
                        return r.status === "active" && r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase());
                      })
                      .map((req) => (
                        <li
                          key={req.id}
                          className={`group rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 px-3 py-2 text-xs transition-all ${
                            celebrateId === req.id ? "scale-105 border-green-400 dark:border-green-600 shadow-md" : ""
                          }`}
                        >
                          {editingId === req.id ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm sm:text-xs text-stone-900 dark:text-stone-100 outline-none focus:ring-1 focus:ring-amber-500/70"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleUpdatePrayerText(req.id);
                                  if (e.key === "Escape") {
                                    setEditingId(null);
                                    setEditText("");
                                  }
                                }}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePrayerText(req.id)}
                                  className="rounded px-2 py-1 text-[10px] font-medium bg-amber-600 text-white hover:bg-amber-700"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditText("");
                                  }}
                                  className="rounded px-2 py-1 text-[10px] font-medium text-stone-600 bg-stone-200 dark:text-stone-300 dark:bg-zinc-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-start gap-2">
                                <span className="flex-1 min-w-0 text-stone-700 dark:text-stone-200 text-xs break-words leading-relaxed">
                                  {req.text}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                  {getRelativeTime(req.createdAt)}
                                </span>
                                <div className="flex shrink-0 gap-1">
                                  <PrayerActionMenu
                                    onEdit={() => startEditing(req)}
                                    onAnswered={() => handleUpdatePrayerStatus(req.id, "answered")}
                                    onDelete={() => handleDeletePrayer(req.id)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    {prayerRequests.filter((r) => {
                      if (!prayerSearchQuery) return r.status === "answered";
                      return r.status === "answered" && r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase());
                    }).length > 0 && (
                      <>
                        <p className="pt-2 text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-500 flex items-center gap-1">
                          <span>✓</span> Answered ({prayerRequests.filter((r) => r.status === "answered").length})
                        </p>
                        {prayerRequests
                          .filter((r) => {
                            if (!prayerSearchQuery) return r.status === "answered";
                            return r.status === "answered" && r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase());
                          })
                          .map((req) => (
                            <li
                              key={req.id}
                              className="group rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 px-3 py-2 text-xs"
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex items-start gap-2">
                                  <span className="flex-1 min-w-0 text-stone-500 dark:text-stone-400 line-through break-words text-xs leading-relaxed">
                                    {req.text}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                    {getRelativeTime(req.createdAt)}
                                  </span>
                                  <div className="flex shrink-0 gap-1">
                                    <PrayerActionMenu
                                      onRestore={() => handleUpdatePrayerStatus(req.id, "active")}
                                      onDelete={() => handleDeletePrayer(req.id)}
                                      isAnswered={true}
                                    />
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                      </>
                    )}
                  </ul>
                )}
              </div>
            )}

            {sidebarTab === "resources" && (
              <div className="space-y-4 flex-1 min-h-0 overflow-auto">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Bibles &amp; tools
                </h3>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                    Bibles
                  </p>
                  <ul className="space-y-2">
                    {resources.bibles.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">{item.description}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                    Commentaries
                  </p>
                  <ul className="space-y-2">
                    {resources.commentaries.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">{item.description}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                    Study &amp; tools
                  </p>
                  <ul className="space-y-2">
                    {resources.tools.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">{item.description}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
});
