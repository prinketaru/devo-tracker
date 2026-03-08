"use client";

import { Bold, Code, Italic, Link2, Strikethrough, Underline } from "lucide-react";
import type { BasicExtension } from "prosekit/basic";
import type { Editor } from "prosekit/core";
import type { LinkAttrs } from "prosekit/extensions/link";
import type { EditorState } from "prosekit/pm/state";
import { useEditor, useEditorDerivedValue } from "prosekit/react";
import { InlinePopover } from "prosekit/react/inline-popover";
import { useState } from "react";

import { EditorButton } from "./EditorButton";

// ---------- Types ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyExtension = BasicExtension & any;

function getInlineMenuItems(editor: Editor<AnyExtension>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmds = editor.commands as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marks = editor.marks as any;
  return {
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
    link: cmds.addLink
      ? {
        isActive: marks.link.isActive(),
        canExec: cmds.addLink.canExec({ href: "" }),
        command: () => cmds.expandLink?.(),
        currentLink: getCurrentLink(editor.state) ?? "",
      }
      : undefined,
    textColor: cmds.addTextColor
      ? {
        isActive: marks.textColor?.isActive?.() ?? false,
        removeCommand: () => cmds.removeTextColor?.(),
        applyCommand: (color: string) => cmds.addTextColor?.({ color }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isColorActive: (color: string) => marks.textColor?.isActive?.({ color }) ?? false,
      }
      : undefined,
    bgColor: cmds.addBackgroundColor
      ? {
        isActive: marks.backgroundColor?.isActive?.() ?? false,
        removeCommand: () => cmds.removeBackgroundColor?.(),
        applyCommand: (color: string) => cmds.addBackgroundColor?.({ color }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isColorActive: (color: string) => marks.backgroundColor?.isActive?.({ color }) ?? false,
      }
      : undefined,
  };
}

function getCurrentLink(state: EditorState): string | undefined {
  const { $from } = state.selection;
  const marks = $from.marksAcross($from);
  if (!marks) return undefined;
  for (const mark of marks) {
    if (mark.type.name === "link") {
      return (mark.attrs as LinkAttrs).href;
    }
  }
  return undefined;
}

// ---------- Color swatches ----------

const TEXT_COLORS = [
  { label: "Default", value: "currentColor" },
  { label: "Gray", value: "#9ca3af" },
  { label: "Orange", value: "#ea580c" },
  { label: "Yellow", value: "#ca8a04" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#9333ea" },
  { label: "Red", value: "#dc2626" },
];

const BG_COLORS = [
  { label: "Default", value: "transparent" },
  { label: "Yellow", value: "#fef9c3" },
  { label: "Green", value: "#d1fae5" },
  { label: "Blue", value: "#dbeafe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fce7f3" },
  { label: "Red", value: "#fecaca" },
  { label: "Orange", value: "#ffedd5" },
];

// ---------- Component ----------

export default function EditorInlineMenu() {
  const editor = useEditor<AnyExtension>();
  const items = useEditorDerivedValue(getInlineMenuItems);
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  const handleLinkUpdate = (href?: string) => {
    if (href) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.commands as any).addLink?.({ href });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.commands as any).removeLink?.();
    }
    setLinkMenuOpen(false);
    editor.focus();
  };

  const menuClass =
    "z-50 flex items-center gap-0.5 rounded-lg border border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510] shadow-md p-0.5";

  return (
    <>
      {/* Main formatting popover */}
      <InlinePopover
        data-testid="inline-menu-main"
        className={menuClass}
        onOpenChange={(open) => {
          if (!open) {
            setLinkMenuOpen(false);
            setColorMenuOpen(false);
          }
        }}
      >
        {items.bold && (
          <EditorButton pressed={items.bold.isActive} disabled={!items.bold.canExec} onClick={items.bold.command} tooltip="Bold">
            <Bold className="h-4 w-4" />
          </EditorButton>
        )}
        {items.italic && (
          <EditorButton pressed={items.italic.isActive} disabled={!items.italic.canExec} onClick={items.italic.command} tooltip="Italic">
            <Italic className="h-4 w-4" />
          </EditorButton>
        )}
        {items.underline && (
          <EditorButton pressed={items.underline.isActive} disabled={!items.underline.canExec} onClick={items.underline.command} tooltip="Underline">
            <Underline className="h-4 w-4" />
          </EditorButton>
        )}
        {items.strike && (
          <EditorButton pressed={items.strike.isActive} disabled={!items.strike.canExec} onClick={items.strike.command} tooltip="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </EditorButton>
        )}
        {items.code && (
          <EditorButton pressed={items.code.isActive} disabled={!items.code.canExec} onClick={items.code.command} tooltip="Code">
            <Code className="h-4 w-4" />
          </EditorButton>
        )}
        {items.link && items.link.canExec && (
          <EditorButton
            pressed={items.link.isActive}
            onClick={() => {
              items.link?.command?.();
              setLinkMenuOpen((o) => !o);
            }}
            tooltip="Link"
          >
            <Link2 className="h-4 w-4" />
          </EditorButton>
        )}
        {/* Text / Background color button */}
        {(items.textColor || items.bgColor) && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setColorMenuOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            title="Color"
          >
            <span className="text-base font-bold leading-none"
              style={{ color: items.textColor?.isActive ? undefined : undefined }}>
              A
            </span>
          </button>
        )}
      </InlinePopover>

      {/* Link edit popover */}
      {items.link && (
        <InlinePopover
          placement="bottom"
          defaultOpen={false}
          open={linkMenuOpen}
          onOpenChange={setLinkMenuOpen}
          className="z-50 flex flex-col gap-1 rounded-lg border border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510] shadow-md p-2 min-w-[220px]"
        >
          {linkMenuOpen && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const href = (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.value?.trim();
                handleLinkUpdate(href);
              }}
              className="flex gap-1"
            >
              <input
                className="flex-1 rounded border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] px-2 py-1 text-xs text-stone-900 dark:text-stone-200 outline-none focus:ring-1 focus:ring-amber-500/70"
                placeholder="Paste link..."
                defaultValue={items.link.currentLink}
                autoFocus
              />
              <button
                type="submit"
                className="rounded bg-[#f0a531] px-2 py-1 text-xs font-medium text-stone-900 hover:bg-[#c0831a]"
              >
                Apply
              </button>
            </form>
          )}
          {items.link.isActive && (
            <button
              type="button"
              onClick={() => handleLinkUpdate()}
              onMouseDown={(e) => e.preventDefault()}
              className="text-left text-xs text-red-600 dark:text-red-400 hover:underline px-1"
            >
              Remove link
            </button>
          )}
        </InlinePopover>
      )}

      {/* Color picker popover */}
      {(items.textColor || items.bgColor) && colorMenuOpen && (
        <InlinePopover
          placement="bottom"
          open={colorMenuOpen}
          onOpenChange={setColorMenuOpen}
          className="z-50 rounded-lg border border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510] shadow-md p-3 w-52"
        >
          {items.textColor && (
            <div className="mb-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Text color</p>
              <div className="flex flex-wrap gap-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (c.value === "currentColor") {
                        items.textColor?.removeCommand();
                      } else {
                        items.textColor?.applyCommand(c.value);
                      }
                    }}
                    className={`w-6 h-6 rounded border-2 transition-all ${items.textColor?.isColorActive(c.value) ? "border-amber-500 scale-110" : "border-stone-200 dark:border-stone-700 hover:scale-110"}`}
                    style={{ backgroundColor: c.value === "currentColor" ? "transparent" : c.value }}
                  >
                    {c.value === "currentColor" && <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300">A</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {items.bgColor && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Highlight</p>
              <div className="flex flex-wrap gap-1">
                {BG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (c.value === "transparent") {
                        items.bgColor?.removeCommand();
                      } else {
                        items.bgColor?.applyCommand(c.value);
                      }
                    }}
                    className={`w-6 h-6 rounded border-2 transition-all ${items.bgColor?.isColorActive(c.value) ? "border-amber-500 scale-110" : "border-stone-200 dark:border-stone-700 hover:scale-110"}`}
                    style={{ backgroundColor: c.value === "transparent" ? undefined : c.value }}
                  >
                    {c.value === "transparent" && <span className="text-[10px]">✕</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </InlinePopover>
      )}
    </>
  );
}
