"use client";

import Link from "next/link";
import { FooterActions } from "@/app/components/FooterActions";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-zinc-800 bg-stone-100/50 dark:bg-zinc-950/50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-semibold group-hover:bg-amber-700 transition-colors">
              D
            </div>
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
              DayMark
            </span>
          </Link>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                Terms
              </Link>
            </div>
            <FooterActions />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          © {new Date().getFullYear()} DayMark — Daily devotion, made consistent.<br />
          <span className="text-xs">made with ❤️ by <a href="https://prinke.dev" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">prinke.dev</a></span>
        </p>
      </div>
    </footer>
  );
}
