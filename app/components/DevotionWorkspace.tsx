"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { ForwardRefEditor } from "./ForwardRefEditor";

export type DevotionWorkspaceValues = {
  title: string;
  passage: string;
  content: string;
  tags: string[];
};

type PrayerRequest = {
  id: string;
  text: string;
  status: "active" | "answered";
};

type DevotionWorkspaceProps = {
  initialMarkdown: string;
  initialTitle?: string;
  initialPassage?: string;
  initialTags?: string[];
  /** When set, a live elapsed timer is shown (timestamp when session started). */
  sessionStartedAt?: number;
};

export const DevotionWorkspace = forwardRef<
  { getValues: () => DevotionWorkspaceValues },
  DevotionWorkspaceProps
>(function DevotionWorkspace({ initialMarkdown, initialTitle = "", initialPassage = "", initialTags = [], sessionStartedAt }, ref) {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [prayersLoading, setPrayersLoading] = useState(false);
  const [newPrayerText, setNewPrayerText] = useState("");
  const [addingPrayer, setAddingPrayer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [prayerPanelOpen, setPrayerPanelOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"bible" | "prayer" | "resources">("bible");
  const [passageQuery, setPassageQuery] = useState("");
  const [passageLoading, setPassageLoading] = useState(false);
  const [passageError, setPassageError] = useState<string | null>(null);
  const [passageResult, setPassageResult] = useState<{ canonical: string; passages: string[] } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
    fetch("/api/prayer-requests", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PrayerRequest[]) => setPrayerRequests(Array.isArray(data) ? data : []))
      .catch(() => setPrayerRequests([]))
      .finally(() => setPrayersLoading(false));
  };

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

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
        body: JSON.stringify({ text, status: "active" }),
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
  const editorRef = useRef<MDXEditorMethods>(null);

  useImperativeHandle(
    ref,
    () => ({
      getValues() {
        const tagsRaw = tagsRef.current?.value?.trim() ?? "";
        const tags = tagsRaw ? tagsRaw.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean) : [];
        return {
          title: titleRef.current?.value?.trim() ?? "",
          passage: passageRef.current?.value?.trim() ?? "",
          content: editorRef.current?.getMarkdown() ?? "",
          tags,
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

  return (
    <section className="h-full overflow-auto safe-area-x">
      <div className="h-full grid grid-cols-1 gap-0 lg:grid-cols-[2fr_1fr]">
        <div className="min-h-[60vh] lg:min-h-0 border-b border-stone-200 dark:border-zinc-800 lg:border-b-0 lg:border-r flex flex-col">
          <div className="h-full flex flex-col gap-3 p-3 sm:p-6">
            {sessionStartedAt != null && sessionStartedAt > 0 && (
              <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400" aria-live="polite">
                <span className="tabular-nums font-medium" title="Time in this session">
                  {formatElapsed(elapsedSeconds)}
                </span>
                <span className="text-xs">in this session</span>
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
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Tags
              </span>
              <input
                ref={tagsRef}
                type="text"
                defaultValue={initialTags.join(", ")}
                placeholder="e.g. Psalms, gratitude"
                className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 min-h-[44px]"
              />
            </label>

            <div className="flex-1 min-h-[200px] lg:min-h-0">
              <ForwardRefEditor
                ref={editorRef}
                markdown={initialMarkdown}
                className="devotion-editor h-full min-h-0 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 sm:px-4 py-3 text-stone-900 dark:text-stone-100 font-sans prose prose-stone dark:prose-invert max-w-none text-base"
              />
            </div>
          </div>
        </div>

        <aside className="min-h-0 p-3 sm:p-6 lg:flex lg:flex-col">
          {/* Mobile: collapsible panel so editor gets full width by default */}
          <button
            type="button"
            onClick={() => setPrayerPanelOpen((o) => !o)}
            className="lg:hidden w-full mt-4 flex items-center justify-between gap-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-left text-base font-semibold text-stone-900 dark:text-stone-100 min-h-[48px] touch-manipulation"
            aria-expanded={prayerPanelOpen}
          >
            <span>
              {sidebarTab === "bible" ? "Bible" : sidebarTab === "prayer" ? "Prayer requests" : "Resources"}
            </span>
            {sidebarTab === "prayer" && (
              <span className="text-stone-500 dark:text-stone-400 text-sm font-normal">
                {prayerRequests.filter((r) => r.status === "active").length} active
              </span>
            )}
            <span className="shrink-0 text-stone-400 dark:text-stone-500" aria-hidden>
              {prayerPanelOpen ? "▼" : "▶"}
            </span>
          </button>
          <div
            className={`mt-4 lg:mt-0 max-h-[45vh] lg:max-h-none flex-1 min-h-0 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 sm:p-4 text-sm text-stone-700 dark:text-stone-200 overflow-auto flex flex-col ${prayerPanelOpen ? "flex" : "hidden lg:flex"}`}
          >
            {/* Tab switcher */}
            <div className="flex rounded-lg border border-stone-200 dark:border-zinc-700 p-0.5 mb-3 bg-stone-100 dark:bg-zinc-800">
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
                    placeholder="e.g. John 3:16, Psalm 23, Genesis 1-3"
                    className="flex-1 min-w-0 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-500/70 min-h-[44px]"
                    disabled={passageLoading}
                  />
                  <button
                    type="submit"
                    disabled={!passageQuery.trim() || passageLoading}
                    className="shrink-0 rounded-md bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                  >
                    {passageLoading ? "…" : "Fetch"}
                  </button>
                </form>
                {passageError && (
                  <p className="text-sm text-red-600 dark:text-red-400 shrink-0">{passageError}</p>
                )}
                {passageResult && (
                  <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 p-3 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
                      {passageResult.canonical}
                    </p>
                    <div
                      className="esv-passage text-sm text-stone-700 dark:text-stone-200 font-serif leading-relaxed"
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
                      (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved. The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. The ESV may not be translated into any other language.
                    </p>
                  </div>
                )}
                {!passageResult && !passageError && !passageLoading && (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Enter a reference (e.g. John 3:16, Psalm 23, Romans 8:28–39) and click Fetch.
                  </p>
                )}
              </div>
            )}

            {sidebarTab === "prayer" && (
            <div className="space-y-3 flex-1 min-h-0 flex flex-col">
              <h3 className="hidden lg:block text-base font-semibold text-stone-900 dark:text-stone-100">
                Prayer Requests
              </h3>

              <form onSubmit={handleAddPrayer} className="flex gap-2 shrink-0">
                <input
                  type="text"
                  value={newPrayerText}
                  onChange={(e) => setNewPrayerText(e.target.value)}
                  placeholder="Add a prayer request..."
                  className="flex-1 min-w-0 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-1 focus:ring-amber-500/70 min-h-[44px]"
                  disabled={addingPrayer}
                />
                <button
                  type="submit"
                  disabled={!newPrayerText.trim() || addingPrayer}
                  className="shrink-0 rounded-md bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {addingPrayer ? "..." : "Add"}
                </button>
              </form>

                {prayersLoading ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400">Loading...</p>
                ) : prayerRequests.length === 0 ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    No prayer requests yet. Add one above.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {prayerRequests
                      .filter((r) => r.status === "active")
                      .map((req) => (
                        <li
                          key={req.id}
                          className="group rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 px-3 py-2 sm:px-2 sm:py-1.5 text-xs"
                        >
                          {editingId === req.id ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base sm:text-xs text-stone-900 dark:text-stone-100 outline-none focus:ring-1 focus:ring-amber-500/70 min-h-[44px]"
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
                                  className="rounded px-3 py-2 min-h-[44px] text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditText("");
                                  }}
                                  className="rounded px-3 py-2 min-h-[44px] text-sm font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <span className="flex-1 min-w-0 text-stone-700 dark:text-stone-200 sm:text-xs break-words">
                                {req.text}
                              </span>
                              <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => startEditing(req)}
                                  className="rounded px-2 py-1 text-xs text-stone-500 hover:bg-stone-200 dark:hover:bg-zinc-700"
                                  title="Edit"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePrayerStatus(req.id, "answered")}
                                  className="rounded px-2 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                                  title="Mark answered"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePrayer(req.id)}
                                  className="rounded px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    {prayerRequests.filter((r) => r.status === "answered").length > 0 && (
                      <>
                        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                          Answered
                        </p>
                        {prayerRequests
                          .filter((r) => r.status === "answered")
                          .map((req) => (
                            <li
                              key={req.id}
                              className="group rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 px-3 py-2 sm:px-2 sm:py-1.5 text-xs"
                            >
                              <div className="flex items-start gap-2">
                                <span className="flex-1 min-w-0 text-stone-500 dark:text-stone-400 line-through break-words">
                                  {req.text}
                                </span>
                                <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePrayerStatus(req.id, "active")}
                                    className="rounded px-2 py-1 text-xs text-stone-500 hover:bg-stone-200 dark:hover:bg-zinc-700"
                                    title="Restore"
                                  >
                                    Restore
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePrayer(req.id)}
                                    className="rounded px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    title="Remove"
                                  >
                                    ×
                                  </button>
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

