"use client";

import { useEffect } from "react";

/**
 * Registers a PWA service worker so the app meets install criteria.
 * Firebase messaging SW has been removed; this will be updated to use
 * the future notification provider's service worker.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // In dev, unregister any old SWs
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((reg) => reg.unregister()))
        .catch(() => { });
      return;
    }

    // Register a minimal PWA service worker (no push messaging for now)
    if (navigator.serviceWorker.controller) return; // already registered
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // SW not found yet — that's fine until a new one is set up
      });
  }, []);

  return null;
}
