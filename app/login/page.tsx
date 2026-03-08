"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { HomeNav } from "@/app/components/HomeNav";

const providers = [
  { id: "google", label: "Continue with Google" },
  { id: "discord", label: "Continue with Discord" },
] as const;

type ProviderId = (typeof providers)[number]["id"];

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);
  const [loadingProvider, setLoadingProvider] = useState<ProviderId | null>(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");
  const [otpLoading, setOtpLoading] = useState(false);

  const signIn = async (provider: ProviderId) => {
    setError(null);
    setLoadingProvider(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
      setLoadingProvider(null);
    }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpLoading(true);
    try {
      const { error: err } = await authClient.emailOtp.sendVerificationOtp({
        email: otpEmail.trim(),
        type: "sign-in",
      });
      if (err) {
        setError(err.message ?? "Failed to send code.");
        return;
      }
      setOtpStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const signInWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpLoading(true);
    try {
      const { error: err } = await authClient.signIn.emailOtp({
        email: otpEmail.trim(),
        otp: otpCode.trim(),
      });
      if (err) {
        setError(err.message ?? "Invalid code. Try again.");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  if (!isPending && session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-stone-500 dark:text-[#7e7b72]">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNav />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-amber-700 text-white text-xl font-bold shadow-sm mb-4">
              D
            </div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-[#d6d3c8]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-[#7e7b72]">
              Sign in to continue to DayMark
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] p-6 shadow-sm">
            {/* Social providers */}
            <div className="space-y-2.5">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => signIn(provider.id)}
                  disabled={!!loadingProvider}
                  className="w-full rounded-xl border border-stone-200 dark:border-[#2a2720] bg-background px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-[#d6d3c8] hover:bg-stone-100 dark:hover:bg-[#1e1c18] hover:border-stone-300 dark:hover:border-[#3a3630] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingProvider === provider.id
                    ? "Redirecting..."
                    : provider.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <span className="flex-1 border-t border-stone-200 dark:border-[#2a2720]" />
              <span className="text-xs text-stone-400 dark:text-[#7e7b72]">or</span>
              <span className="flex-1 border-t border-stone-200 dark:border-[#2a2720]" />
            </div>

            {/* Email OTP */}
            {otpStep === "email" ? (
              <form onSubmit={sendOtp} className="space-y-2.5">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-stone-200 dark:border-[#2a2720] bg-background px-4 py-2.5 text-sm text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-400 dark:placeholder:text-[#7e7b72] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 dark:focus:border-amber-600 transition-colors"
                />
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-600/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {otpLoading ? "Sending code..." : "Send sign-in code"}
                </button>
              </form>
            ) : (
              <form onSubmit={signInWithOtp} className="space-y-3">
                <p className="text-sm text-stone-500 dark:text-[#7e7b72]">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-stone-900 dark:text-[#d6d3c8]">{otpEmail}</span>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="w-full rounded-xl border border-stone-200 dark:border-[#2a2720] bg-background px-4 py-2.5 text-center text-xl tracking-[0.4em] font-mono text-stone-900 dark:text-[#d6d3c8] placeholder:text-stone-300 dark:placeholder:text-[#3a3630] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 dark:focus:border-amber-600 transition-colors"
                />
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setOtpStep("email"); setOtpCode(""); }}
                    disabled={otpLoading}
                    className="flex-1 rounded-xl border border-stone-200 dark:border-[#2a2720] px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-[#d6d3c8] hover:bg-stone-100 dark:hover:bg-[#1e1c18] transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length !== 6}
                    className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-600/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {otpLoading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-stone-400 dark:text-[#7e7b72]">
            By signing in you agree to our{" "}
            <a href="/terms" className="text-amber-600 dark:text-amber-400 hover:underline">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="text-amber-600 dark:text-amber-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
}

