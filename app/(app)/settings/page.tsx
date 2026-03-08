import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth-server";
import { Footer } from "@/app/components/Footer";
import { SettingsForm } from "@/app/components/SettingsForm";
import { UserPreferencesInit } from "@/app/components/UserPreferencesInit";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <UserPreferencesInit />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-[#EDE9E0] pl-2 sm:pl-0">
          Settings
        </h1>
        <SettingsForm
          defaultName={session.user.name ?? ""}
          email={session.user.email ?? ""}
          defaultImage={(session.user as { image?: string }).image ?? ""}
        />
      </div>
      <Footer />
    </main>
  );
}
