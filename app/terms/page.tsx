import { Footer } from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | DayMark",
  description: "Terms of Service for DayMark.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#100f0c] flex flex-col">
      <main className="flex-1 px-6 py-12 sm:py-16">
        <article className="max-w-2xl mx-auto prose prose-stone dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="lead">Last updated: March 2026</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing or using DayMark, you agree to be bound by these Terms of Service. If you
            do not agree, please do not use the app.
          </p>

          <h2>Use of the Service</h2>
          <p>You agree to use DayMark only for lawful purposes. You must not:</p>
          <ul>
            <li>Use the service to harass, abuse, or harm others</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Use automated means to access the service without permission</li>
          </ul>

          <h2>Your Content</h2>
          <p>
            You retain ownership of the devotion entries, prayer requests, and other content you
            create in DayMark. By using the service, you grant us a limited license to store and
            display your content solely for providing the service to you.
          </p>

          <h2>Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and for all
            activities that occur under your account.
          </p>

          <h2>Disclaimer of Warranties</h2>
          <p>
            DayMark is provided &quot;as is&quot; without warranties of any kind. We do not
            guarantee that the service will be uninterrupted, error-free, or completely secure.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, DayMark and its creators shall not be liable
            for any indirect, incidental, or consequential damages arising from your use of the
            service.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of DayMark after changes
            constitutes acceptance of the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact us via the feedback form in the app or email{" "}
            <a href="mailto:prince@prinke.dev">prince@prinke.dev</a>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
