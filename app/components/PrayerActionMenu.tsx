"use client";

import { useState, useRef, useEffect } from "react";

import { FiMoreVertical, FiEdit2, FiCheck, FiTrash2, FiRefreshCw } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PrayerActionMenuProps {
  onEdit?: () => void;
  onAnswered?: () => void;
  onRestore?: () => void;
  onDelete: () => void;
  isAnswered?: boolean;
}

export default function PrayerActionMenu({
  onEdit,
  onAnswered,
  onRestore,
  onDelete,
  isAnswered = false,
}: PrayerActionMenuProps) {
  return (
    <>
      {/* Mobile: Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-8 w-8 text-stone-400 dark:text-stone-500"
            aria-label="Options"
          >
            <FiMoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <FiEdit2 size={14} className="mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {isAnswered ? (
            onRestore && (
              <DropdownMenuItem onClick={onRestore}>
                <FiRefreshCw size={14} className="mr-2" />
                Restore
              </DropdownMenuItem>
            )
          ) : (
            onAnswered && (
              <DropdownMenuItem onClick={onAnswered}>
                <FiCheck size={14} className="mr-2" />
                Mark Answered
              </DropdownMenuItem>
            )
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
          >
            <FiTrash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop Buttons */}
      <div className="hidden sm:flex items-center gap-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 px-2 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            Edit
          </Button>
        )}

        {isAnswered ? (
          onRestore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRestore}
              className="h-7 px-2 text-[10px] font-medium text-stone-600 dark:text-[#b8b5ac] hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              Restore
            </Button>
          )
        ) : (
          onAnswered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAnswered}
              className="h-7 px-2 text-[10px] font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              ✓ Ans.
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 px-2 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          ✕
        </Button>
      </div>
    </>
  );
}
