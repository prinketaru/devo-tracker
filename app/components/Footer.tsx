import Link from "next/link";

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
              Devo Tracker
            </span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/login"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Sign In
            </Link>
            <a
              href="#features"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Features
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          © {new Date().getFullYear()} Devo Tracker — Daily devotion, made consistent.
        </p>
      </div>
    </footer>
  );
}
