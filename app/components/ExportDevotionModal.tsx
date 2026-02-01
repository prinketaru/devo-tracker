"use client";

import { useState, useEffect } from "react";
import {
  exportAsMarkdown,
  exportAsPlainText,
  exportAsDocx,
  exportAsPdf,
  type DevotionExportData,
} from "@/app/lib/export-devotion";

type ExportDevotionModalProps = {
  devotionId: string;
  devotion?: DevotionExportData | null;
  isOpen: boolean;
  onClose: () => void;
};

export function ExportDevotionModal({
  devotionId,
  devotion: devotionProp,
  isOpen,
  onClose,
}: ExportDevotionModalProps) {
  const [devotion, setDevotion] = useState<DevotionExportData | null>(devotionProp ?? null);
  const [loading, setLoading] = useState(!devotionProp);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (devotionProp) {
      setDevotion(devotionProp);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/devotions/${devotionId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: DevotionExportData) => {
        setDevotion(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load devotion.");
        setLoading(false);
      });
  }, [isOpen, devotionId, devotionProp]);

  const handleExport = async (format: string) => {
    if (!devotion) return;
    setExporting(format);
    try {
      switch (format) {
        case "pdf":
          exportAsPdf(devotionId);
          break;
        case "markdown":
          exportAsMarkdown(devotion);
          break;
        case "docx":
          await exportAsDocx(devotion);
          break;
        case "txt":
          exportAsPlainText(devotion);
          break;
        default:
          return;
      }
      onClose();
    } catch {
      setError("Export failed.");
    } finally {
      setExporting(null);
    }
  };

  if (!isOpen) return null;

  const formats = [
    { id: "pdf", label: "PDF", desc: "Open print dialog, save as PDF" },
    { id: "markdown", label: "Markdown", desc: ".md file" },
    { id: "docx", label: "Word", desc: ".docx document" },
    { id: "txt", label: "Plain text", desc: ".txt file" },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-devotion-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-xl">
        <h2 id="export-devotion-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Export devotion
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Choose a format to download.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">Loading…</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2">
            {formats.map(({ id, label, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleExport(id)}
                disabled={!!exporting || !devotion || loading}
                className="rounded-lg border border-stone-200 dark:border-zinc-700 px-4 py-3 text-left text-sm transition-colors hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium text-stone-900 dark:text-stone-100">{label}</span>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{desc}</p>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
