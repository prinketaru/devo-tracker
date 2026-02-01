"use client";

/**
 * Export devotions as Markdown, plain text, Word (DOCX), or PDF.
 * PDF opens the print page in a new tab; user saves as PDF from print dialog.
 */

import { Document, Packer, Paragraph, TextRun } from "docx";

export type DevotionExportData = {
  id: string;
  title: string;
  passage: string;
  content: string;
  date: string;
  tags: string[];
  minutesSpent?: number;
};

function safeFilename(title: string): string {
  return title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 50) || "devotion";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(devotion: DevotionExportData) {
  const lines: string[] = [
    `# ${devotion.title}`,
    "",
    `**Date:** ${devotion.date}`,
    devotion.passage !== "—" ? `**Passage:** ${devotion.passage}` : "",
    devotion.minutesSpent && devotion.minutesSpent > 0 ? `**Time spent:** ${devotion.minutesSpent} min` : "",
    devotion.tags.length > 0 ? `**Tags:** ${devotion.tags.join(", ")}` : "",
    "",
    "---",
    "",
    devotion.content || "",
  ].filter(Boolean);
  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `${safeFilename(devotion.title)}.md`);
}

export function exportAsPlainText(devotion: DevotionExportData) {
  const plain = (devotion.content || "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
  const lines: string[] = [
    devotion.title,
    "",
    `Date: ${devotion.date}`,
    devotion.passage !== "—" ? `Passage: ${devotion.passage}` : "",
    devotion.minutesSpent && devotion.minutesSpent > 0 ? `Time spent: ${devotion.minutesSpent} min` : "",
    devotion.tags.length > 0 ? `Tags: ${devotion.tags.join(", ")}` : "",
    "",
    "---",
    "",
    plain,
  ].filter(Boolean);
  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${safeFilename(devotion.title)}.txt`);
}

export async function exportAsDocx(devotion: DevotionExportData) {
  const meta: string[] = [
    devotion.date,
    devotion.passage !== "—" ? devotion.passage : "",
    devotion.minutesSpent && devotion.minutesSpent > 0 ? `${devotion.minutesSpent} min` : "",
    devotion.tags.length > 0 ? devotion.tags.join(", ") : "",
  ].filter(Boolean);

  const contentParagraphs: Paragraph[] = [];

  contentParagraphs.push(
    new Paragraph({
      text: devotion.title,
      heading: "Heading1",
    })
  );
  contentParagraphs.push(
    new Paragraph({
      text: meta.join(" · "),
      thematicBreak: false,
    })
  );
  contentParagraphs.push(new Paragraph({ text: "" }));

  if (devotion.content) {
    const blocks = devotion.content.split(/\n\n+/);
    for (const block of blocks) {
      const lines = block.split("\n");
      if (lines.length === 1) {
        contentParagraphs.push(new Paragraph({ text: lines[0] || "" }));
      } else {
        const children = lines.flatMap((line, i) =>
          i < lines.length - 1 ? [new TextRun({ text: line, break: 1 })] : [new TextRun(line)]
        );
        contentParagraphs.push(new Paragraph({ children }));
      }
    }
  }

  const doc = new Document({
    sections: [{ children: contentParagraphs }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${safeFilename(devotion.title)}.docx`);
}

export function exportAsPdf(devotionId: string) {
  window.open(`/devotions/${devotionId}/print`, "_blank", "noopener,noreferrer");
}
