"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShareDevotionModal } from "./ShareDevotionModal";
import { ExportDevotionModal } from "./ExportDevotionModal";
import { DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Clock, BookOpen, Eye, Pencil, Download, Link2, Trash2 } from "lucide-react";

type DevotionSummary = {
  id: string;
  date: string;
  title: string;
  passage: string;
  summary: string;
  minutesSpent?: number;
  category?: string;
};

type DevotionCardProps = {
  devotion: DevotionSummary;
  onDelete?: (id: string) => void;
};

export function DevotionCard({ devotion, onDelete }: DevotionCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/devotions/${devotion.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setConfirmOpen(false);
        if (onDelete) {
          onDelete(devotion.id);
        } else {
          router.refresh();
        }
        return;
      }
    } catch {
      // keep dialog open
    }
    setDeleting(false);
  };

  return (
    <>
      <article className="group rounded-xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] hover:border-amber-300 dark:hover:border-amber-700/40 hover:shadow-sm transition-all duration-150 overflow-hidden">
        <div className="flex items-stretch">

          {/* Amber accent bar */}
          <div className="w-1 shrink-0 bg-stone-100 dark:bg-[#2a2720] group-hover:bg-amber-400 dark:group-hover:bg-amber-600 transition-colors duration-150 rounded-l-xl" />

          {/* Clickable content area */}
          <Link
            href={`/devotions/${devotion.id}`}
            className="flex-1 min-w-0 px-4 py-4"
          >
            {/* Title */}
            <h3 className="text-sm font-semibold text-stone-900 dark:text-[#d6d3c8] group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors leading-snug">
              {devotion.title}
            </h3>

            {/* Summary */}
            {devotion.summary && (
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-[#7e7b72] line-clamp-2">
                {devotion.summary}
              </p>
            )}

            {/* Bottom meta row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 dark:text-[#4a4840]">
                {devotion.date}
              </span>

              {devotion.passage && devotion.passage !== "—" && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  <BookOpen className="h-3 w-3" />
                  {devotion.passage}
                </span>
              )}

              {devotion.minutesSpent != null && devotion.minutesSpent > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-[#4a4840]">
                  <Clock className="h-3 w-3" />
                  {devotion.minutesSpent} min
                </span>
              )}

              {devotion.category && (
                <Badge
                  variant="secondary"
                  className="px-2 py-0 text-[10px] h-4.5 bg-stone-100 dark:bg-[#2a2720] text-stone-500 dark:text-[#7e7b72] border-0 font-medium"
                >
                  {DEVOTION_CATEGORY_LABELS[devotion.category as keyof typeof DEVOTION_CATEGORY_LABELS] ?? devotion.category}
                </Badge>
              )}
            </div>
          </Link>

          {/* Options menu */}
          <div className="flex items-start pt-3 pr-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-stone-400 dark:text-[#7e7b72] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity"
                  aria-label="Options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-37">
                <DropdownMenuItem asChild>
                  <Link href={`/devotions/${devotion.id}`} className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/devotions/${devotion.id}/edit`} className="flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportOpen(true)} className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareOpen(true)} className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5" /> Share link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmOpen(true)}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </article>

      <ShareDevotionModal devotionId={devotion.id} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
      <ExportDevotionModal devotionId={devotion.id} isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!open && !deleting) setConfirmOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete devotion?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
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
