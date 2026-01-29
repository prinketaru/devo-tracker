export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-center xl:max-w-5xl xl:px-8 2xl:max-w-6xl 2xl:px-10">
      <h1 className="mb-4 text-4xl font-bold text-stone-900 xl:text-5xl 2xl:text-6xl dark:text-stone-50">
        Build a daily devotion habit
      </h1>
      <p className="mx-auto mb-8 max-w-2xl text-lg text-stone-600 xl:text-xl 2xl:text-2xl dark:text-stone-300">
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
