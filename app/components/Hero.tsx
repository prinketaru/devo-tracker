import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/3 w-125 h-125 rounded-full bg-amber-500/5 dark:bg-amber-400/4 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-100 h-100 rounded-full bg-amber-600/4 dark:bg-amber-500/3 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-28 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/70 dark:border-amber-700/30">
          <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wider uppercase">
            Daily practice. Real growth.
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 dark:text-[#d6d3c8] mb-6 tracking-tight leading-[1.1]">
          Build a habit that
          <br />
          <span className="text-amber-600 dark:text-amber-400">sticks with you</span>
        </h1>

        <p className="text-lg sm:text-xl text-stone-500 dark:text-[#7e7b72] mb-12 max-w-2xl mx-auto leading-relaxed">
          Track your devotions, watch your streak grow, and deepen your faith — one day at a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white rounded-xl font-semibold text-base px-8 h-12 shadow-sm shadow-amber-600/20"
          >
            <Link href="/login">Get started — it&apos;s free</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl font-semibold text-base px-8 h-12 border-stone-200 dark:border-[#2a2720] text-stone-900 dark:text-[#d6d3c8] hover:bg-stone-100 dark:hover:bg-[#1e1c18]"
          >
            <a href="#features">See the features</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
