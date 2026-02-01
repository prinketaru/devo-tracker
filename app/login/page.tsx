"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

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
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-sm text-stone-500 dark:text-stone-400">Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
            Choose a provider or sign in with email.
          </p>

          <div className="mt-6 space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => signIn(provider.id)}
                disabled={loadingProvider === provider.id}
                className="w-full rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingProvider === provider.id
                  ? "Redirecting..."
                  : provider.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="flex-1 border-t border-stone-200 dark:border-zinc-700" />
            <span className="text-xs text-stone-500 dark:text-stone-400">or</span>
            <span className="flex-1 border-t border-stone-200 dark:border-zinc-700" />
          </div>

          <div className="mt-6">
            {otpStep === "email" ? (
              <form onSubmit={sendOtp} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                />
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpLoading ? "Sending code..." : "Send sign-in code"}
                </button>
              </form>
            ) : (
              <form onSubmit={signInWithOtp} className="space-y-3">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  We sent a 6-digit code to <strong>{otpEmail}</strong>
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
                  className="w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-center text-lg tracking-[0.3em] text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("email");
                      setOtpCode("");
                    }}
                    disabled={otpLoading}
                    className="flex-1 rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length !== 6}
                    className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {otpLoading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

