"use client";

import Link from "next/link";
import { FooterActions } from "@/app/components/FooterActions";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-[#2a2720] bg-stone-100/50 dark:bg-background/50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-center text-sm text-stone-500 dark:text-[#7e7b72]">
          © {new Date().getFullYear()} DayMark — Daily devotion, made consistent.<br />
          <span className="text-xs">made with ❤️ by <a href="https://prinke.dev" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">prinke.dev</a></span>
        </p>
      </div>
    </footer>
  );
}
