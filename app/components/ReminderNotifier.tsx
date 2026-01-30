"use client";

import { useEffect, useRef } from "react";

type Reminder = { id: string; time: string };

function nowInTimezone(timezone: string): { hour: number; minute: number } {
  const str = new Date().toLocaleTimeString("en-CA", { timeZone: timezone, hour12: false, hour: "2-digit", minute: "2-digit" });
  const [hour, minute] = str.split(":").map(Number);
  return { hour, minute };
}

function toHHmm(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Fetches user preferences and, when the app is open, shows a browser notification
 * at each of the user's reminder times (in their timezone).
 */
export function ReminderNotifier() {
  const notifiedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function run() {
      const res = await fetch("/api/user/preferences", { credentials: "include" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { timezone?: string; reminders?: Reminder[] };
      const timezone = typeof data?.timezone === "string" ? data.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
      const reminders = Array.isArray(data?.reminders) ? data.reminders : [];
      if (reminders.length === 0 || cancelled) return;

      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission !== "granted" || cancelled) return;

      const check = () => {
        if (cancelled) return;
        const { hour, minute } = nowInTimezone(timezone);
        const nowHHmm = toHHmm(hour, minute);
        for (const r of reminders) {
          if (r.time !== nowHHmm) continue;
          const key = `${r.id}-${nowHHmm}`;
          if (notifiedRef.current[key]) continue;
          notifiedRef.current[key] = "1";
          try {
            new Notification("Devo Tracker", {
              body: "Time for your devotion.",
              icon: "/favicon.ico",
              tag: "devo-reminder",
            });
          } catch {
            // ignore
          }
        }
        // Forget old keys so we can notify again the next day
        const current = `${toHHmm(hour, minute)}`;
        for (const k of Object.keys(notifiedRef.current)) {
          if (!k.endsWith(`-${current}`)) delete notifiedRef.current[k];
        }
      };

      check();
      intervalId = setInterval(check, 30_000);
    }

    run();
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null;
}
