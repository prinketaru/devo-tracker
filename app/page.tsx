import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth-server";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";

export default async function Home() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}