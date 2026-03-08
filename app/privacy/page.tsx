import { LegalLayout } from "@/app/components/LegalLayout";
import { getSession } from "@/app/lib/auth-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DayMark",
  description: "Privacy Policy for DayMark — how we collect, use, and protect your information.",
};

export default async function PrivacyPage() {
  const session = await getSession();

  return (
    <LegalLayout isLoggedIn={!!session?.user}>
      <main className="flex-1 px-6 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10 pb-8 border-b border-stone-200 dark:border-[#2a2720]">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">
              Legal
            </p>
            <h1 className="text-4xl font-bold text-stone-900 dark:text-[#d6d3c8] mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-stone-500 dark:text-[#7e7b72]">
              Last updated: March 2026
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Information We Collect
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                We collect information you provide directly when you create an account, write devotion
                entries, add prayer requests, or contact us. This includes your name, email address,
                and any content you create within the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                How We Use Your Information
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed mb-3">
                We use your information to:
              </p>
              <ul className="space-y-2">
                {[
                  "Provide, maintain, and improve DayMark",
                  "Send daily reminders and weekly digest emails you opt into",
                  "Communicate with accountability partners you invite",
                  "Respond to your feedback and support requests",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-stone-600 dark:text-[#b8b5ac]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Data Storage
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                Your devotion entries, prayer requests, and preferences are stored securely in our
                database. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Third-Party Services
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed mb-3">
                We use the following third-party services:
              </p>
              <div className="rounded-xl border border-stone-200 dark:border-[#2a2720] divide-y divide-stone-200 dark:divide-[#2a2720] overflow-hidden">
                {[
                  { name: "Google / Discord OAuth", purpose: "Account sign-in" },
                  { name: "SMTP2GO", purpose: "Reminder and digest emails" },
                  { name: "ESV API", purpose: "Bible passage lookup" },
                  { name: "Firebase Cloud Messaging", purpose: "Push notifications" },
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-[#171510]">
                    <span className="text-sm font-medium text-stone-900 dark:text-[#d6d3c8]">{service.name}</span>
                    <span className="text-sm text-stone-500 dark:text-[#7e7b72]">{service.purpose}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Data Retention &amp; Deletion
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                You can export or permanently delete your account and all associated data at any time
                from the Settings page. Deletion is immediate and irreversible.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Cookies &amp; Analytics
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                We use session cookies required for authentication. We do not use third-party analytics
                or advertising trackers.
              </p>
            </section>

            <section className="rounded-xl border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] p-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-2">
                Contact
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                If you have any questions about this policy, please reach out via the feedback form in
                the app or email{" "}
                <a href="mailto:prince@prinke.dev" className="text-amber-600 dark:text-amber-400 hover:underline">
                  prince@prinke.dev
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </LegalLayout>
  );
}

