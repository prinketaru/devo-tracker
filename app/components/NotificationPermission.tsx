"use client";

import useFcmToken from "@/app/hooks/useFcmToken";
import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";

const NotificationPermission = () => {
  const { notificationPermissionStatus, requestPermission } = useFcmToken();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show prompt if permission is default (not asked yet)
    // We wait a bit to not overwhelm the user immediately on load
    if (notificationPermissionStatus === "default") {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [notificationPermissionStatus]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <FiBell className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Enable Notifications?
          </h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Get daily reminders and updates to keep your streak alive.
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowPrompt(false)}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-700"
        >
          Maybe later
        </button>
        <button
          onClick={() => {
            requestPermission();
            setShowPrompt(false);
          }}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 active:scale-95 transition-all"
        >
          Enable
        </button>
      </div>
    </div>
  );
};

export default NotificationPermission;
