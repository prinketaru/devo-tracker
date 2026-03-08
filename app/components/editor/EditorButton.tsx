"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { TooltipContent, TooltipRoot, TooltipTrigger } from "prosekit/react/tooltip";

export function EditorButton({
  pressed,
  disabled,
  onClick,
  tooltip,
  children,
  className = "",
}: {
  pressed?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  tooltip?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TooltipRoot>
      <TooltipTrigger className="flex items-center justify-center">
        <button
          type="button"
          data-state={pressed ? "on" : "off"}
          disabled={disabled}
          onClick={onClick}
          onMouseDown={(e) => e.preventDefault()}
          className={[
            "inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:pointer-events-none disabled:opacity-40",
            pressed ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            className,
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
