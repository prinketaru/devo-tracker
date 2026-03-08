"use client";

import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState, type ForwardedRef } from "react";
import { createEditor, type Editor } from "prosekit/core";
import type { BasicExtension } from "prosekit/basic";
import { ProseKit, useDocChange, useEditor, useEditorDerivedValue } from "prosekit/react";
import { TooltipContent, TooltipRoot, TooltipTrigger } from "prosekit/react/tooltip";
import { union } from "prosekit/core";
import {
  Undo2, Redo2,
  Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  Minus, Quote, List, ListOrdered,
  Table, Baseline, Highlighter,
} from "lucide-react";
import { defineDoc } from "prosekit/extensions/doc";
import { defineText } from "prosekit/extensions/text";
import { defineParagraph } from "prosekit/extensions/paragraph";
import { defineHeading } from "prosekit/extensions/heading";
import { defineList } from "prosekit/extensions/list";
import { defineBlockquote } from "prosekit/extensions/blockquote";
import { defineImage } from "prosekit/extensions/image";
import { defineHorizontalRule } from "prosekit/extensions/horizontal-rule";
import { defineTable } from "prosekit/extensions/table";
import { defineCodeBlock } from "prosekit/extensions/code-block";
import { defineItalic } from "prosekit/extensions/italic";
import { defineBold } from "prosekit/extensions/bold";
import { defineUnderline } from "prosekit/extensions/underline";
import { defineStrike } from "prosekit/extensions/strike";
import { defineCode } from "prosekit/extensions/code";
import { defineLink } from "prosekit/extensions/link";
import { defineTextColor } from "prosekit/extensions/text-color";
import { defineBackgroundColor } from "prosekit/extensions/background-color";
import { definePlaceholder } from "prosekit/extensions/placeholder";
import { defineDropCursor } from "prosekit/extensions/drop-cursor";
import { defineGapCursor } from "prosekit/extensions/gap-cursor";
import { defineBaseKeymap } from "prosekit/core";
import { defineBaseCommands } from "prosekit/core";
import { defineHistory } from "prosekit/core";
import EditorInlineMenu from "./editor/EditorInlineMenu";
import EditorSlashMenu from "./editor/EditorSlashMenu";
import { EditorBlockHandle, EditorDropIndicator } from "./editor/EditorBlockHandle";
import EditorTableHandle from "./editor/EditorTableHandle";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { jsonFromHTML } from "prosekit/core";
import "prosekit/basic/style.css";

export interface ProseKitEditorHandle {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
}

interface ProseKitEditorProps {
  markdown?: string;
  className?: string;
}

// Helper functions for markdown conversion (sync versions using unified)
function markdownToHTML(markdown: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown);
  return String(result);
}

function htmlToMarkdown(html: string): string {
  const result = unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .processSync(html);
  return String(result);
}

// ---------- Toolbar helpers ----------

