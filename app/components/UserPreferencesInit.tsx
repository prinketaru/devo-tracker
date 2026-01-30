"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * When a new user has no stored preferences, detect their timezone (client-side)
 * and save it so dashboard stats and dates use their actual timezone.
 * Runs once per mount; only PATCHes when preferencesExist is false.
 */
export function UserPreferencesInit() {
  const router = useRouter();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    fetch("/api/user/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { preferencesExist?: boolean } | null) => {
        if (!data?.preferencesExist) {
          const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          return fetch("/api/user/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ timezone: detectedTimezone }),
          }).then((patchRes) => {
            if (patchRes.ok) router.refresh();
          });
        }
      })
      .catch(() => {});
  }, [router]);

  return null;
}
