import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-amber-50/50 dark:via-amber-950/20 to-transparent dark:to-transparent" aria-hidden />
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-[#d6d3c8] mb-4">
          See what&apos;s new
        </h2>
        <p className="text-lg text-stone-600 dark:text-[#b8b5ac] mb-8">
          Catch the latest updates and improvements to DayMark.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-[#f0a531] hover:bg-[#c0831a] text-stone-900 rounded-xl shadow-lg shadow-[#f0a531]/25 text-lg px-10 py-4 h-auto"
        >
          <Link href="/announcements">Read the latest update</Link>
        </Button>
      </div>
    </section>
  );
}
