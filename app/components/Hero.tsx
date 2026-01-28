export function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4">
        Build a daily devotion habit
      </h1>
      <p className="text-lg text-stone-600 dark:text-stone-300 mb-8 max-w-2xl mx-auto">
        Simple tracking to keep your spiritual practice consistent and meaningful.
      </p>
      <div className="flex gap-3 justify-center">
        <button className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium text-sm cursor-pointer">
          Get Started
        </button>
        <button className="px-6 py-2 border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-stone-300 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors font-medium text-sm cursor-pointer">
          Learn More
        </button>
      </div>
    </section>
  );
}
