import { Footer } from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DayMark",
  description: "Privacy Policy for DayMark — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#100f0c] flex flex-col">
      <main className="flex-1 px-6 py-12 sm:py-16">
        <article className="max-w-2xl mx-auto prose prose-stone dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: March 2026</p>

          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly when you create an account, write devotion
            entries, add prayer requests, or contact us. This includes your name, email address,
            and any content you create within the app.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide, maintain, and improve DayMark</li>
            <li>Send daily reminders and weekly digest emails you opt into</li>
            <li>Communicate with accountability partners you invite</li>
            <li>Respond to your feedback and support requests</li>
          </ul>

          <h2>Data Storage</h2>
          <p>
            Your devotion entries, prayer requests, and preferences are stored securely in our
            database. We do not sell your personal information to third parties.
          </p>

          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Google / Discord OAuth</strong> — for account sign-in</li>
            <li><strong>SMTP2GO</strong> — to deliver reminder and digest emails</li>
            <li><strong>ESV API</strong> — to fetch Bible passages</li>
            <li><strong>Firebase Cloud Messaging</strong> — for push notifications</li>
          </ul>

          <h2>Data Retention &amp; Deletion</h2>
          <p>
            You can export or permanently delete your account and all associated data at any time
            from the Settings page. Deletion is immediate and irreversible.
          </p>

          <h2>Cookies &amp; Analytics</h2>
          <p>
            We use session cookies required for authentication. We do not use third-party analytics
            or advertising trackers.
          </p>

          <h2>Contact</h2>
          <p>
            If you have any questions about this policy, please reach out via the feedback form in
            the app or email{" "}
            <a href="mailto:prince@prinke.dev">prince@prinke.dev</a>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
