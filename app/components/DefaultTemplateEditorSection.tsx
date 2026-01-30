"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";

const ForwardRefEditor = dynamic(
  () =>
    import("./ForwardRefEditor").then((mod) => mod.ForwardRefEditor),
  { ssr: false },
);

type DefaultTemplateEditorSectionProps = {
  initialMarkdown: string;
};

export function DefaultTemplateEditorSection({
  initialMarkdown,
}: DefaultTemplateEditorSectionProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
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
    <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        Default devotion template
      </h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
        This template is used when you start a new devotion. Edit it below and
        save.
      </p>
      <div className="mt-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
        <ForwardRefEditor
          ref={editorRef}
          markdown={initialMarkdown}
          className="devotion-editor min-h-[280px] rounded-xl text-stone-900 dark:text-stone-100 font-sans prose prose-stone dark:prose-invert max-w-none leading-snug px-4 py-3"
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors cursor-pointer"
        >
          Save as default template
        </button>
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
    </section>
  );
}
