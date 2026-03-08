import Link from "next/link";
import { Footer } from "@/app/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#100f0c] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <p className="text-6xl font-semibold text-amber-600 dark:text-amber-500 mb-4">404</p>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-[#EDE9E0] mb-2">
            Page not found
          </h1>
          <p className="text-stone-600 dark:text-[#8A8070] mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-[#f0a531] px-6 py-3 text-sm font-medium text-stone-900 hover:bg-[#c0831a] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
