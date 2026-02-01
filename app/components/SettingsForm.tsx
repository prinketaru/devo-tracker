"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { useTheme } from "@/app/components/ThemeProvider";

const DefaultTemplateEditorSection = dynamic(
  () =>
    import("./DefaultTemplateEditorSection").then(
      (mod) => mod.DefaultTemplateEditorSection,
    ),
  { ssr: false },
);

type Reminder = { id: string; time: string };

function formatReminderTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

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
  const { theme, setTheme } = useTheme();
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
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [remindersSaving, setRemindersSaving] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageUrlSaving, setProfileImageUrlSaving] = useState(false);
  const [profileImageUrlMessage, setProfileImageUrlMessage] = useState<"success" | "error" | null>(null);
  const [reminderEmails, setReminderEmails] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [gracePeriodWarnings, setGracePeriodWarnings] = useState(true);
  const [restoreMessage, setRestoreMessage] = useState<"success" | "error" | null>(null);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { timezone?: string; defaultTemplateMarkdown?: string; reminders?: Reminder[]; profileImageUrl?: string; reminderEmails?: boolean; weeklyDigest?: boolean; gracePeriodWarnings?: boolean } | null) => {
        if (data?.timezone) setTimezone(data.timezone);
        else setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        if (data?.defaultTemplateMarkdown != null) setTemplateMarkdown(data.defaultTemplateMarkdown);
        else setTemplateMarkdown("");
        if (Array.isArray(data?.reminders)) setReminders(data.reminders);
        if (typeof data?.profileImageUrl === "string") setProfileImageUrl(data.profileImageUrl);
        setReminderEmails(data?.reminderEmails !== false);
        setWeeklyDigest(data?.weeklyDigest !== false);
        setGracePeriodWarnings(data?.gracePeriodWarnings !== false);
      })
      .catch(() => {});
  }, []);

  const saveReminders = async (next: Reminder[]) => {
    setRemindersSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reminders: next }),
      });
      if (res.ok) setReminders(next);
    } finally {
      setRemindersSaving(false);
    }
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const time = newReminderTime.trim();
    if (!time || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return;
    const id = crypto.randomUUID();
    const next = [...reminders, { id, time }].sort((a, b) => a.time.localeCompare(b.time));
    setReminders(next);
    setNewReminderTime("");
    saveReminders(next);
  };

  const handleRemoveReminder = (id: string) => {
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    saveReminders(next);
  };

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

  const handleTimezoneChange = async (value: string) => {
    setTimezone(value);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ timezone: value }),
    });
  };

  const handleSaveProfileImageUrl = async () => {
    setProfileImageUrlSaving(true);
    setProfileImageUrlMessage(null);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profileImageUrl: profileImageUrl.trim() || "" }),
      });
      if (res.ok) setProfileImageUrlMessage("success");
      else setProfileImageUrlMessage("error");
    } catch {
      setProfileImageUrlMessage("error");
    } finally {
      setProfileImageUrlSaving(false);
    }
  };

  const handleReminderEmailsChange = async (checked: boolean) => {
    setReminderEmails(checked);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reminderEmails: checked }),
    });
  };

  const handleGracePeriodWarningsChange = async (checked: boolean) => {
    setGracePeriodWarnings(checked);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ gracePeriodWarnings: checked }),
    });
  };

  const handleWeeklyDigestChange = async (checked: boolean) => {
    setWeeklyDigest(checked);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ weeklyDigest: checked }),
    });
  };

  const handleExport = (format: "json" | "markdown") => {
    window.open(`/api/export?format=${format}`, "_blank", "noopener");
  };

  const handleBackup = () => {
    window.open("/api/backup", "_blank", "noopener");
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setRestoreMessage(null);
    try {
      const text = await file.text();
      const body = JSON.parse(text);
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { success?: boolean };
      setRestoreMessage(data.success ? "success" : "error");
    } catch {
      setRestoreMessage("error");
    }
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

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Profile picture URL
            </span>
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="flex-1 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
              />
              <button
                type="button"
                onClick={handleSaveProfileImageUrl}
                disabled={profileImageUrlSaving}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-70 cursor-pointer"
              >
                {profileImageUrlSaving ? "Saving..." : "Save"}
              </button>
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Optional. Leave empty to use your sign-in provider&apos;s picture.
            </p>
            {profileImageUrlMessage === "success" && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Profile picture URL saved.
              </p>
            )}
            {profileImageUrlMessage === "error" && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Could not save. Try again.
              </p>
            )}
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
            Theme
          </span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as "system" | "light" | "dark")}
            className="mt-2 w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70 cursor-pointer"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Choose how the app looks. Your choice is saved.
          </p>
        </label>
        <div className="mt-6 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
            Keyboard shortcuts
          </p>
          <ul className="text-sm text-stone-600 dark:text-stone-300 space-y-1">
            <li><kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">⌘</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">K</kbd> Search devotions</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">⌘</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">N</kbd> New devotion</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">⌘</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">D</kbd> Dashboard</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">⌘</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-xs font-mono">S</kbd> Save (in editor)</li>
          </ul>
        </div>

        <label className="mt-6 block">
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

        <div className="mt-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Devotion reminders
          </span>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 mb-3">
            Add times when you want to be reminded to do a devotion. Your list is saved. When the app is open, you&apos;ll get a browser notification at each reminder time—allow notifications when prompted.
          </p>
          <label className="mt-2 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reminderEmails}
              onChange={(e) => handleReminderEmailsChange(e.target.checked)}
              className="rounded border-stone-300 dark:border-zinc-600 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-stone-700 dark:text-stone-200">Also send reminder emails at these times</span>
          </label>
          <label className="mt-2 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => handleWeeklyDigestChange(e.target.checked)}
              className="rounded border-stone-300 dark:border-zinc-600 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-stone-700 dark:text-stone-200">Send weekly summary email</span>
          </label>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Get a weekly summary (e.g. days completed, streak).
          </p>
          <label className="mt-4 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={gracePeriodWarnings}
              onChange={(e) => handleGracePeriodWarningsChange(e.target.checked)}
              className="rounded border-stone-300 dark:border-zinc-600 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-stone-700 dark:text-stone-200">Warn when you miss a day (email + notification)</span>
          </label>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 mb-3">
            Email and push notification when you miss a day and risk breaking your streak.
          </p>
          <form onSubmit={handleAddReminder} className="flex gap-2 mt-6">
            <input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/70"
              required
            />
            <button
              type="submit"
              disabled={remindersSaving}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-70 cursor-pointer"
            >
              {remindersSaving ? "Saving..." : "Add"}
            </button>
          </form>
          {reminders.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-700 dark:text-stone-200"
                >
                  <span>{formatReminderTime(r.time)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReminder(r.id)}
                    disabled={remindersSaving}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
              No reminders yet. Pick a time above and click Add.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Accountability partner
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Invite someone to see if you completed your devotion today (streak + completed today only—no devotion content).
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const email = partnerEmail.trim().toLowerCase();
            if (!email || inviteLoading) return;
            setInviteLoading(true);
            setInviteSuccess(null);
            setInviteError(null);
            try {
              const res = await fetch("/api/accountability/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email }),
              });
              const data = await res.json().catch(() => ({}));
              if (res.ok) {
                setInviteSuccess((data as { inviteUrl?: string }).inviteUrl ?? "Invite sent!");
                setPartnerEmail("");
              } else {
                setInviteError((data as { error?: string }).error ?? "Failed to send invite");
              }
            } catch {
              setInviteError("Network error.");
            } finally {
              setInviteLoading(false);
            }
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="email"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder="partner@example.com"
            className="flex-1 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-500/70"
            disabled={inviteLoading}
          />
          <button
            type="submit"
            disabled={!partnerEmail.trim() || inviteLoading}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inviteLoading ? "Sending…" : "Invite"}
          </button>
        </form>
        {inviteSuccess && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400">
            Invite sent! Share this link:{" "}
            <a href={inviteSuccess} target="_blank" rel="noopener noreferrer" className="underline break-all">
              {inviteSuccess}
            </a>
          </p>
        )}
        {inviteError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{inviteError}</p>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Data &amp; backup
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Export devotions and prayer requests, or download a full backup. Restore from a backup file to merge data back.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport("json")}
            className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => handleExport("markdown")}
            className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800"
          >
            Export Markdown
          </button>
          <button
            type="button"
            onClick={handleBackup}
            className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800"
          >
            Download backup
          </button>
          <label className="rounded-md border border-stone-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
            Restore from file
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>
        {restoreMessage === "success" && <p className="mt-2 text-sm text-green-600 dark:text-green-400">Restore completed.</p>}
        {restoreMessage === "error" && <p className="mt-2 text-sm text-red-600 dark:text-red-400">Restore failed. Check file format.</p>}
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
