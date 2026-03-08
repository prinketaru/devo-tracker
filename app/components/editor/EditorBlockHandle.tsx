"use client";

import { GripVertical, Plus } from "lucide-react";
import {
  BlockHandleAdd,
  BlockHandleDraggable,
  BlockHandlePopover,
} from "prosekit/react/block-handle";
import { DropIndicator as PrimitiveDropIndicator } from "prosekit/react/drop-indicator";

export function EditorBlockHandle() {
  return (
    <BlockHandlePopover strategy="fixed" className="-mx-1 hidden sm:flex gap-0.5 items-center">
      <BlockHandleAdd className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors">
        <Plus className="h-3.5 w-3.5" />
      </BlockHandleAdd>
      <BlockHandleDraggable className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground cursor-grab active:cursor-grabbing transition-colors">
        <GripVertical className="h-3.5 w-3.5" />
      </BlockHandleDraggable>
    </BlockHandlePopover>
  );
}

export function EditorDropIndicator() {
  return (
    <PrimitiveDropIndicator className="pointer-events-none absolute left-0 right-0 z-50 h-0.5 bg-blue-500" />
  );
}
