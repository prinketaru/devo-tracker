import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 via-transparent to-transparent dark:from-amber-950/20 dark:via-transparent dark:to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-200/30 dark:bg-amber-600/10 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400 mb-4">
          Daily devotion, made consistent
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-stone-50 mb-6 tracking-tight">
          Build a habit that
          <br />
          <span className="text-amber-700 dark:text-amber-400">sticks with you</span>
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Track your devotions, watch your streak grow, and deepen your faith—one day at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-amber-600 text-white rounded-xl font-semibold text-base hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-lg shadow-amber-600/20"
          >
            Get Started
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-stone-300 dark:border-zinc-600 text-stone-700 dark:text-stone-200 rounded-xl font-semibold text-base hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
