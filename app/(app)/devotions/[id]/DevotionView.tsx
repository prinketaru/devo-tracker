"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { contentToHtml } from "@/app/lib/markdown";
import { ExportDevotionModal } from "@/app/components/ExportDevotionModal";
import { ShareDevotionModal } from "@/app/components/ShareDevotionModal";
import { DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Pencil, Download, Share2, BookOpen, Clock, Tag } from "lucide-react";

type Devotion = {
  id: string;
  title: string;
  passage: string;
  content: string;
  date: string;
  tags: string[];
  minutesSpent?: number;
  category?: string;
};

export function DevotionView({ devotion }: { devotion: Devotion }) {
  const htmlContent = useMemo(() => contentToHtml(devotion.content), [devotion.content]);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const categoryLabel = devotion.category
    ? (DEVOTION_CATEGORY_LABELS[devotion.category as keyof typeof DEVOTION_CATEGORY_LABELS] ?? devotion.category)
    : null;

  return (
    <div className="min-h-screen">
      {/* Top nav bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-stone-500 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-[#d6d3c8] -ml-2">
          <Link href="/devotions">
            <ChevronLeft className="h-4 w-4" />
            All notes
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-stone-500 dark:text-[#7e7b72]"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-stone-500 dark:text-[#7e7b72]"
            onClick={() => setExportOpen(true)}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/devotions/${devotion.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Article */}
      <article className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] shadow-sm overflow-hidden">

        {/* Header band */}
        <div className="px-6 sm:px-10 pt-8 pb-7 border-b border-stone-100 dark:border-[#2a2720]">

          {/* Date eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#4a4840] mb-3">
            {devotion.date}
          </p>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-[#d6d3c8] leading-snug">
            {devotion.title}
          </h1>

          {/* Passage callout */}
          {devotion.passage && devotion.passage !== "—" && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-500/30 px-3.5 py-2">
              <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {devotion.passage}
              </span>
            </div>
          )}

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {devotion.minutesSpent != null && devotion.minutesSpent > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-[#4a4840]">
                <Clock className="h-3 w-3" />
                {devotion.minutesSpent} min
              </span>
            )}

            {categoryLabel && (
              <Badge
                variant="secondary"
                className="bg-stone-100 dark:bg-[#2a2720] text-stone-600 dark:text-[#9e9b92] border-0 text-[11px] font-medium"
              >
                {categoryLabel}
              </Badge>
            )}

            {devotion.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="h-3 w-3 text-stone-400 dark:text-[#4a4840]" />
                {devotion.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[11px] border-amber-200 dark:border-amber-700/40 bg-amber-50/50 dark:bg-transparent text-amber-700 dark:text-amber-300 font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 py-8">
          {devotion.content ? (
            <div
              className="devotion-notes prose prose-stone dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-stone-900 dark:prose-headings:text-[#d6d3c8] prose-a:text-amber-700 dark:prose-a:text-amber-400"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="text-sm text-stone-400 dark:text-[#4a4840] italic">No content recorded.</p>
          )}
        </div>


      </article>

      <ExportDevotionModal
        devotionId={devotion.id}
        devotion={devotion}
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />
      <ShareDevotionModal
        devotionId={devotion.id}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
