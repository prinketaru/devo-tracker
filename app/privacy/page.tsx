export const metadata = {
  title: "Privacy Policy | DayMark",
  description: "Privacy policy for DayMark.",
};

import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-50">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Effective date: February 10, 2026
        </p>

        <div className="mt-8 space-y-10 text-sm text-stone-700 dark:text-stone-300">
          <section>
            <p>
              DayMark (“DayMark,” “we,” “us,” or “our”) is a website created and
              operated by an individual developer, Prince (also known online as
              prinke). This Privacy Policy explains how we collect, use,
              disclose, and protect information when you use DayMark (the
              “Service”).
            </p>
            <p className="mt-4">
              If you have questions or requests, contact us at{" "}
              <a
                className="underline underline-offset-2"
                href="mailto:prince@prinke.dev"
              >
                prince@prinke.dev
              </a>{" "}
              or via the in-app feedback form.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              1) What information we collect
            </h2>

            <div className="mt-3 space-y-6">
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  A. Account and authentication information
                </h3>
                <p className="mt-2">
                  When you create an account or sign in, we collect information
                  needed to authenticate you and provide the Service:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-medium">OAuth login (Google or Discord):</span>{" "}
                    We receive certain account information from the provider,
                    typically including a unique account identifier and basic
                    profile information such as name, email address, and/or
                    avatar, depending on what the provider shares and what you
                    authorize.
                  </li>
                  <li>
                    <span className="font-medium">Email OTP login:</span> We collect your
                    email address to send a one-time passcode and authenticate
                    you.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  B. Content you provide in the Service
                </h3>
                <p className="mt-2">
                  DayMark is designed for devotion tracking and related personal
                  content. You may provide:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Devotion notes / journaling (you can write anything in notes)</li>
                  <li>Prayer requests (private)</li>
                  <li>Streaks and completion status (e.g., whether you completed a devotion that day)</li>
                  <li>Accountability partners information (e.g., partner relationships and sharing preferences)</li>
                </ul>
                <p className="mt-2">
                  <span className="font-medium">Important:</span> While DayMark is not
                  intended for sensitive data, your notes or prayer requests may
                  include personal or sensitive details depending on what you
                  choose to write.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  C. Usage data (analytics)
                </h3>
                <p className="mt-2">
                  We collect limited usage information to understand how the
                  Service is used and to improve it. We use Umami analytics
                  (configured to be GDPR-compliant). This may collect data such
                  as:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Pages visited and navigation events</li>
                  <li>Approximate device/browser information</li>
                  <li>
                    Approximate location (derived from IP at a coarse level) and
                    general referrer information
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  D. Notifications data
                </h3>
                <p className="mt-2">
                  If you enable notifications:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-medium">Email notifications:</span> We process your
                    email address and notification preferences, and we use
                    SendGrid to deliver emails.
                  </li>
                  <li>
                    <span className="font-medium">Push notifications:</span> We use Firebase
                    Cloud Messaging to deliver push notifications to your device.
                    This typically involves device tokens/identifiers used for
                    delivering notifications.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  E. Automatically collected technical data
                </h3>
                <p className="mt-2">
                  Like most websites, our servers and infrastructure may process
                  basic technical data (for example: IP address, device/browser
                  type, timestamps, and logs) to operate and secure the Service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              2) How we use your information
            </h2>
            <p className="mt-2">We use information we collect to:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Provide and maintain the Service (accounts, login, saving your data)</li>
              <li>
                Enable features such as streak tracking, devotion completion status,
                and accountability partner sharing (limited as described below)
              </li>
              <li>Create share links for devotion notes when you choose to share</li>
              <li>Send email and push notifications you request or enable</li>
              <li>Monitor, troubleshoot, and improve the Service (including analytics)</li>
              <li>Help keep the Service secure and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              3) How sharing works in DayMark
            </h2>

            <div className="mt-3 space-y-6">
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  A. Devotion note sharing
                </h3>
                <p className="mt-2">
                  Devotion notes are private by default. You can choose to share
                  a specific devotion note by generating a share link for that
                  devotion. Anyone with the link may be able to view the shared
                  devotion note.
                </p>
                <p className="mt-2">
                  You are responsible for who you share the link with. If you
                  want to stop sharing, you can remove or disable the share link
                  (if available in the Service) or delete the devotion note/account.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  B. Prayer requests
                </h3>
                <p className="mt-2">
                  Prayer requests are intended to be private and are not shared
                  with other users through the Service.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  C. Accountability partners
                </h3>
                <p className="mt-2">
                  If you add accountability partners, they can see your streak
                  and whether you completed a devotion for the day, but they
                  cannot see the contents of your devotion notes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              4) Cookies and similar technologies
            </h2>
            <p className="mt-2">
              DayMark may use cookies or similar technologies that are necessary
              to keep you logged in and maintain sessions, and to remember
              preferences related to the Service.
            </p>
            <p className="mt-2">
              We also use Umami analytics, which may use privacy-friendly
              techniques and/or limited cookies depending on configuration. You
              can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              5) When we disclose information
            </h2>
            <p className="mt-2">We do not sell your personal information.</p>
            <p className="mt-2">
              We may share information in these situations:
            </p>

            <div className="mt-3 space-y-6">
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  A. Service providers (processors)
                </h3>
                <p className="mt-2">
                  We use trusted third-party providers to operate parts of the
                  Service. These providers process data on our behalf to deliver
                  their services:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Vercel (hosting)</li>
                  <li>MongoDB Atlas (database hosting)</li>
                  <li>SendGrid (email delivery)</li>
                  <li>Firebase Cloud Messaging (push notifications)</li>
                  <li>Umami (analytics)</li>
                </ul>
                <p className="mt-2">
                  These providers may process personal data only as needed to
                  provide their services to us.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  B. Legal and safety
                </h3>
                <p className="mt-2">
                  We may disclose information if we believe doing so is required
                  by law, regulation, legal process, or governmental request, or
                  to protect the rights, safety, and security of DayMark, our
                  users, or others.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  C. Business changes
                </h3>
                <p className="mt-2">
                  If the Service is involved in a merger, acquisition,
                  financing, reorganization, bankruptcy, or sale of assets,
                  information may be transferred as part of that transaction. We
                  will take reasonable steps to protect your information in such
                  events.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              6) Data security
            </h2>
            <p className="mt-2">
              We use reasonable administrative, technical, and organizational
              safeguards designed to protect information. However, no method of
              transmission or storage is 100% secure, and we cannot guarantee
              absolute security.
            </p>
            <p className="mt-2">
              <span className="font-medium">No admin viewing:</span> We do not provide a
              built-in “admin panel” for browsing user content.
            </p>
            <p className="mt-2">
              <span className="font-medium">Not end-to-end encrypted:</span> Content stored in
              DayMark is not end-to-end encrypted, meaning it may be accessible
              at the infrastructure level (for example, through database access
              necessary to operate the Service).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              7) Data retention
            </h2>
            <p className="mt-2">
              We keep information for as long as needed to provide the Service
              and operate it.
            </p>
            <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">
              Account deletion
            </h3>
            <p className="mt-2">
              You can delete your account in the Service settings. When you
              delete your account, your stored content and associated account
              data are deleted immediately (as part of normal operation). Note
              that limited technical logs or backups may persist for a short
              period due to standard infrastructure practices, but we do not use
              them to restore deleted accounts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              8) International users
            </h2>
            <p className="mt-2">
              DayMark is operated from the United States (Pennsylvania), but it
              is available to users worldwide. If you access the Service from
              outside the U.S., your information may be processed in the U.S.
              and other countries where our service providers operate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              9) Children’s privacy
            </h2>
            <p className="mt-2">
              DayMark is not intended for children and we do not knowingly
              collect personal information from children. If you believe a child
              has provided personal information to DayMark, contact{" "}
              <a
                className="underline underline-offset-2"
                href="mailto:prince@prinke.dev"
              >
                prince@prinke.dev
              </a>{" "}
              and we will take appropriate steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              10) Your choices and rights
            </h2>
            <p className="mt-2">
              Depending on where you live, you may have rights such as:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Accessing, correcting, or deleting your information</li>
              <li>Objecting to or restricting certain processing</li>
              <li>Receiving a copy of your information (data portability)</li>
            </ul>
            <p className="mt-2">
              You can delete your account in settings at any time. For other
              requests, contact{" "}
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
              11) Open source
            </h2>
            <p className="mt-2">
              DayMark is free and open source. However, this Privacy Policy
              applies to the official DayMark Service you access through our
              website and infrastructure. If you run your own copy of the
              software, your deployment may have different data practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              12) Changes to this Privacy Policy
            </h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. If we make
              changes, we will update the “Effective date” at the top. If
              changes are material, we may provide additional notice within the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              13) Contact us
            </h2>
            <p className="mt-2">
              Questions, feedback, or privacy requests:
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
