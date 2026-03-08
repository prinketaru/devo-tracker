"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  const formats = [
    { id: "pdf", label: "PDF", desc: "Open print dialog, save as PDF" },
    { id: "markdown", label: "Markdown", desc: ".md file" },
    { id: "docx", label: "Word", desc: ".docx document" },
    { id: "txt", label: "Plain text", desc: ".txt file" },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export devotion</DialogTitle>
          <DialogDescription>Choose a format to download.</DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-stone-500 dark:text-[#7e7b72]">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {formats.map(({ id, label, desc }) => (
              <Button
                key={id}
                type="button"
                variant="outline"
                onClick={() => handleExport(id)}
                disabled={!!exporting || !devotion || loading}
                className="h-auto flex-col items-start text-left p-4 gap-0.5"
              >
                <span className="font-medium text-stone-900 dark:text-[#d6d3c8]">{label}</span>
                <span className="text-xs text-stone-500 dark:text-[#7e7b72] font-normal">{desc}</span>
              </Button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
