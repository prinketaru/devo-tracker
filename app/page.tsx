import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth-server";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { HomeCTA } from "./components/HomeCTA";
import { Footer } from "./components/Footer";
import { AnnouncementBanner } from "./components/AnnouncementBanner";
import { getAnnouncements } from "./lib/announcements";

export default async function Home() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const announcements = await getAnnouncements();
  const latestAnnouncement = announcements[0];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header />
      <main>
        {latestAnnouncement && (
          <div className="max-w-6xl mx-auto px-6 pt-8">
            <AnnouncementBanner announcement={latestAnnouncement} />
          </div>
        )}
        <Hero />
        <Features />
        <HowItWorks />
        <HomeCTA />
      </main>
      <Footer />
    </div>
  );
}