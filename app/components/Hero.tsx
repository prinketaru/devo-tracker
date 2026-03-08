import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 via-transparent to-transparent dark:from-amber-950/20 dark:via-transparent dark:to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-200/30 dark:bg-[#f0a531]/10 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400 mb-4">
          Daily devotion, made consistent
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-[#d6d3c8] mb-6 tracking-tight">
          Build a habit that
          <br />
          <span className="text-amber-700 dark:text-amber-400">sticks with you</span>
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 dark:text-[#b8b5ac] mb-10 max-w-2xl mx-auto leading-relaxed">
          Track your devotions, watch your streak grow, and deepen your faith—one day at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-[#f0a531] hover:bg-[#c0831a] text-stone-900 rounded-xl shadow-lg shadow-[#f0a531]/20"
          >
            <Link href="/login">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl border-2 border-stone-300 dark:border-zinc-600"
          >
            <a href="#features">See How It Works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
