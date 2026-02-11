import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { ReminderNotifier } from "@/app/components/ReminderNotifier";
import { ServiceWorkerRegistration } from "@/app/components/ServiceWorkerRegistration";
import { KeyboardShortcuts } from "@/app/components/KeyboardShortcuts";
import NotificationPermission from "@/app/components/NotificationPermission";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7ef" },
    { media: "(prefers-color-scheme: dark)", color: "#15130f" },
  ],
};

export const metadata: Metadata = {
  title: "DayMark | Your Daily Devotion Companion",
  description: "Track your daily devotions, build spiritual habits, and grow closer to your faith. Simple, beautiful, and focused on meaningful spiritual growth.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DayMark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="58cd52c8-a192-460c-ad28-69d507e3038d"
      />
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);})();`,
          }}
        />
        <ThemeProvider>
          <ServiceWorkerRegistration />
          <ReminderNotifier />
          <NotificationPermission />
          <KeyboardShortcuts />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
