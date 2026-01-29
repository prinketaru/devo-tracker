import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { SettingsForm } from "@/app/components/SettingsForm";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-50">
          Settings
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Manage your account and preferences.
        </p>
        <SettingsForm
          defaultName={session.user.name ?? ""}
          email={session.user.email ?? ""}
        />
      </div>
      <Footer />
    </main>
  );
}
