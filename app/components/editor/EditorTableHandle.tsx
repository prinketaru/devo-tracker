"use client";

import type { Editor } from "prosekit/core";
import { useEditorDerivedValue } from "prosekit/react";
import {
  TableHandleColumnRoot,
  TableHandleColumnTrigger,
  TableHandleDragPreview,
  TableHandleDropIndicator,
  TableHandlePopoverContent,
  TableHandlePopoverItem,
  TableHandleRoot,
  TableHandleRowRoot,
  TableHandleRowTrigger,
} from "prosekit/react/table-handle";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTableHandleState(editor: Editor<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmds = editor.commands as any;
  const safe = (fn: () => unknown, canExecFn: () => boolean) =>
    canExecFn ? { canExec: canExecFn(), command: fn } : { canExec: false, command: fn };

  return {
    addTableColumnBefore: safe(() => cmds.addTableColumnBefore?.(), () => cmds.addTableColumnBefore?.canExec()),
    addTableColumnAfter: safe(() => cmds.addTableColumnAfter?.(), () => cmds.addTableColumnAfter?.canExec()),
    deleteTableColumn: safe(() => cmds.deleteTableColumn?.(), () => cmds.deleteTableColumn?.canExec()),
    deleteCellSelection: safe(() => cmds.deleteCellSelection?.(), () => cmds.deleteCellSelection?.canExec()),
    addTableRowAbove: safe(() => cmds.addTableRowAbove?.(), () => cmds.addTableRowAbove?.canExec()),
    addTableRowBelow: safe(() => cmds.addTableRowBelow?.(), () => cmds.addTableRowBelow?.canExec()),
    deleteTableRow: safe(() => cmds.deleteTableRow?.(), () => cmds.deleteTableRow?.canExec()),
    deleteTable: safe(() => cmds.deleteTable?.(), () => cmds.deleteTable?.canExec()),
  };
}

const MENU_CLASS =
  "z-50 min-w-[140px] overflow-hidden rounded-md border border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5] dark:bg-[#171510] shadow-md p-1";

const ITEM_BASE =
  "flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-xs outline-none transition-colors text-stone-800 dark:text-stone-200 hover:bg-accent hover:text-accent-foreground";

const ITEM_DANGER =
  "flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";

const TRIGGER_CLASS =
  "flex h-4 w-4 items-center justify-center rounded bg-stone-200/80 dark:bg-zinc-700/80 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-zinc-600 cursor-pointer transition-colors";

export default function EditorTableHandle() {
  const state = useEditorDerivedValue(getTableHandleState);

  return (
    <TableHandleRoot className="contents">
      <TableHandleDragPreview className="opacity-70" />
      <TableHandleDropIndicator className="pointer-events-none absolute z-50 bg-blue-500" />

      {/* Column handle */}
      <TableHandleColumnRoot className="absolute top-0 z-20 flex items-center justify-center">
        <TableHandleColumnTrigger className={TRIGGER_CLASS}>
          <span className="text-[10px] leading-none">⋮</span>
        </TableHandleColumnTrigger>
        <TableHandlePopoverContent className={MENU_CLASS}>
          {state.addTableColumnBefore.canExec && (
            <TableHandlePopoverItem className={ITEM_BASE} onSelect={state.addTableColumnBefore.command}>
              Insert Left
            </TableHandlePopoverItem>
          )}
          {state.addTableColumnAfter.canExec && (
            <TableHandlePopoverItem className={ITEM_BASE} onSelect={state.addTableColumnAfter.command}>
              Insert Right
            </TableHandlePopoverItem>
          )}
          {state.deleteCellSelection.canExec && (
            <TableHandlePopoverItem className={ITEM_BASE} onSelect={state.deleteCellSelection.command}>
              <span>Clear</span>
              <kbd className="ml-auto text-[10px] opacity-60">Del</kbd>
            </TableHandlePopoverItem>
          )}
          {state.deleteTableColumn.canExec && (
            <TableHandlePopoverItem className={ITEM_DANGER} onSelect={state.deleteTableColumn.command}>
              Delete Column
            </TableHandlePopoverItem>
          )}
          {state.deleteTable.canExec && (
            <TableHandlePopoverItem className={ITEM_DANGER} onSelect={state.deleteTable.command}>
              Delete Table
            </TableHandlePopoverItem>
          )}
        </TableHandlePopoverContent>
      </TableHandleColumnRoot>

      {/* Row handle */}
      <TableHandleRowRoot className="absolute left-0 z-20 flex items-center justify-center">
        <TableHandleRowTrigger className={TRIGGER_CLASS}>
          <span className="text-[10px] leading-none">⋯</span>
        </TableHandleRowTrigger>
        <TableHandlePopoverContent className={MENU_CLASS}>
          {state.addTableRowAbove.canExec && (
            <TableHandlePopoverItem className={ITEM_BASE} onSelect={state.addTableRowAbove.command}>
              Insert Above
            </TableHandlePopoverItem>
          )}
          {state.addTableRowBelow.canExec && (
            <TableHandlePopoverItem className={ITEM_BASE} onSelect={state.addTableRowBelow.command}>
              Insert Below
            </TableHandlePopoverItem>
          )}
          {state.deleteCellSelection.canExec && (
            <TableHandlePopoverItem className={ITEM_BASE} onSelect={state.deleteCellSelection.command}>
              <span>Clear</span>
              <kbd className="ml-auto text-[10px] opacity-60">Del</kbd>
            </TableHandlePopoverItem>
          )}
          {state.deleteTableRow.canExec && (
            <TableHandlePopoverItem className={ITEM_DANGER} onSelect={state.deleteTableRow.command}>
              Delete Row
            </TableHandlePopoverItem>
          )}
          {state.deleteTable.canExec && (
            <TableHandlePopoverItem className={ITEM_DANGER} onSelect={state.deleteTable.command}>
              Delete Table
            </TableHandlePopoverItem>
          )}
        </TableHandlePopoverContent>
      </TableHandleRowRoot>
    </TableHandleRoot>
  );
}
