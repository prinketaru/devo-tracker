"use client";

import { canUseRegexLookbehind } from "prosekit/core";
import { useEditor } from "prosekit/react";
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover,
} from "prosekit/react/autocomplete";

// Match "/" at start of word, optionally followed by non-space chars
const SLASH_REGEX = canUseRegexLookbehind()
  ? /(?<!\S)\/(\S.*)?$/u
  : /\/(\S.*)?$/u;

const ITEM_CLASS =
  "flex w-full cursor-default select-none items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-stone-800 dark:text-stone-200 aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground";

const KBD_CLASS =
  "ml-auto rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#1e1c18] px-1 py-0.5 font-mono text-[10px] text-stone-500 dark:text-stone-400";

function SlashMenuItem({
  label,
  kbd,
  onSelect,
}: {
  label: string;
  kbd?: string;
  onSelect: () => void;
}) {
  return (
    <AutocompleteItem onSelect={onSelect} className={ITEM_CLASS}>
      <span>{label}</span>
      {kbd && <kbd className={KBD_CLASS}>{kbd}</kbd>}
    </AutocompleteItem>
  );
}

function SlashMenuEmpty() {
  return (
    <AutocompleteEmpty className={ITEM_CLASS}>
      <span>No results</span>
    </AutocompleteEmpty>
  );
}

export default function EditorSlashMenu() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editor = useEditor<any>();

  return (
    <AutocompletePopover
      regex={SLASH_REGEX}
      className="z-50 w-56 overflow-hidden rounded-lg border border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510] shadow-lg p-1"
    >
      <AutocompleteList>
        <SlashMenuItem label="Text" onSelect={() => (editor.commands as any).setParagraph?.()} />
        <SlashMenuItem label="Heading 1" kbd="#" onSelect={() => (editor.commands as any).setHeading?.({ level: 1 })} />
        <SlashMenuItem label="Heading 2" kbd="##" onSelect={() => (editor.commands as any).setHeading?.({ level: 2 })} />
        <SlashMenuItem label="Heading 3" kbd="###" onSelect={() => (editor.commands as any).setHeading?.({ level: 3 })} />
        <SlashMenuItem label="Bullet list" kbd="-" onSelect={() => (editor.commands as any).wrapInList?.({ kind: "bullet" })} />
        <SlashMenuItem label="Ordered list" kbd="1." onSelect={() => (editor.commands as any).wrapInList?.({ kind: "ordered" })} />
        <SlashMenuItem label="Task list" kbd="[]" onSelect={() => (editor.commands as any).wrapInList?.({ kind: "task" })} />
        <SlashMenuItem label="Quote" kbd=">" onSelect={() => (editor.commands as any).setBlockquote?.()} />
        <SlashMenuItem label="Table" onSelect={() => (editor.commands as any).insertTable?.({ row: 3, col: 3 })} />
        <SlashMenuItem label="Divider" kbd="---" onSelect={() => (editor.commands as any).insertHorizontalRule?.()} />
        <SlashMenuItem label="Code block" kbd="```" onSelect={() => (editor.commands as any).setCodeBlock?.()} />
        <SlashMenuEmpty />
      </AutocompleteList>
    </AutocompletePopover>
  );
}
