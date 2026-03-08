"use client";

import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Button } from "@/components/ui/button";

/**
 * Notification permission prompt.
 * Firebase FCM has been removed; this component is kept as a shell so the
 * permission prompt can be wired to a new push provider later.
 */
const NotificationPermission = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermissionStatus(Notification.permission);
    if (Notification.permission === "default") {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermissionStatus(result);
    setShowPrompt(false);
    // TODO: register token with new push provider here
  };

  if (!showPrompt || permissionStatus !== "default") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-xl dark:border-[#2a2720] dark:bg-[#1e1c18] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <FiBell className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-[#d6d3c8]">
            Enable Notifications?
          </h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-[#7e7b72]">
            Get daily reminders and updates to keep your streak alive.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPrompt(false)}
          className="h-6 w-6 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          aria-label="Close"
        >
          ✕
        </Button>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPrompt(false)}
          className="text-stone-600 dark:text-[#7e7b72]"
        >
          Maybe later
        </Button>
        <Button
          size="sm"
          onClick={handleEnable}
          className="bg-[#f0a531] hover:bg-[#c0831a] text-stone-900"
        >
          Enable
        </Button>
      </div>
    </div>
  );
};

export default NotificationPermission;
