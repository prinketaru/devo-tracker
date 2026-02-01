"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && navigator.platform?.toLowerCase().includes("mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (!modifier) return;

      switch (e.key.toLowerCase()) {
        case "k": {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"], input[name="search"]');
          if (searchInput) {
            searchInput.focus();
          } else {
            router.push("/devotions");
            setTimeout(() => {
              const input = document.querySelector<HTMLInputElement>('input[type="text"]');
              input?.focus();
            }, 100);
          }
          break;
        }
        case "n": {
          e.preventDefault();
          if (!pathname?.startsWith("/devotions/new")) {
            router.push("/devotions/new");
          }
          break;
        }
        case "d": {
          e.preventDefault();
          router.push("/dashboard");
          break;
        }
        case "s": {
          if (pathname?.startsWith("/devotions/") && pathname.includes("/edit")) {
            const saveBtn = document.querySelector<HTMLButtonElement>('[data-save-devotion]');
            saveBtn?.click();
          }
          break;
        }
        case "/": {
          if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"], input[type="search"]');
          if (searchInput) searchInput.focus();
          break;
        }
        default:
          break;
      }
    },
    [router, pathname]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
