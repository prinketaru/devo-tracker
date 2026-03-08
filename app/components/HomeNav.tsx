import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-stone-200 dark:border-[#2a2720] bg-background/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-linear-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-sm font-bold shadow-sm">
            D
          </div>
          <span className="text-lg font-semibold tracking-wide font-serif text-stone-900 dark:text-[#d6d3c8]">
            DayMark
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/announcements"
            className="hidden sm:block text-sm text-stone-500 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-[#d6d3c8] transition-colors"
          >
            Updates
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white rounded-lg font-medium px-4"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