function getToolbarItems(editor: Editor<BasicExtension>) {
  // Cast to any to handle our custom extension commands that aren't in BasicExtension
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmds = editor.commands as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marks = editor.marks as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes = editor.nodes as any;
  return {
    undo: cmds.undo
      ? { isActive: false, canExec: cmds.undo.canExec(), command: () => cmds.undo() }
      : undefined,
    redo: cmds.redo
      ? { isActive: false, canExec: cmds.redo.canExec(), command: () => cmds.redo() }
      : undefined,
    bold: cmds.toggleBold
      ? { isActive: marks.bold.isActive(), canExec: cmds.toggleBold.canExec(), command: () => cmds.toggleBold() }
      : undefined,
    italic: cmds.toggleItalic
      ? { isActive: marks.italic.isActive(), canExec: cmds.toggleItalic.canExec(), command: () => cmds.toggleItalic() }
      : undefined,
    underline: cmds.toggleUnderline
      ? { isActive: marks.underline.isActive(), canExec: cmds.toggleUnderline.canExec(), command: () => cmds.toggleUnderline() }
      : undefined,
    strike: cmds.toggleStrike
      ? { isActive: marks.strike.isActive(), canExec: cmds.toggleStrike.canExec(), command: () => cmds.toggleStrike() }
      : undefined,
    code: cmds.toggleCode
      ? { isActive: marks.code.isActive(), canExec: cmds.toggleCode.canExec(), command: () => cmds.toggleCode() }
      : undefined,
    heading1: cmds.toggleHeading
      ? { isActive: nodes.heading.isActive({ level: 1 }), canExec: cmds.toggleHeading.canExec({ level: 1 }), command: () => cmds.toggleHeading({ level: 1 }) }
      : undefined,
    heading2: cmds.toggleHeading
      ? { isActive: nodes.heading.isActive({ level: 2 }), canExec: cmds.toggleHeading.canExec({ level: 2 }), command: () => cmds.toggleHeading({ level: 2 }) }
      : undefined,
    heading3: cmds.toggleHeading
      ? { isActive: nodes.heading.isActive({ level: 3 }), canExec: cmds.toggleHeading.canExec({ level: 3 }), command: () => cmds.toggleHeading({ level: 3 }) }
      : undefined,
    horizontalRule: cmds.insertHorizontalRule
      ? { isActive: false, canExec: cmds.insertHorizontalRule.canExec(), command: () => cmds.insertHorizontalRule() }
      : undefined,
    blockquote: cmds.toggleBlockquote
      ? { isActive: nodes.blockquote.isActive(), canExec: cmds.toggleBlockquote.canExec(), command: () => cmds.toggleBlockquote() }
      : undefined,
    bulletList: cmds.toggleBulletList
      ? { isActive: nodes.list.isActive({ kind: "bullet" }), canExec: cmds.toggleBulletList.canExec(), command: () => cmds.toggleBulletList() }
      : undefined,
    orderedList: cmds.toggleOrderedList
      ? { isActive: nodes.list.isActive({ kind: "ordered" }), canExec: cmds.toggleOrderedList.canExec(), command: () => cmds.toggleOrderedList() }
      : undefined,
    insertTable: cmds.insertTable
      ? { isActive: false, canExec: cmds.insertTable.canExec({ row: 3, col: 3 }), command: () => cmds.insertTable({ row: 3, col: 3 }) }
      : undefined,
  };
}

const TOOLBAR_TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Gray", value: "#6b7280" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Red", value: "#ef4444" },
];

