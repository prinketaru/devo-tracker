"use client";

import Link from "next/link";
import { FooterActions } from "@/app/components/FooterActions";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-[#2a2720] bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-linear-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-[10px] font-bold">
            D
          </div>
          <span className="text-sm font-medium text-stone-600 dark:text-[#b8b5ac] font-serif">DayMark</span>
        </div>
        <p className="text-center text-xs text-stone-400 dark:text-[#7e7b72]">
          © {new Date().getFullYear()} DayMark — made with ❤️ by{" "}
          <a href="https://prinke.dev" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">
            prinke.dev
          </a>
        </p>
        <div className="hidden sm:block w-20" />{/* balance spacer */}
      </div>
    </footer>
  );
}
