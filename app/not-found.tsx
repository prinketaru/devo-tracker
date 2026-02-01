import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <p className="text-6xl font-semibold text-amber-600 dark:text-amber-500 mb-4">404</p>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50 mb-2">
            Page not found
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
