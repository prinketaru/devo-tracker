import { LegalLayout } from "@/app/components/LegalLayout";
import { getSession } from "@/app/lib/auth-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | DayMark",
  description: "Terms of Service for DayMark.",
};

export default async function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-stone-500 dark:text-[#7e7b72]">
              Last updated: March 2026
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Acceptance of Terms
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                By accessing or using DayMark, you agree to be bound by these Terms of Service. If you
                do not agree, please do not use the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Use of the Service
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed mb-3">
                You agree to use DayMark only for lawful purposes. You must not:
              </p>
              <ul className="space-y-2">
                {[
                  "Use the service to harass, abuse, or harm others",
                  "Attempt to gain unauthorized access to any part of the service",
                  "Use automated means to access the service without permission",
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
                Your Content
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                You retain ownership of the devotion entries, prayer requests, and other content you
                create in DayMark. By using the service, you grant us a limited license to store and
                display your content solely for providing the service to you.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Account Responsibility
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and for all
                activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Disclaimer of Warranties
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                DayMark is provided &quot;as is&quot; without warranties of any kind. We do not
                guarantee that the service will be uninterrupted, error-free, or completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Limitation of Liability
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                To the fullest extent permitted by law, DayMark and its creators shall not be liable
                for any indirect, incidental, or consequential damages arising from your use of the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-3">
                Changes to Terms
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                We may update these terms from time to time. Continued use of DayMark after changes
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="rounded-xl border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] p-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-[#d6d3c8] mb-2">
                Contact
              </h2>
              <p className="text-stone-600 dark:text-[#b8b5ac] leading-relaxed">
                Questions about these terms? Contact us via the feedback form in the app or email{" "}
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

