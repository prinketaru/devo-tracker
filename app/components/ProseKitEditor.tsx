"use client";

import React, { forwardRef, useImperativeHandle, useMemo, useState, type ForwardedRef } from "react";
import { createEditor, type Editor } from "prosekit/core";
import type { BasicExtension } from "prosekit/basic";
import { ProseKit, useEditor, useEditorDerivedValue } from "prosekit/react";
import { TooltipContent, TooltipRoot, TooltipTrigger } from "prosekit/react/tooltip";
import { union } from "prosekit/core";
import {
  Undo2, Redo2,
  Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  Minus, Quote, List, ListOrdered,
  Table, Baseline, Highlighter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
// rehypeParse / rehypeRemark / remarkStringify removed — content is now stored as HTML
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

/** Detect whether stored content is HTML (new format) or Markdown (legacy). */
function isHtmlContent(content: string): boolean {
  return content.trimStart().startsWith("<");
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

// CSS-variable values are stored in the HTML so the colour adapts to the
// current theme automatically (light vs dark) via the definitions in globals.css.
const TOOLBAR_TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Gray",   value: "var(--tc-gray)" },
  { label: "Orange", value: "var(--tc-orange)" },
  { label: "Yellow", value: "var(--tc-yellow)" },
  { label: "Green",  value: "var(--tc-green)" },
  { label: "Blue",   value: "var(--tc-blue)" },
  { label: "Purple", value: "var(--tc-purple)" },
  { label: "Red",    value: "var(--tc-red)" },
];

const TOOLBAR_BG_COLORS = [
  { label: "None",   value: "" },
  { label: "Yellow", value: "var(--bg-yellow)" },
  { label: "Green",  value: "var(--bg-green)" },
  { label: "Blue",   value: "var(--bg-blue)" },
  { label: "Purple", value: "var(--bg-purple)" },
  { label: "Pink",   value: "var(--bg-pink)" },
  { label: "Red",    value: "var(--bg-red)" },
  { label: "Orange", value: "var(--bg-orange)" },
];

function ToolbarColorPicker({ type }: { type: "text" | "bg" }) {
  const [open, setOpen] = useState(false);
  const editor = useEditor<BasicExtension>({ update: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmds = editor.commands as any;
  const colors = type === "text" ? TOOLBAR_TEXT_COLORS : TOOLBAR_BG_COLORS;

  const applyColor = (value: string) => {
    editor.focus();
    if (type === "text") {
      const setTextColor = cmds.setTextColor ?? cmds.addTextColor;
      const unsetTextColor = cmds.unsetTextColor ?? cmds.removeTextColor;
      if (!value) unsetTextColor?.();
      else setTextColor?.({ color: value });
    } else {
      const setBackgroundColor = cmds.setBackgroundColor ?? cmds.addBackgroundColor;
      const unsetBackgroundColor = cmds.unsetBackgroundColor ?? cmds.removeBackgroundColor;
      if (!value) unsetBackgroundColor?.();
      else setBackgroundColor?.({ color: value });
    }
    editor.focus();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <TooltipRoot>
        <TooltipTrigger className="flex shrink-0 items-center justify-center">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={[
                "inline-flex items-center justify-center rounded p-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
              ].join(" ")}
            >
              {type === "text" ? <Baseline className="h-5 w-5" /> : <Highlighter className="h-5 w-5" />}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="z-50 overflow-hidden rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm animate-in fade-in-0 zoom-in-95">
          {type === "text" ? "Text Color" : "Highlight"}
        </TooltipContent>
      </TooltipRoot>

      <DropdownMenuContent align="start" className="w-36 rounded-lg border border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510] p-2">
        <div className="flex flex-wrap gap-1">
          {colors.map((c) => (
            <button
              key={c.value || "none"}
              type="button"
              title={c.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyColor(c.value)}
              className="h-6 w-6 rounded border border-stone-200 dark:border-stone-700 transition-all hover:scale-110 flex items-center justify-center"
              style={{ backgroundColor: c.value || undefined }}
            >
              {!c.value && <span className="text-[10px] text-stone-400">✕</span>}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
    <div className="flex items-center gap-0.5 bg-background px-2 py-1 border-b border-[#E3DED4] dark:border-[#2E2B23] overflow-x-auto w-full min-w-0 pointer-events-auto">
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
    <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#E3DED4] dark:border-[#2E2B23] text-xs text-muted-foreground select-none w-full min-w-0">
      <span className="flex gap-3 shrink-0">
        <span>{words.toLocaleString()} {words === 1 ? "word" : "words"}</span>
        <span>{chars.toLocaleString()} {chars === 1 ? "character" : "characters"}</span>
      </span>
      <span>Markdown Supported</span>
    </div>
  );
}

const ProseKitEditorInner = forwardRef<ProseKitEditorHandle, ProseKitEditorProps & { editor: any }>(
  ({ editor, className = "" }, ref) => {
    useImperativeHandle(ref, () => ({
      // "getMarkdown" name kept for interface compat; now returns raw HTML so that
      // inline styles (text-color, highlight) are preserved when the devotion is saved.
      getMarkdown: () => {
        return editor.getDocHTML();
      },
      setMarkdown: (content: string) => {
        // Support both new HTML storage and legacy Markdown storage.
        const html = isHtmlContent(content) ? content : markdownToHTML(content);
        const json = jsonFromHTML(html, { schema: editor.schema });
        editor.setContent(json);
      },
    }));

    return (
      <div className={`prosekit-editor flex flex-col w-full min-w-0 max-w-full overflow-hidden ${className}`}>
        {/* Content: first on mobile (top), second on desktop (below toolbar) */}
        <div className="order-first lg:order-0 relative flex-1 min-h-0 min-w-0 w-full overflow-x-hidden overflow-y-auto">
          <div
            ref={editor.mount}
            className="ProseMirror min-h-full min-w-0 w-full pl-4 sm:pl-16 pr-4 py-4 outline-none prose prose-stone dark:prose-invert max-w-none wrap-anywhere"
          />
          <EditorInlineMenu />
          <EditorSlashMenu />
          <EditorBlockHandle />
          <EditorDropIndicator />
          <EditorTableHandle />
        </div>
        {/* Toolbar: last on mobile (bottom, above keyboard), first on desktop (top) */}
        <div className="order-last lg:order-first min-w-0 w-full overflow-hidden">
          <EditorToolbar />
        </div>
        <div className="min-w-0 w-full overflow-hidden">
          <EditorFooter />
        </div>
      </div>
    );
  }
);

ProseKitEditorInner.displayName = "ProseKitEditorInner";

export const ProseKitEditor = forwardRef<ProseKitEditorHandle, ProseKitEditorProps>(
  ({ markdown = "", className = "" }, ref: ForwardedRef<ProseKitEditorHandle>) => {
    const editor = useMemo(() => {
      const extension = defineExtension();
      
      // Support both new HTML storage and legacy Markdown storage.
      let defaultContent = undefined;
      if (markdown) {
        defaultContent = isHtmlContent(markdown) ? markdown : markdownToHTML(markdown);
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
