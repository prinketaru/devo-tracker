export const metadata = {
  title: "Terms of Service | DayMark",
  description: "Terms of Service for DayMark.",
};

import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-50">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Effective date: February 10, 2026
        </p>

        <div className="mt-8 space-y-10 text-sm text-stone-700 dark:text-stone-300">
          <section>
            <p>
              These Terms of Service (“Terms”) govern your access to and use of
              DayMark (the “Service”), a website created and operated by Prince
              (also known online as prinke) (“we,” “us,” or “our”). By accessing
              or using the Service, you agree to these Terms.
            </p>
            <p className="mt-4">
              If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              1) Eligibility
            </h2>
            <p className="mt-2">
              DayMark is not intended for children. By using the Service, you
              represent that you are old enough to use it under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              2) Accounts and authentication
            </h2>
            <p className="mt-2">
              You may create an account and sign in using Google or Discord OAuth,
              or by using an email one-time passcode (OTP). You are responsible
              for maintaining the confidentiality of your account and for all
              activity that occurs under your account.
            </p>
            <p className="mt-2">
              If you believe your account has been compromised, contact us via
              the feedback form or at{" "}
              <a
                className="underline underline-offset-2"
                href="mailto:prince@prinke.dev"
              >
                prince@prinke.dev
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              3) The Service and acceptable use
            </h2>
            <p className="mt-2">
              DayMark is intended to help users track devotions, streaks, prayer
              requests, and related notes. You agree to use the Service only for
              lawful purposes and in accordance with these Terms.
            </p>

            <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">
              You agree not to:
            </h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Violate any applicable law or regulation.</li>
              <li>
                Upload, post, or share content that is unlawful, harmful,
                threatening, abusive, harassing, defamatory, obscene, or otherwise
                objectionable.
              </li>
              <li>
                Infringe or violate the intellectual property or privacy rights
                of others.
              </li>
              <li>
                Attempt to gain unauthorized access to the Service, accounts, or
                systems.
              </li>
              <li>
                Interfere with or disrupt the Service (including by introducing
                malware, scraping at unreasonable rates, or attempting to
                overload infrastructure).
              </li>
              <li>
                Use the Service to send spam or misleading communications.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              4) User content
            </h2>
            <p className="mt-2">
              The Service allows you to create and store content such as devotion
              notes/journaling and prayer requests (“User Content”). You retain
              ownership of your User Content.
            </p>
            <p className="mt-2">
              You are responsible for your User Content, including ensuring you
              have the right to post it and that it does not violate these Terms.
            </p>

            <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">
              License to operate the Service
            </h3>
            <p className="mt-2">
              You grant us a limited, non-exclusive, worldwide, royalty-free
              license to host, store, process, reproduce, and display your User
              Content solely to provide, maintain, and improve the Service and
              to operate features you choose to use (such as share links).
            </p>

            <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">
              Sharing and public links
            </h3>
            <p className="mt-2">
              Devotion notes are private by default. If you generate a share link
              for a devotion note, anyone with the link may be able to view that
              shared content. You are responsible for who you share links with.
            </p>
            <p className="mt-2">
              Prayer requests are intended to be private and are not shared with
              other users through the Service.
            </p>

            <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">
              Accountability partners
            </h3>
            <p className="mt-2">
              If you add accountability partners, they may see your streak and
              whether you completed a devotion for the day, but they cannot see
              the contents of your devotion notes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              5) Privacy
            </h2>
            <p className="mt-2">
              Our Privacy Policy explains how we collect, use, and share
              information. By using the Service, you agree that we can process
              your information as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              6) Third-party services
            </h2>
            <p className="mt-2">
              The Service may rely on third-party services for hosting, analytics,
              authentication, notifications, and database infrastructure. Your
              use of those third-party services may be subject to their own terms
              and policies (for example: Google, Discord, Vercel, MongoDB Atlas,
              SendGrid, Firebase, and Umami).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              7) Availability and changes
            </h2>
            <p className="mt-2">
              We may change, suspend, or discontinue any part of the Service at
              any time, including adding or removing features. We do not promise
              that the Service will always be available or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              8) Account termination and deletion
            </h2>
            <p className="mt-2">
              You can delete your account in settings at any time. When you delete
              your account, your stored content and associated account data are
              deleted as part of normal operation.
            </p>
            <p className="mt-2">
              We may suspend or terminate access to the Service if we reasonably
              believe you have violated these Terms, used the Service unlawfully,
              or pose a security risk. Where reasonable, we will try to provide
              notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              9) Disclaimers
            </h2>
            <p className="mt-2">
              The Service is provided “as is” and “as available,” without
              warranties of any kind, express or implied, including implied
              warranties of merchantability, fitness for a particular purpose,
              and non-infringement.
            </p>
            <p className="mt-2">
              DayMark is not a medical, mental health, legal, or financial
              service. We do not provide professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              10) Limitation of liability
            </h2>
            <p className="mt-2">
              To the maximum extent permitted by law, we will not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits or revenues, whether incurred
              directly or indirectly, or any loss of data, use, goodwill, or
              other intangible losses, resulting from (a) your access to or use
              of (or inability to access or use) the Service; (b) any conduct or
              content of any third party on the Service; or (c) unauthorized
              access, use, or alteration of your transmissions or content.
            </p>
            <p className="mt-2">
              To the maximum extent permitted by law, our total liability for
              any claim arising out of or relating to the Service will not
              exceed $100 USD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              11) Indemnification
            </h2>
            <p className="mt-2">
              You agree to indemnify and hold harmless DayMark and its operator
              from and against any claims, liabilities, damages, losses, and
              expenses (including reasonable attorneys’ fees) arising out of or
              related to your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              12) Governing law
            </h2>
            <p className="mt-2">
              These Terms are governed by the laws of the Commonwealth of
              Pennsylvania, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              13) Changes to these Terms
            </h2>
            <p className="mt-2">
              We may update these Terms from time to time. If we make changes, we
              will update the effective date above. If changes are material, we
              may provide additional notice within the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              14) Contact
            </h2>
            <p className="mt-2">
              Questions about these Terms:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                Email:{" "}
                <a
                  className="underline underline-offset-2"
                  href="mailto:prince@prinke.dev"
                >
                  prince@prinke.dev
                </a>
              </li>
              <li>Feedback form: available within the DayMark site</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
