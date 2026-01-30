"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so the app meets PWA install criteria
 * (Chrome and others require a registered SW for "Add to Home Screen").
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.update().catch(() => {});
      })
      .catch(() => {});
  }, []);

  return null;
}
