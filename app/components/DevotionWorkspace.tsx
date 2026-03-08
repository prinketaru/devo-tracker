"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback } from "react";
import { PenLine, BookOpen, Heart, Library } from "lucide-react";
import type { ProseKitEditorHandle } from "./ProseKitEditor";
import { ForwardRefEditor } from "./ForwardRefEditor";
import { DEVOTION_CATEGORIES, DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import PrayerActionMenu from "./PrayerActionMenu";

const DEFAULT_EDITOR_WIDTH_PERCENT = 80;
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
  content: string;
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
  initialTags?: string[];
  initialCategory?: string;
  passageQuery?: string;
  /** When set, a live elapsed timer is shown (timestamp when session started). */
  sessionStartedAt?: number;
  onChangeMetadata?: (tags: string[], category: string) => void;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
};

export const DevotionWorkspace = forwardRef<
  { getValues: () => DevotionWorkspaceValues },
  DevotionWorkspaceProps
>(function DevotionWorkspace({ initialMarkdown, initialTags = [], initialCategory = "devotion", passageQuery: externalPassageQuery = "", sessionStartedAt, onChangeMetadata, sidebarCollapsed: externalSidebarCollapsed, onSidebarCollapsedChange }, ref) {
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
  const [showAnsweredInEditor, setShowAnsweredInEditor] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"bible" | "prayer" | "resources">("bible");
  const [mobileTab, setMobileTab] = useState<"write" | "bible" | "prayer" | "resources">("write");
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const [editorWidthPercent, setEditorWidthPercent] = useState(DEFAULT_EDITOR_WIDTH_PERCENT);
  const [localSidebarCollapsed, setLocalSidebarCollapsed] = useState(false);
  const sidebarCollapsed = externalSidebarCollapsed !== undefined ? externalSidebarCollapsed : localSidebarCollapsed;
  const setSidebarCollapsed = (value: boolean) => {
    if (externalSidebarCollapsed !== undefined) {
      onSidebarCollapsedChange?.(value);
    } else {
      setLocalSidebarCollapsed(value);
    }
  };
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
  const [passageQuery, setPassageQuery] = useState(externalPassageQuery);
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

  useEffect(() => {
    setPassageQuery(externalPassageQuery);
  }, [externalPassageQuery]);

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

  const categoryRef = useRef<HTMLSelectElement>(null);
  const editorRef = useRef<ProseKitEditorHandle>(null);
  const appliedInitialMarkdownRef = useRef<string | null>(null);

  // Tag chip state — must be declared before useImperativeHandle so tagsStateRef can close over it
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialTags);
  const tagsStateRef = useRef<string[]>(initialTags);
  useEffect(() => { tagsStateRef.current = tags; }, [tags]);

  useEffect(() => {
    if (!editorRef.current) return;
    // Only apply the initial markdown if the editor is empty or if it matches previously applied markdown
    const applied = appliedInitialMarkdownRef.current;
    if (applied == null) {
      editorRef.current.setMarkdown(initialMarkdown);
      appliedInitialMarkdownRef.current = initialMarkdown;
    } else if (initialMarkdown !== applied) {
      editorRef.current.setMarkdown(initialMarkdown);
      appliedInitialMarkdownRef.current = initialMarkdown;
    }
  }, [initialMarkdown]);

  // Expose values to parent (just content now, other fields are lifted)
  useImperativeHandle(ref, () => ({
    getValues: () => {
      return {
        content: editorRef.current?.getMarkdown() ?? initialMarkdown,
      };
    },
  }));

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

  const handleMobileTabChange = (tab: "write" | "bible" | "prayer" | "resources") => {
    setMobileTab(tab);
    if (tab !== "write") {
      setSidebarTab(tab as "bible" | "prayer" | "resources");
    }
  };

  const addTag = (raw: string) => {
    const newTags = raw.split(/\s*,\s*/).map(t => t.trim()).filter(Boolean);
    const merged = Array.from(new Set([...tags, ...newTags]));
    setTags(merged);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    setTagInput(next.join(", "));
  };

  return (
    <section className="h-full overflow-hidden safe-area-x relative flex flex-col">
      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex flex-col lg:flex-row"
        style={{ "--editor-width": `${editorWidth}%` } as React.CSSProperties}
      >
        {/* ── Main editor column ─────────────────────────────────────────── */}
        <div className={`${mobileTab === "write" ? "flex flex-col flex-1" : "hidden"} lg:flex lg:flex-col lg:min-h-0 lg:w-[var(--editor-width)] lg:shrink-0 lg:flex-none border-stone-200 dark:border-[#2a2720] lg:border-b-0 overflow-hidden`}>

          {/* Editor fills the rest */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ForwardRefEditor
              ref={editorRef}
              key={initialMarkdown}
              markdown={initialMarkdown}
              className="devotion-editor h-full min-h-0"
            />
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


        <aside
          className={`min-h-0 ${mobileTab !== "write" ? "flex flex-col flex-1" : "hidden"} lg:flex lg:flex-col lg:min-w-0 lg:flex-1 ${sidebarCollapsed ? "lg:hidden" : ""}`}
        >
          <div
            className="flex-1 min-h-0 border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-[#2a2720] bg-stone-50/30 dark:bg-[#1e1c18]/30 p-4 sm:p-6 sm:pt-0 text-sm text-stone-700 dark:text-stone-200 overflow-auto flex flex-col relative"
          >
            {/* Tab switcher — desktop only; mobile uses the bottom nav bar */}
            <div className="hidden lg:flex items-center gap-0 mb-3 border-b border-stone-200 dark:border-[#2a2720] -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex flex-1 min-w-0 -mx-4 sm:-mx-6">
                <button
                  type="button"
                  onClick={() => setSidebarTab("bible")}
                  className={`flex-1 px-4 sm:px-6 py-3 text-xs font-medium transition-colors touch-manipulation ${sidebarTab === "bible" ? "bg-stone-50/50 dark:bg-[#1e1c18]/50 text-stone-900 border-b-2 border-[#f0a531] dark:text-[#d6d3c8]" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-[#1e1c18]/50 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-stone-200 border-b-2 border-transparent"}`}
                >
                  Bible
                </button>
                <div className="w-px bg-stone-200 dark:bg-[#2a2720]" />
                <button
                  type="button"
                  onClick={() => setSidebarTab("prayer")}
                  className={`flex-1 px-4 sm:px-6 py-3 text-xs font-medium transition-colors touch-manipulation ${sidebarTab === "prayer" ? "bg-stone-50/50 dark:bg-[#1e1c18]/50 text-stone-900 border-b-2 border-[#f0a531] dark:text-[#d6d3c8]" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-[#1e1c18]/50 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-stone-200 border-b-2 border-transparent"}`}
                >
                  Prayer
                </button>
                <div className="w-px bg-stone-200 dark:bg-[#2a2720]" />
                <button
                  type="button"
                  onClick={() => setSidebarTab("resources")}
                  className={`flex-1 px-4 sm:px-6 py-3 text-xs font-medium transition-colors touch-manipulation ${sidebarTab === "resources" ? "bg-stone-50/50 dark:bg-[#1e1c18]/50 text-stone-900 border-b-2 border-[#f0a531] dark:text-[#d6d3c8]" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-[#1e1c18]/50 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-stone-200 border-b-2 border-transparent"}`}
                >
                  Resources
                </button>
              </div>
            </div>

            {sidebarTab === "bible" && (
              <div className="space-y-3 flex-1 min-h-0 flex flex-col overflow-auto">
                <h3 className="hidden lg:block text-base font-semibold text-stone-900 dark:text-[#d6d3c8]">
                  Look up passage (ESV)
                </h3>
                <form onSubmit={fetchPassage} className="flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={passageQuery}
                    onChange={(e) => setPassageQuery(e.target.value)}
                    placeholder="e.g. John 3:16"
                    className="flex-1 min-w-0 rounded-md border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-3 py-2 text-sm text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 outline-none focus:ring-1 focus:ring-inset focus:ring-amber-500/70 min-h-[40px]"
                    disabled={passageLoading}
                  />
                  <button
                    type="submit"
                    disabled={!passageQuery.trim() || passageLoading}
                    className="shrink-0 rounded-md bg-[#f0a531] px-3 py-2 text-xs font-medium text-stone-900 hover:bg-[#c0831a] disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] touch-manipulation"
                  >
                    {passageLoading ? "…" : "Fetch"}
                  </button>
                </form>
                {passageError && (
                  <p className="text-xs text-red-600 dark:text-red-400 shrink-0">{passageError}</p>
                )}
                {passageResult && (
                  <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50/50 dark:bg-[#1e1c18]/50 p-3 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
                      {passageResult.canonical}
                    </p>
                    <div
                      className="esv-passage text-sm text-stone-700 dark:text-stone-200 leading-relaxed"
                      style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif" }}
                      dangerouslySetInnerHTML={{ __html: passageResult.passages.join("") }}
                    />
                    <p className="mt-3 pt-3 border-t border-stone-200 dark:border-[#2a2720] text-[10px] text-stone-500 dark:text-[#7e7b72] leading-snug">
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
                  <p className="text-xs text-stone-500 dark:text-[#7e7b72]">
                    Enter a reference (e.g. John 3:16) and click Fetch.
                  </p>
                )}
              </div>
            )}

            {sidebarTab === "prayer" && (
              <div className="flex flex-col flex-1 min-h-0 gap-2.5">

                {/* Header row */}
                <div className="hidden lg:flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-[#d6d3c8]">Prayer Requests</h3>
                  {prayerRequests.filter(r => r.status === "active").length > 0 && (
                    <span className="rounded-full bg-amber-100 dark:bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      {prayerRequests.filter(r => r.status === "active").length} active
                    </span>
                  )}
                </div>

                {/* Add form */}
                <form onSubmit={handleAddPrayer} className="shrink-0 space-y-2">
                  <input
                    type="text"
                    value={newPrayerText}
                    onChange={(e) => setNewPrayerText(e.target.value)}
                    placeholder="New prayer request…"
                    className="w-full rounded-lg border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-3 py-2 text-xs text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 dark:placeholder:text-[#5a574f] outline-none focus:ring-1 focus:ring-amber-500/70"
                    disabled={addingPrayer}
                  />
                  <div className="flex gap-2">
                    <select
                      value={newPrayerCategory}
                      onChange={(e) => setNewPrayerCategory(e.target.value)}
                      className="flex-1 min-w-0 rounded-lg border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-2 py-1.5 text-xs text-stone-900 dark:text-[#d6d3c8] outline-none focus:ring-1 focus:ring-amber-500/70"
                    >
                      {PRAYER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!newPrayerText.trim() || addingPrayer}
                      className="shrink-0 rounded-lg bg-[#f0a531] px-3 py-1.5 text-xs font-semibold text-stone-900 hover:bg-[#c0831a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {addingPrayer ? "…" : "Add"}
                    </button>
                  </div>
                </form>

                {/* Search + category filters */}
                <div className="shrink-0 space-y-2">
                  <input
                    type="text"
                    value={prayerSearchQuery}
                    onChange={(e) => setPrayerSearchQuery(e.target.value)}
                    placeholder="Search prayers…"
                    className="w-full rounded-lg border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-3 py-1.5 text-xs text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 dark:placeholder:text-[#5a574f] outline-none focus:ring-1 focus:ring-amber-500/70"
                  />
                  {PRAYER_CATEGORIES.length > 1 && (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setPrayerFilterCategory("")}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                          !prayerFilterCategory
                            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                            : "bg-stone-100 dark:bg-[#2a2720] text-stone-500 dark:text-[#7e7b72] hover:bg-stone-200 dark:hover:bg-[#3a3629]"
                        }`}
                      >
                        All
                      </button>
                      {PRAYER_CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPrayerFilterCategory(c)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors capitalize ${
                            prayerFilterCategory === c
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                              : "bg-stone-100 dark:bg-[#2a2720] text-stone-500 dark:text-[#7e7b72] hover:bg-stone-200 dark:hover:bg-[#3a3629]"
                          }`}
                        >
                          {CATEGORY_LABELS[c] ?? c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* List */}
                {prayersLoading ? (
                  <p className="text-xs text-stone-400 dark:text-[#7e7b72]">Loading…</p>
                ) : prayerRequests.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-200 dark:border-[#2a2720] py-8 text-center">
                    <span className="text-2xl">🙏</span>
                    <p className="text-xs font-medium text-stone-500 dark:text-[#7e7b72]">No prayer requests yet</p>
                    <p className="text-[10px] text-stone-400 dark:text-[#5a574f]">Add your first one above</p>
                  </div>
                ) : prayerRequests.filter((r) => {
                  if (r.status !== "active") return false;
                  if (prayerFilterCategory && r.category !== prayerFilterCategory) return false;
                  if (prayerSearchQuery && !r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase())) return false;
                  return true;
                }).length === 0 && !prayerRequests.some(r => r.status === "answered" && (!prayerSearchQuery || r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase()))) ? (
                  <p className="text-xs text-stone-400 dark:text-[#7e7b72] text-center py-4">No matching prayers</p>
                ) : (
                  <ul className="flex-1 min-h-0 overflow-auto space-y-1.5">

                    {/* Active requests */}
                    {prayerRequests
                      .filter((r) => {
                        if (r.status !== "active") return false;
                        if (prayerFilterCategory && r.category !== prayerFilterCategory) return false;
                        if (prayerSearchQuery && !r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase())) return false;
                        return true;
                      })
                      .map((req) => (
                        <li
                          key={req.id}
                          className={`group flex items-stretch rounded-lg border overflow-hidden transition-all ${
                            celebrateId === req.id
                              ? "border-green-400 dark:border-green-600 shadow-sm"
                              : "border-stone-200 dark:border-[#2a2720]"
                          }`}
                        >
                          <div className={`w-1 shrink-0 ${
                            celebrateId === req.id ? "bg-green-400 dark:bg-green-600" : "bg-amber-300 dark:bg-amber-600/60"
                          }`} />
                          <div className="flex-1 min-w-0 bg-white dark:bg-[#1e1c18] px-2.5 py-2">
                            {editingId === req.id ? (
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full rounded-md border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-2 py-1.5 text-xs text-stone-900 dark:text-[#d6d3c8] outline-none focus:ring-1 focus:ring-amber-500/70"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleUpdatePrayerText(req.id);
                                    if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                                  }}
                                />
                                <div className="flex gap-1.5">
                                  <button type="button" onClick={() => handleUpdatePrayerText(req.id)} className="rounded px-2 py-0.5 text-[10px] font-semibold bg-[#f0a531] text-stone-900 hover:bg-[#c0831a]">Save</button>
                                  <button type="button" onClick={() => { setEditingId(null); setEditText(""); }} className="rounded px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:text-[#b8b5ac] bg-stone-100 dark:bg-[#2a2720] hover:bg-stone-200 dark:hover:bg-[#3a3629]">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs text-stone-800 dark:text-[#d6d3c8] wrap-break-word leading-relaxed">{req.text}</p>
                                <div className="flex items-center justify-between gap-1 mt-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                    {req.category && (
                                      <span className="shrink-0 rounded-full bg-stone-100 dark:bg-[#2a2720] px-1.5 py-0.5 text-[9px] font-medium text-stone-500 dark:text-[#7e7b72] capitalize">
                                        {CATEGORY_LABELS[req.category] ?? req.category}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-stone-400 dark:text-[#5a574f] truncate">{getRelativeTime(req.createdAt)}</span>
                                  </div>
                                  <PrayerActionMenu
                                    onEdit={() => startEditing(req)}
                                    onAnswered={() => handleUpdatePrayerStatus(req.id, "answered")}
                                    onDelete={() => handleDeletePrayer(req.id)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </li>
                      ))}

                    {/* Answered section */}
                    {prayerRequests.filter((r) => {
                      if (r.status !== "answered") return false;
                      if (prayerSearchQuery && !r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase())) return false;
                      return true;
                    }).length > 0 && (
                      <>
                        <li>
                          <button
                            type="button"
                            onClick={() => setShowAnsweredInEditor((v) => !v)}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 hover:bg-green-100/70 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-700 dark:text-green-400">
                              <span>✓</span>
                              Answered — {prayerRequests.filter(r => r.status === "answered").length}
                            </span>
                            <span className="text-[10px] text-stone-400 dark:text-[#5a574f]">
                              {showAnsweredInEditor ? "Hide" : "Show"}
                            </span>
                          </button>
                        </li>
                        {showAnsweredInEditor && prayerRequests
                          .filter((r) => {
                            if (r.status !== "answered") return false;
                            if (prayerSearchQuery && !r.text.toLowerCase().includes(prayerSearchQuery.toLowerCase())) return false;
                            return true;
                          })
                          .map((req) => (
                            <li
                              key={req.id}
                              className="group flex items-stretch rounded-lg border border-stone-200 dark:border-[#2a2720] overflow-hidden"
                            >
                              <div className="w-1 shrink-0 bg-green-300 dark:bg-green-700/60" />
                              <div className="flex-1 min-w-0 bg-white dark:bg-[#1e1c18] px-2.5 py-2">
                                <p className="text-xs text-stone-400 dark:text-[#5a574f] line-through wrap-break-word leading-relaxed">{req.text}</p>
                                <div className="flex items-center justify-between gap-1 mt-1.5">
                                  <span className="text-[10px] text-stone-400 dark:text-[#5a574f]">{getRelativeTime(req.createdAt)}</span>
                                  <PrayerActionMenu
                                    onRestore={() => handleUpdatePrayerStatus(req.id, "active")}
                                    onDelete={() => handleDeletePrayer(req.id)}
                                    isAnswered={true}
                                  />
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
                <h3 className="text-base font-semibold text-stone-900 dark:text-[#d6d3c8]">
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
                          className="block rounded-lg border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-3 py-2.5 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="block text-xs text-stone-500 dark:text-[#7e7b72] mt-0.5">{item.description}</span>
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
                          className="block rounded-lg border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-3 py-2.5 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="block text-xs text-stone-500 dark:text-[#7e7b72] mt-0.5">{item.description}</span>
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
                          className="block rounded-lg border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-3 py-2.5 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="block text-xs text-stone-500 dark:text-[#7e7b72] mt-0.5">{item.description}</span>
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

      {/* ── Mobile bottom tab bar ──────────────────────────────────────── */}
      <nav className="lg:hidden shrink-0 flex items-stretch border-t border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510]">
        {(
          [
            { id: "write", label: "Write", Icon: PenLine },
            { id: "bible", label: "Bible", Icon: BookOpen },
            { id: "prayer", label: "Prayer", Icon: Heart },
            { id: "resources", label: "Resources", Icon: Library },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleMobileTabChange(id)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors touch-manipulation min-h-[52px] ${
              mobileTab === id
                ? "text-[#f0a531]"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </section>
  );
});
