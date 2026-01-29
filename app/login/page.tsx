"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";

const providers = [
  { id: "google", label: "Continue with Google" },
  { id: "discord", label: "Continue with Discord" },
] as const;

type ProviderId = (typeof providers)[number]["id"];

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<ProviderId | null>(
    null,
  );

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

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-6 py-20 xl:max-w-lg xl:px-8 2xl:max-w-xl 2xl:px-10">
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-stone-900 xl:text-3xl dark:text-stone-50">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-stone-600 xl:text-base dark:text-stone-300">
            Choose a provider to continue to Devo Tracker.
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

          {error ? (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

