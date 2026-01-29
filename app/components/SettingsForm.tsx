"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import {
  DEFAULT_DEVOTION_TEMPLATE,
  DEFAULT_TEMPLATE_STORAGE_KEY,
} from "@/app/lib/default-devotion-template";

const TIMEZONE_STORAGE_KEY = "devo-tracker-timezone";

const DefaultTemplateEditorSection = dynamic(
  () =>
    import("./DefaultTemplateEditorSection").then(
      (mod) => mod.DefaultTemplateEditorSection,
    ),
  { ssr: false },
);

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "India/Kolkata",
];

type SettingsFormProps = {
  defaultName: string;
  email: string;
};

export function SettingsForm({ defaultName, email }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [timezone, setTimezone] = useState("UTC");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMessage, setNameMessage] = useState<"success" | "error" | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [templateMarkdown, setTemplateMarkdown] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (stored) setTimezone(stored);
    else setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    setTemplateMarkdown(
      localStorage.getItem(DEFAULT_TEMPLATE_STORAGE_KEY) ??
        DEFAULT_DEVOTION_TEMPLATE,
    );
  }, []);

  const handleSaveName = async () => {
    setNameSaving(true);
    setNameMessage(null);
    const { error } = await authClient.updateUser({ name: name.trim() });
    setNameSaving(false);
    if (error) {
      setNameMessage("error");
      return;
    }
    setNameMessage("success");
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    localStorage.setItem(TIMEZONE_STORAGE_KEY, value);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "delete my account") return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/auth/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callbackURL: "/" }),
        credentials: "include",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setDeleteError(data?.message ?? "Failed to delete account");
        setDeleteLoading(false);
        return;
      }
      if (data.success) {
        router.push("/");
        router.refresh();
        return;
      }
      setDeleteError("Something went wrong");
    } catch {
      setDeleteError("Network error. Please try again.");
    }
    setDeleteLoading(false);
  };

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Profile
        </h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Username
            </span>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                className="flex-1 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={nameSaving}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-70 cursor-pointer"
              >
                {nameSaving ? "Saving..." : "Save"}
              </button>
            </div>
            {nameMessage === "success" && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Username updated.
              </p>
            )}
            {nameMessage === "error" && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Could not update. Try again.
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Email
            </span>
            <input
              type="text"
              value={email}
              readOnly
              disabled
              className="mt-2 w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Email cannot be changed.
            </p>
          </label>
        </div>
      </section>

      {templateMarkdown !== null && (
        <DefaultTemplateEditorSection initialMarkdown={templateMarkdown} />
      )}

      <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Preferences
        </h2>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Timezone
          </span>
          <select
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="mt-2 w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 cursor-pointer"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Used for devotion dates and reminders.
          </p>
        </label>
      </section>

      <section className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Danger zone
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Deleting your account will remove all your data. This cannot be
          undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="mt-4 rounded-md border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
        >
          Delete account
        </button>
      </section>

      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h3 id="delete-dialog-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Delete account
            </h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
              Type <strong>delete my account</strong> below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="delete my account"
              className="mt-4 w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-red-500/70"
            />
            {deleteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmText !== "delete my account" || deleteLoading
                }
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleteLoading ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
