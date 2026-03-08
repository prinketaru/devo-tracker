import { getSession } from "@/app/lib/auth-server";
import { redirect } from "next/navigation";
import { FullPrayerSection } from "@/app/components/FullPrayerSection";
import Link from "next/link";
import { ChevronLeft, Heart } from "lucide-react";
import { Footer } from "@/app/components/Footer";

export const metadata = {
    title: "Prayer | DayMark",
    description: "Manage and focus on your prayer requests.",
};

export default async function PrayerPage() {
    const session = await getSession();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Back nav */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-[#7e7b72] hover:text-stone-900 dark:hover:text-[#d6d3c8] mb-6 transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Dashboard
                </Link>

                {/* Page header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                        <Heart className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-stone-900 dark:text-[#d6d3c8] leading-tight">
                            Prayer
                        </h1>
                        <p className="text-sm text-stone-500 dark:text-[#7e7b72]">
                            Bring your requests before God, celebrate answered prayers.
                        </p>
                    </div>
                </div>

                <FullPrayerSection />
            </div>
            <Footer />
        </main>
    );
}
