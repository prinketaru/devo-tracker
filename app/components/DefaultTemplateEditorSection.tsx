"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ProseKitEditorHandle } from "./ProseKitEditor";
import { Button } from "@/components/ui/button";

const ForwardRefEditor = dynamic(
  () =>
    import("./ForwardRefEditor").then((mod) => mod.ForwardRefEditor),
  { ssr: false },
);

type DefaultTemplateEditorSectionProps = {
  initialMarkdown: string;
};

import { FileText } from "lucide-react";

export function DefaultTemplateEditorSection({
  initialMarkdown,
}: DefaultTemplateEditorSectionProps) {
  const editorRef = useRef<ProseKitEditorHandle>(null);
  const [saveMessage, setSaveMessage] = useState<"success" | "error" | null>(null);

  const handleSave = async () => {
    const markdown = editorRef.current?.getMarkdown();
    if (markdown == null) return;
    setSaveMessage(null);
    const res = await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ defaultTemplateMarkdown: markdown }),
    });
    if (res.ok) {
      setSaveMessage("success");
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage("error");
    }
  };

  return (
    <div className="p-4 px-6 min-w-0 overflow-x-hidden">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 text-amber-600 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Default Devotion Template</h4>
          <p className="text-xs text-stone-500 dark:text-[#8A8070]">This template is used when you start a new devotion</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="w-full min-w-0 rounded-xl border border-stone-200 dark:border-[#38332a] bg-stone-50 dark:bg-[#23201a] overflow-hidden">
          <ForwardRefEditor
            ref={editorRef}
            markdown={initialMarkdown}
            className="devotion-editor w-full min-w-0 min-h-70 rounded-xl text-stone-900 dark:text-[#d6d3c8] font-sans prose prose-stone dark:prose-invert max-w-none leading-snug px-4 py-3 overflow-x-hidden"
          />
        </div>
        <div className="flex items-center py-2 gap-3">
          <Button
            type="button"
            onClick={handleSave}
            className="bg-[#f0a531] hover:bg-[#c0831a] text-stone-900"
          >
            Save template
          </Button>
          {saveMessage === "success" && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Template saved.
            </span>
          )}
          {saveMessage === "error" && (
            <span className="text-sm text-red-600 dark:text-red-400">
              Failed to save. Try again.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
