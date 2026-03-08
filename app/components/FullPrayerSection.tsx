"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreVertical, Pencil, Check, RotateCcw, Trash2, Heart } from "lucide-react";

const PRAYER_CATEGORIES = ["family", "health", "ministry", "personal", "other"] as const;
const CATEGORY_LABELS: Record<string, string> = {
    family: "Family",
    health: "Health",
    ministry: "Ministry",
    personal: "Personal",
    other: "Other",
};

// Accent colors per category
const CATEGORY_COLOR: Record<string, { dot: string; stripe: string; chip: string }> = {
    personal: {
        dot: "bg-blue-500",
        stripe: "bg-blue-400 dark:bg-blue-500",
        chip: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    },
    health: {
        dot: "bg-pink-500",
        stripe: "bg-pink-400 dark:bg-pink-500",
        chip: "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    },
    family: {
        dot: "bg-orange-400",
        stripe: "bg-orange-400 dark:bg-orange-500",
        chip: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    },
    ministry: {
        dot: "bg-violet-500",
        stripe: "bg-violet-400 dark:bg-violet-500",
        chip: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    },
    other: {
        dot: "bg-emerald-500",
        stripe: "bg-emerald-400 dark:bg-emerald-500",
        chip: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    },
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

export function FullPrayerSection() {
    const router = useRouter();
    const inputRef = useRef<HTMLTextAreaElement>(null);
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
    const [showAnswered, setShowAnswered] = useState(true);

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
            const res = await fetch("/api/prayer-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text, status: "active", category: newCategory }),
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
                setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
                router.refresh();
                if (status === "answered") {
                    setCelebrateId(id);
                    setTimeout(() => setCelebrateId(null), 2000);
                }
            }
        } catch { /* ignore */ }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/prayer-requests/${id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
        } catch { /* ignore */ }
        finally { router.refresh(); }
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
                setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, text } : r)));
                setEditingId(null);
                setEditText("");
            }
        } catch { /* ignore */ }
    };

    const startEdit = (id: string, currentText: string) => { setEditingId(id); setEditText(currentText); };
    const cancelEdit = () => { setEditingId(null); setEditText(""); };

    const filteredRequests = requests.filter((req) => {
        if (!searchQuery) return true;
        return req.text.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const activeRequests = filteredRequests.filter((r) => r.status === "active");
    const answeredRequests = filteredRequests.filter((r) => r.status === "answered");

    return (
        <div className="space-y-5">

            {/* Add prayer form */}
            <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 dark:border-[#2a2720]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-[#7e7b72]">
                        New Request
                    </p>
                </div>
                <form onSubmit={handleAdd} className="px-5 py-4 flex flex-col gap-3">
                    <textarea
                        ref={inputRef}
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(e); }
                        }}
                        placeholder="What would you like to bring before God?"
                        rows={2}
                        className="w-full resize-none rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-3 py-2.5 text-sm text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none focus:ring-2 focus:ring-amber-500/60 transition"
                        disabled={submitting}
                        autoComplete="off"
                    />
                    <div className="flex items-center gap-2">
                        <Select value={newCategory} onValueChange={setNewCategory}>
                            <SelectTrigger className="h-8 text-xs w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRAYER_CATEGORIES.map((c) => (
                                    <SelectItem key={c} value={c} className="text-xs">
                                        <span className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${CATEGORY_COLOR[c]?.dot ?? "bg-stone-400"}`} />
                                            {CATEGORY_LABELS[c]}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit" size="sm" disabled={!newText.trim() || submitting} className="ml-auto gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            {submitting ? "Adding…" : "Add"}
                        </Button>
                    </div>
                    {submitError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                    )}
                </form>
            </div>

            {/* List panel */}
            <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] shadow-sm overflow-hidden">

                {/* Search + filter bar */}
                <div className="px-4 py-3 border-b border-stone-100 dark:border-[#2a2720] flex flex-col gap-3">
                    {/* Search */}
                    <div className="flex items-center gap-2 rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-3 py-2">
                        <Search className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search prayers…"
                            className="flex-1 bg-transparent text-sm text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none"
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery("")} className="text-stone-400 hover:text-stone-600 text-xs">✕</button>
                        )}
                    </div>
                    {/* Category pills */}
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={() => setFilterCategory("")}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filterCategory
                                ? "bg-stone-900 dark:bg-[#d6d3c8] text-white dark:text-stone-900"
                                : "bg-stone-100 dark:bg-[#2a2720] text-stone-600 dark:text-[#7e7b72] hover:bg-stone-200 dark:hover:bg-zinc-700"
                                }`}
                        >
                            All
                        </button>
                        {PRAYER_CATEGORIES.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setFilterCategory(filterCategory === c ? "" : c)}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterCategory === c
                                    ? `${CATEGORY_COLOR[c]?.chip ?? ""} ring-1 ring-current`
                                    : "bg-stone-100 dark:bg-[#2a2720] text-stone-600 dark:text-[#7e7b72] hover:bg-stone-200 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLOR[c]?.dot ?? "bg-stone-400"}`} />
                                {CATEGORY_LABELS[c]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Prayer requests */}
                <div className="divide-y divide-stone-100 dark:divide-[#2a2720]">
                    {loading ? (
                        <div className="space-y-3 p-4 animate-pulse">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-1 rounded-full bg-stone-200 dark:bg-stone-700" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 w-3/4 rounded-full bg-stone-200 dark:bg-stone-700" />
                                        <div className="h-2.5 w-1/3 rounded-full bg-stone-100 dark:bg-stone-800" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <Heart className="mx-auto h-8 w-8 text-stone-200 dark:text-stone-700 mb-3" />
                            <p className="text-sm font-medium text-stone-600 dark:text-[#b8b5ac]">
                                {searchQuery || filterCategory ? "No prayers match" : "No prayer requests yet"}
                            </p>
                            <p className="mt-1 text-xs text-stone-400 dark:text-stone-600">
                                {searchQuery || filterCategory ? "Try different search terms or clear filters." : "Add your first request above."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Active requests */}
                            <AnimatePresence initial={false}>
                                {activeRequests.map((req) => {
                                    const colors = CATEGORY_COLOR[req.category ?? "other"] ?? CATEGORY_COLOR.other;
                                    return (
                                        <motion.div
                                            key={req.id}
                                            layout
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            transition={{ duration: 0.18 }}
                                            id={`prayer-item-${req.id}`}
                                            className={`group flex items-stretch hover:bg-stone-50/60 dark:hover:bg-white/[0.018] transition-colors ${celebrateId === req.id ? "bg-green-50 dark:bg-green-900/10" : ""}`}
                                        >
                                            {/* Category stripe */}
                                            <div className={`w-1 shrink-0 ${colors.stripe} opacity-70`} />

                                            <div className="flex-1 min-w-0 px-4 py-3.5">
                                                {editingId === req.id ? (
                                                    <div className="flex flex-col gap-2">
                                                        <textarea
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            rows={2}
                                                            className="w-full resize-none rounded-lg border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/60"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleEdit(req.id)} className="h-7 text-xs">Save</Button>
                                                            <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 text-xs">Cancel</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-stone-800 dark:text-[#d6d3c8] leading-relaxed">
                                                                {req.text}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                {req.category && (
                                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.chip}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                                                        {CATEGORY_LABELS[req.category] ?? req.category}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-stone-400 dark:text-[#4a4840]">
                                                                    {getRelativeTime(req.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 dark:text-[#7e7b72]" aria-label="Options">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="min-w-36">
                                                                    <DropdownMenuItem onClick={() => startEdit(req.id, req.text)} className="flex items-center gap-2">
                                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, "answered")} className="flex items-center gap-2 text-green-700 dark:text-green-400 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-950/30">
                                                                        <Check className="h-3.5 w-3.5" /> Mark Answered
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleDelete(req.id)} className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40">
                                                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Answered section */}
                            {answeredRequests.length > 0 && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAnswered((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-green-50/60 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                                Answered — {answeredRequests.length}
                                            </span>
                                        </div>
                                        <span className="text-xs text-stone-400 dark:text-stone-600">
                                            {showAnswered ? "Hide" : "Show"}
                                        </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {showAnswered && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden divide-y divide-stone-100 dark:divide-[#2a2720]"
                                            >
                                                {answeredRequests.map((req) => (
                                                    <div
                                                        key={req.id}
                                                        id={`prayer-item-${req.id}`}
                                                        className="group flex items-stretch bg-green-50/30 dark:bg-green-900/5 hover:bg-green-50/60 dark:hover:bg-green-900/10 transition-colors"
                                                    >
                                                        <div className="w-1 shrink-0 bg-green-300 dark:bg-green-700/60" />
                                                        <div className="flex-1 min-w-0 px-4 py-3">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-stone-400 dark:text-stone-600 line-through wrap-break-word leading-relaxed">
                                                                        {req.text}
                                                                    </p>
                                                                    {req.category && (
                                                                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-[#2a2720] px-2 py-0.5 text-[10px] font-medium text-stone-400 dark:text-stone-600">
                                                                            {CATEGORY_LABELS[req.category] ?? req.category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity shrink-0">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400" aria-label="Options">
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="min-w-36">
                                                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, "active")} className="flex items-center gap-2">
                                                                                <RotateCcw className="h-3.5 w-3.5" /> Restore
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem onClick={() => handleDelete(req.id)} className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40">
                                                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
