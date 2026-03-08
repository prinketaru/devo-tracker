import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeCTA() {
  return (
    <section className="bg-background border-t border-stone-200 dark:border-[#2a2720]">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <span className="inline-block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-widest">
          Stay updated
        </span>
        <h2 className="text-4xl font-bold text-stone-900 dark:text-[#d6d3c8] mb-4">
          See what&apos;s new
        </h2>
        <p className="text-lg text-stone-500 dark:text-[#7e7b72] mb-10 max-w-md mx-auto">
          Catch the latest updates and improvements to DayMark.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white rounded-xl font-semibold px-8 h-11 shadow-sm shadow-amber-600/20 transition-colors"
        >
          <Link href="/announcements">Read the latest update</Link>
        </Button>
      </div>
    </section>
  );
}
