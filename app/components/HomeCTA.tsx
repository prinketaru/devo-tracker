import Link from "next/link";

export function HomeCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-amber-50/50 dark:via-amber-950/20 to-transparent dark:to-transparent" aria-hidden />
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4">
          Ready to grow?
        </h2>
        <p className="text-lg text-stone-600 dark:text-stone-300 mb-8">
          Join Devo Tracker and build a devotion habit that sticks.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-10 py-4 bg-amber-600 text-white rounded-xl font-semibold text-lg hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-lg shadow-amber-600/25"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