const TOOLBAR_BG_COLORS = [
  { label: "None", value: "" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Red", value: "#fecaca" },
  { label: "Orange", value: "#fed7aa" },
];

function ToolbarColorPicker({ type }: { type: "text" | "bg" }) {
  const [open, setOpen] = useState(false);
  const editor = useEditor<BasicExtension>({ update: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmds = editor.commands as any;
  const colors = type === "text" ? TOOLBAR_TEXT_COLORS : TOOLBAR_BG_COLORS;

  const applyColor = (value: string) => {
    if (type === "text") {
      if (!value) cmds.unsetTextColor?.();
      else cmds.setTextColor?.({ color: value });
    } else {
      if (!value) cmds.unsetBackgroundColor?.();
      else cmds.setBackgroundColor?.({ color: value });
    }
    setOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <TooltipRoot>
        <TooltipTrigger className="flex shrink-0 items-center justify-center">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen((o) => !o)}
            className={[
              "inline-flex items-center justify-center rounded p-2 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
            ].join(" ")}
          >
            {type === "text" ? <Baseline className="h-5 w-5" /> : <Highlighter className="h-5 w-5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent className="z-50 overflow-hidden rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm animate-in fade-in-0 zoom-in-95">
          {type === "text" ? "Text Color" : "Highlight"}
        </TooltipContent>
      </TooltipRoot>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510] shadow-md p-2 w-36">
            <div className="flex flex-wrap gap-1">
              {colors.map((c) => (
                <button
                  key={c.value || "none"}
                  type="button"
                  title={c.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyColor(c.value)}
                  className="w-6 h-6 rounded border border-stone-200 dark:border-stone-700 hover:scale-110 transition-all flex items-center justify-center"
                  style={{ backgroundColor: c.value || undefined }}
                >
                  {!c.value && <span className="text-[10px] text-stone-400">✕</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ToolbarButton({
  pressed,
  disabled,
  onClick,
  tooltip,
  children,
}: {
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipRoot>
      <TooltipTrigger className="flex shrink-0 items-center justify-center">
        <button
          type="button"
          data-state={pressed ? "on" : "off"}
          disabled={disabled}
          onClick={onClick}
          onMouseDown={(e) => e.preventDefault()}
          className={[
            "inline-flex items-center justify-center rounded p-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:pointer-events-none disabled:opacity-40",
            pressed ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          {children}
          {tooltip && <span className="sr-only">{tooltip}</span>}
        </button>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent className="z-50 overflow-hidden rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm animate-in fade-in-0 zoom-in-95">
          {tooltip}
        </TooltipContent>
      )}
    </TooltipRoot>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

function EditorToolbar() {
  const items = useEditorDerivedValue(getToolbarItems);

  return (
    <div className="flex items-center gap-0.5 bg-background px-2 py-1 border-b border-[#E3DED4] dark:border-[#2E2B23] overflow-x-auto">
      {items.undo && (
        <ToolbarButton pressed={items.undo.isActive} disabled={!items.undo.canExec} onClick={items.undo.command} tooltip="Undo">
          <Undo2 className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.redo && (
        <ToolbarButton pressed={items.redo.isActive} disabled={!items.redo.canExec} onClick={items.redo.command} tooltip="Redo">
          <Redo2 className="h-5 w-5" />
        </ToolbarButton>
      )}

      <ToolbarDivider />

      {items.bold && (
        <ToolbarButton pressed={items.bold.isActive} disabled={!items.bold.canExec} onClick={items.bold.command} tooltip="Bold">
          <Bold className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.italic && (
        <ToolbarButton pressed={items.italic.isActive} disabled={!items.italic.canExec} onClick={items.italic.command} tooltip="Italic">
          <Italic className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.underline && (
        <ToolbarButton pressed={items.underline.isActive} disabled={!items.underline.canExec} onClick={items.underline.command} tooltip="Underline">
          <Underline className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.strike && (
        <ToolbarButton pressed={items.strike.isActive} disabled={!items.strike.canExec} onClick={items.strike.command} tooltip="Strikethrough">
          <Strikethrough className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.code && (
        <ToolbarButton pressed={items.code.isActive} disabled={!items.code.canExec} onClick={items.code.command} tooltip="Inline Code">
          <Code className="h-5 w-5" />
        </ToolbarButton>
      )}

      <ToolbarDivider />

      {items.heading1 && (
        <ToolbarButton pressed={items.heading1.isActive} disabled={!items.heading1.canExec} onClick={items.heading1.command} tooltip="Heading 1">
          <Heading1 className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.heading2 && (
        <ToolbarButton pressed={items.heading2.isActive} disabled={!items.heading2.canExec} onClick={items.heading2.command} tooltip="Heading 2">
          <Heading2 className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.heading3 && (
        <ToolbarButton pressed={items.heading3.isActive} disabled={!items.heading3.canExec} onClick={items.heading3.command} tooltip="Heading 3">
          <Heading3 className="h-5 w-5" />
        </ToolbarButton>
      )}

      <ToolbarDivider />

      {items.horizontalRule && (
        <ToolbarButton pressed={items.horizontalRule.isActive} disabled={!items.horizontalRule.canExec} onClick={items.horizontalRule.command} tooltip="Divider">
          <Minus className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.blockquote && (
        <ToolbarButton pressed={items.blockquote.isActive} disabled={!items.blockquote.canExec} onClick={items.blockquote.command} tooltip="Blockquote">
          <Quote className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.bulletList && (
        <ToolbarButton pressed={items.bulletList.isActive} disabled={!items.bulletList.canExec} onClick={items.bulletList.command} tooltip="Bullet List">
          <List className="h-5 w-5" />
        </ToolbarButton>
      )}
      {items.orderedList && (
        <ToolbarButton pressed={items.orderedList.isActive} disabled={!items.orderedList.canExec} onClick={items.orderedList.command} tooltip="Ordered List">
          <ListOrdered className="h-5 w-5" />
        </ToolbarButton>
      )}

      <ToolbarDivider />

      <ToolbarColorPicker type="text" />
      <ToolbarColorPicker type="bg" />

      <ToolbarDivider />

      {items.insertTable && (
        <ToolbarButton pressed={false} disabled={!items.insertTable.canExec} onClick={items.insertTable.command} tooltip="Insert Table">
          <Table className="h-5 w-5" />
        </ToolbarButton>
      )}
    </div>
  );
}

// ---------- Extension ----------

// Define extension with all features
function defineExtension() {
  return union(
    // Nodes
    defineDoc(),
    defineText(),
    defineParagraph(),
    defineHeading(),
    defineList(),
    defineBlockquote(),
    defineImage(),
    defineHorizontalRule(),
    defineTable(),
    defineCodeBlock(),
    // Marks
    defineItalic(),
    defineBold(),
    defineUnderline(),
    defineStrike(),
    defineCode(),
    defineLink(),
    defineTextColor(),
    defineBackgroundColor(),
    // Others
    definePlaceholder({ placeholder: "Press / for commands..." }),
    defineDropCursor(),
    defineGapCursor(),
    defineBaseKeymap(),
    defineBaseCommands(),
    defineHistory(),
  );
}

// ---------- Editor counts ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEditorCounts(editor: Editor<any>) {
  const text = editor.mounted ? (editor.view?.state?.doc.textContent ?? "") : "";
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  const chars = trimmed.length;
  return { words, chars };
}

function EditorFooter() {
  const { words, chars } = useEditorDerivedValue(getEditorCounts);
  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#E3DED4] dark:border-[#2E2B23] text-xs text-muted-foreground select-none">
      <span className="flex gap-3">
        <span>{words.toLocaleString()} {words === 1 ? "word" : "words"}</span>
        <span>{chars.toLocaleString()} {chars === 1 ? "character" : "characters"}</span>
      </span>
      <span>Markdown Supported</span>
    </div>
  );
}

const ProseKitEditorInner = forwardRef<ProseKitEditorHandle, ProseKitEditorProps & { editor: any }>(
  ({ editor, className = "" }, ref) => {
    const currentMarkdownRef = useRef("");

    // Track markdown changes
    useDocChange(() => {
      const html = editor.getDocHTML();
      currentMarkdownRef.current = htmlToMarkdown(html);
    }, { editor });

    useImperativeHandle(ref, () => ({
      getMarkdown: () => {
        const html = editor.getDocHTML();
        return htmlToMarkdown(html);
      },
      setMarkdown: (newMarkdown: string) => {
        const html = markdownToHTML(newMarkdown);
        const json = jsonFromHTML(html, { schema: editor.schema });
        editor.setContent(json);
      },
    }));

    return (
      <div className={`prosekit-editor flex flex-col overflow-hidden ${className}`}>
        {/* Content: first on mobile (top), second on desktop (below toolbar) */}
        <div className="order-first lg:order-none relative flex-1 overflow-y-auto min-h-0">
          <div
            ref={editor.mount}
            className="ProseMirror min-h-full pl-4 sm:pl-16 pr-4 py-4 outline-none prose prose-stone dark:prose-invert max-w-none"
          />
          <EditorInlineMenu />
          <EditorSlashMenu />
          <EditorBlockHandle />
          <EditorDropIndicator />
          <EditorTableHandle />
        </div>
        {/* Toolbar: last on mobile (bottom, above keyboard), first on desktop (top) */}
        <div className="order-last lg:order-first">
          <EditorToolbar />
        </div>
        <EditorFooter />
      </div>
    );
  }
);

ProseKitEditorInner.displayName = "ProseKitEditorInner";

export const ProseKitEditor = forwardRef<ProseKitEditorHandle, ProseKitEditorProps>(
  ({ markdown = "", className = "" }, ref: ForwardedRef<ProseKitEditorHandle>) => {
    const editor = useMemo(() => {
      const extension = defineExtension();
      
      // Convert initial markdown to HTML then to JSON
      let defaultContent = undefined;
      if (markdown) {
        const html = markdownToHTML(markdown);
        defaultContent = html;
      }
      
      return createEditor({ 
        extension,
        defaultContent
      });
    }, []);

    return (
      <ProseKit editor={editor}>
        <ProseKitEditorInner ref={ref} editor={editor} className={className} />
      </ProseKit>
    );
  }
);

ProseKitEditor.displayName = "ProseKitEditor";
