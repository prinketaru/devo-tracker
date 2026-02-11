"use client";

import { useState, useRef, useEffect } from "react";

import { FiMoreVertical, FiEdit2, FiCheck, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";

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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside logic
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="sm:hidden -mr-2 p-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors rounded-full"
        aria-label="Options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FiMoreVertical size={16} />
      </button>

      {/* Desktop Buttons (Visible on SM and up) - No changes here */}
      <div className="hidden sm:flex items-center gap-1">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md px-2 py-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            title="Edit"
          >
            Edit
          </button>
        )}
        
        {isAnswered ? (
          onRestore && (
            <button
              type="button"
              onClick={onRestore}
              className="rounded-md px-2 py-1 text-[10px] font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Restore"
            >
              Restore
            </button>
          )
        ) : (
          onAnswered && (
            <button
              type="button"
              onClick={onAnswered}
              className="rounded-md px-2 py-1 text-[10px] font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
              title="Mark answered"
            >
              ✓ Ans.
            </button>
          )
        )}

        <button
          type="button"
          onClick={onDelete}
          className="rounded-md px-2 py-1 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Delete"
        >
          ✕
        </button>
      </div>

      {/* Mobile Dropdown Menu (Absolute positioning) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg sm:hidden py-1"
          >
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800"
              >
                <FiEdit2 size={14} className="text-stone-500 dark:text-stone-400" />
                Edit
              </button>
            )}

            {isAnswered ? (
              onRestore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800"
                >
                  <FiRefreshCw size={14} className="text-stone-500 dark:text-stone-400" />
                  Restore
                </button>
              )
            ) : (
              onAnswered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnswered();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800"
                >
                  <FiCheck size={14} className="text-stone-500 dark:text-stone-400" />
                  Mark Answered
                </button>
              )
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
            >
              <FiTrash2 size={14} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
