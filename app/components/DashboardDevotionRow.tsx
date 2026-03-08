"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Eye, Pencil, Trash2, Clock, BookOpen, Download, Link2 } from "lucide-react";
import { DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShareDevotionModal } from "./ShareDevotionModal";
import { ExportDevotionModal } from "./ExportDevotionModal";

type DevotionSummary = {
    id: string;
    date: string;
    title: string;
    passage: string;
    summary: string;
    minutesSpent?: number;
    category?: string;
};

export function DashboardDevotionRow({ devotion }: { devotion: DevotionSummary }) {
    const router = useRouter();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    const categoryLabel =
        devotion.category && devotion.category !== "devotion"
            ? (DEVOTION_CATEGORY_LABELS[devotion.category as keyof typeof DEVOTION_CATEGORY_LABELS] ??
                devotion.category)
            : null;

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/devotions/${devotion.id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setConfirmOpen(false);
                router.refresh();
                return;
            }
        } catch {
            // keep dialog open
        }
        setDeleting(false);
    };

    return (
        <>
            <div className="group relative flex items-start gap-3 px-5 py-4 hover:bg-stone-50/30 dark:hover:bg-white/2 transition-colors">
                {/* Main content — clicking navigates */}
                <Link
                    href={`/devotions/${devotion.id}`}
                    className="flex-1 min-w-0 flex flex-col gap-1.5"
                >
                    {/* Title row */}
                    <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-[#d6d3c8] leading-snug">
                            {devotion.title}
                        </h3>
                        {categoryLabel && (
                            <span className="shrink-0 rounded-full bg-stone-100 dark:bg-[#2a2720] px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:text-[#7e7b72]">
                                {categoryLabel}
                            </span>
                        )}
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-stone-500 dark:text-[#7e7b72] line-clamp-2 leading-relaxed">
                        {devotion.summary}
                    </p>

                    {/* Meta row: date · passage · time */}
                    <div className="flex items-center gap-3 flex-wrap mt-0.5">
                        <span className="text-[10px] text-stone-400 dark:text-[#4a4840]">
                            {devotion.date}
                        </span>
                        {devotion.passage && devotion.passage !== "—" && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                                <BookOpen className="w-2.5 h-2.5" />
                                {devotion.passage}
                            </span>
                        )}
                        {devotion.minutesSpent != null && devotion.minutesSpent > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-[#4a4840]">
                                <Clock className="w-2.5 h-2.5" />
                                {devotion.minutesSpent} min
                            </span>
                        )}
                    </div>
                </Link>

                {/* Dropdown trigger */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-stone-400 dark:text-[#4a4840] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity"
                            aria-label="Actions"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-37">
                        <DropdownMenuItem asChild>
                            <Link href={`/devotions/${devotion.id}`} className="flex items-center gap-2">
                                <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/devotions/${devotion.id}/edit`} className="flex items-center gap-2">
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setExportOpen(true)} className="flex items-center gap-2">
                            <Download className="w-3.5 h-3.5" /> Export
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShareOpen(true)} className="flex items-center gap-2">
                            <Link2 className="w-3.5 h-3.5" /> Share link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setConfirmOpen(true)}
                            className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ShareDevotionModal devotionId={devotion.id} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
            <ExportDevotionModal devotionId={devotion.id} isOpen={exportOpen} onClose={() => setExportOpen(false)} />

            {/* Delete confirmation */}
            <Dialog open={confirmOpen} onOpenChange={(o) => { if (!o && !deleting) setConfirmOpen(false); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete devotion?</DialogTitle>
                        <DialogDescription>This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
