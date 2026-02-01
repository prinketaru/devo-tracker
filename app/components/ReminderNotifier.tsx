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

function todayStr(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

/**
 * Fetches user preferences and, when the app is open, shows a browser notification
 * at each of the user's reminder times (in their timezone).
 * Also shows a grace period warning when the user missed a day and risks breaking their streak.
 */
export function ReminderNotifier() {
  const notifiedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function run() {
      const prefsRes = await fetch("/api/user/preferences", { credentials: "include" });
      if (!prefsRes.ok || cancelled) return;
      const data = (await prefsRes.json()) as { timezone?: string; reminders?: Reminder[]; gracePeriodWarnings?: boolean };
      const timezone = typeof data?.timezone === "string" ? data.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
      const reminders = Array.isArray(data?.reminders) ? data.reminders : [];
      const gracePeriodWarnings = data?.gracePeriodWarnings !== false;

      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission !== "granted" || cancelled) return;

      // Grace period warning: show once per day when user is on grace
      if (gracePeriodWarnings) {
        try {
          const graceRes = await fetch("/api/user/grace-status", { credentials: "include" });
          if (graceRes.ok && !cancelled) {
            const grace = (await graceRes.json()) as { onGracePeriod?: boolean; graceStreakDays?: number };
            if (grace.onGracePeriod && grace.graceStreakDays != null && grace.graceStreakDays > 0) {
              const key = `grace-${todayStr(timezone)}`;
              if (typeof localStorage !== "undefined" && localStorage.getItem(key) !== "1") {
                localStorage.setItem(key, "1");
                try {
                new Notification("Devo Tracker", {
                  body: `You missed a day — do a devotion to keep your ${grace.graceStreakDays}-day streak!`,
                  icon: "/android-chrome-192x192.png",
                  tag: "devo-grace",
                });
                } catch {
                  // ignore
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      if (reminders.length === 0 || cancelled) return;

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
              icon: "/android-chrome-192x192.png",
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
