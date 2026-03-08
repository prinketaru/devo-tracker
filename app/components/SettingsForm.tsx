"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { useTheme } from "@/app/components/ThemeProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Palette, User, BookOpen, Bell, Shield, Computer, Sun, Moon, Check, ChevronRight, Clock, Users, MessageSquare, Keyboard, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
  defaultImage?: string;
};

export function SettingsForm({ defaultName, email, defaultImage = "" }: SettingsFormProps) {
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
  const [newReminderTime, setNewReminderTime] = useState("09:00");
  const [remindersSaving, setRemindersSaving] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(defaultImage);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [profileImageMessage, setProfileImageMessage] = useState<"success" | "error" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setProfileImageUploading(true);
    setProfileImageMessage(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => {
          img.onload = () => {
            const SIZE = 256;
            const canvas = document.createElement("canvas");
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext("2d")!;
            const scale = Math.max(SIZE / img.width, SIZE / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          };
          img.onerror = reject;
          img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profileImageUrl: dataUrl }),
      });
      if (res.ok) {
        setProfileImageUrl(dataUrl);
        setProfileImageMessage("success");
      } else {
        setProfileImageMessage("error");
      }
    } catch {
      setProfileImageMessage("error");
    } finally {
      setProfileImageUploading(false);
      e.target.value = "";
    }
  };
  const [reminderEmails, setReminderEmails] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [gracePeriodWarnings, setGracePeriodWarnings] = useState(true);
  const [restoreMessage, setRestoreMessage] = useState<"success" | "error" | null>(null);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [partners, setPartners] = useState<{ id: string; email: string; status: string }[]>([]);
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState("General");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"success" | "error" | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const fetchPartners = () => {
    fetch("/api/accountability/partners", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { partners?: { id: string; email: string; status: string }[] } | null) => {
        setPartners(Array.isArray(data?.partners) ? data.partners : []);
      })
      .catch(() => setPartners([]));
  };

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
      .catch(() => { });
    fetchPartners();
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
    const [hStr, mStr] = newReminderTime.split(":");
    const time = `${hStr.padStart(2, "0")}:${(mStr ?? "00").padStart(2, "0")}`;
    const id = crypto.randomUUID();
    const next = [...reminders, { id, time }].sort((a, b) => a.time.localeCompare(b.time));
    setReminders(next);
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
    // kept for compatibility (no longer called from UI)
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

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = feedbackText.trim();
    if (!message || feedbackLoading) return;
    setFeedbackLoading(true);
    setFeedbackStatus(null);
    setFeedbackError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, type: feedbackType }),
      });
      if (res.ok) {
        setFeedbackText("");
        setFeedbackStatus("success");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setFeedbackError(data?.error ?? "Could not send feedback. Try again.");
      setFeedbackStatus("error");
    } catch {
      setFeedbackError("Network error. Please try again.");
      setFeedbackStatus("error");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6 pb-20">
      {/* Appearance */}
      <Card className="border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#1e1c18] shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-stone-100 dark:border-[#2a2720] sm:pb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-[#EDE9E0]">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-1 text-left transition-all hover:bg-stone-50 dark:hover:bg-[#2a2720]/30 ${theme === "light" ? "border-amber-500 bg-stone-50 dark:bg-[#2a2720]/50" : "border-stone-200 dark:border-[#38332a] bg-transparent"
                }`}
            >
              {theme === "light" && (
                <div className="absolute top-2 right-2 rounded-full bg-amber-500 p-0.5 text-white z-10">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="w-full flex justify-center p-3">
                <div className="w-full max-w-[140px] aspect-[4/3] rounded-md border border-stone-200 bg-white shadow-sm flex overflow-hidden">
                  <div className="w-[30%] bg-stone-100 flex flex-col gap-1 p-2">
                    <div className="h-1.5 w-full bg-stone-300 rounded-sm"></div>
                    <div className="h-1.5 w-3/4 bg-stone-200 rounded-sm"></div>
                  </div>
                  <div className="flex-1 p-2 flex flex-col gap-2">
                    <div className="h-1.5 w-1/3 bg-stone-200 rounded-sm"></div>
                    <div className="h-6 w-full px-2 py-1 bg-stone-100 rounded-sm flex items-center">
                      <div className="h-1.5 w-1/2 bg-stone-200 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-0.5 text-center pb-3">
                <div className="flex items-center justify-center gap-1.5 font-medium text-sm text-stone-900 dark:text-[#EDE9E0]">
                  <Sun className="h-3.5 w-3.5 text-stone-500 dark:text-[#8A8070]" />
                  <span>Light</span>
                </div>
                <div className="text-xs text-stone-500 dark:text-[#8A8070]">Always light</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-1 text-left transition-all hover:bg-stone-50 dark:hover:bg-[#2a2720]/30 ${theme === "dark" ? "border-amber-500 bg-stone-50 dark:bg-[#2a2720]/50" : "border-stone-200 dark:border-[#38332a] bg-transparent"
                }`}
            >
              {theme === "dark" && (
                <div className="absolute top-2 right-2 rounded-full bg-amber-500 p-0.5 text-white z-10">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="w-full flex justify-center p-3">
                <div className="w-full max-w-[140px] aspect-[4/3] rounded-md border border-[#38332a] bg-[#1e1c18] shadow-sm flex overflow-hidden">
                  <div className="w-[30%] bg-[#171510] flex flex-col gap-1 p-2 border-r border-[#38332a]">
                    <div className="h-1.5 w-full bg-amber-500/80 rounded-sm"></div>
                    <div className="h-1.5 w-3/4 bg-[#38332a] rounded-sm"></div>
                  </div>
                  <div className="flex-1 p-2 flex flex-col gap-2">
                    <div className="h-1.5 w-1/3 bg-[#38332a] rounded-sm"></div>
                    <div className="h-6 w-full px-2 py-1 bg-[#2a2720] rounded-sm flex items-center border border-[#38332a]">
                      <div className="h-1.5 w-1/2 bg-[#38332a] rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-0.5 text-center pb-3">
                <div className="flex items-center justify-center gap-1.5 font-medium text-sm text-stone-900 dark:text-[#EDE9E0]">
                  <Moon className="h-3.5 w-3.5 text-stone-500 dark:text-[#8A8070]" />
                  <span>Dark</span>
                </div>
                <div className="text-xs text-stone-500 dark:text-[#8A8070]">Always dark</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-1 text-left transition-all hover:bg-stone-50 dark:hover:bg-[#2a2720]/30 ${theme === "system" ? "border-amber-500 bg-stone-50 dark:bg-[#2a2720]/50" : "border-stone-200 dark:border-[#38332a] bg-transparent"
                }`}
            >
              {theme === "system" && (
                <div className="absolute top-2 right-2 z-10 rounded-full bg-amber-500 p-0.5 text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="w-full flex justify-center p-3">
                <div className="w-full max-w-[140px] aspect-[4/3] rounded-md border border-[#38332a] flex overflow-hidden relative shadow-sm">
                  <div className="w-1/2 h-full bg-[#1e1c18] border-r border-[#38332a]"></div>
                  <div className="w-1/2 h-full bg-white">
                    <div className="w-full h-full p-2 flex justify-center pt-4">
                      <div className="h-1.5 w-1/2 bg-stone-200 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-0.5 text-center pb-3">
                <div className="flex items-center justify-center gap-1.5 font-medium text-sm text-stone-900 dark:text-[#EDE9E0]">
                  <Computer className="h-3.5 w-3.5 text-stone-500 dark:text-[#8A8070]" />
                  <span>System</span>
                </div>
                <div className="text-xs text-stone-500 dark:text-[#8A8070]">Follows OS</div>
              </div>
            </button>
          </div>

          <div className="rounded-xl border border-stone-200 dark:border-[#2a2720] bg-stone-50/50 dark:bg-[#23201a]/50 p-4 flex items-center gap-3">
            <div className="rounded-md bg-stone-200/60 dark:bg-[#322f27] p-1.5 flex items-center justify-center">
              {theme === 'light' ? (
                <Sun className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              )}
            </div>
            <p className="text-sm text-stone-600 dark:text-[#8A8070]">
              Currently showing in <strong className="text-stone-900 dark:text-[#e8e4db] font-medium">{theme === 'system' ? 'dark' : theme} mode</strong> (system preference)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#1e1c18] shadow-sm rounded-xl overflow-hidden mt-8">
        <CardHeader className="pb-4 border-b border-stone-100 dark:border-[#2a2720] sm:pb-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-[#EDE9E0]">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={profileImageUploading}
              className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Change profile picture"
            >
              <Avatar className="h-16 w-16 rounded-xl">
                <AvatarImage src={profileImageUrl} alt={name} />
                <AvatarFallback className="bg-[#f0a531] text-stone-900 font-medium rounded-xl text-xl">
                  {name ? name.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                {profileImageUploading
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="h-5 w-5 text-white" />}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <div className="flex flex-col">
              <h3 className="font-semibold text-stone-900 dark:text-[#EDE9E0] text-base">{name || 'Your Name'}</h3>
              <p className="text-sm text-stone-500 dark:text-[#8A8070]">{email}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={profileImageUploading}
                className="mt-1 text-xs font-semibold text-[#f0a531] hover:text-[#e09115] transition-colors text-left disabled:opacity-50"
              >
                {profileImageUploading ? "Uploading…" : "Change photo"}
              </button>
              {profileImageMessage === "success" && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Profile picture updated.</p>
              )}
              {profileImageMessage === "error" && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Upload failed. Try a smaller image.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="s-username" className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500 dark:text-[#8A8070]">
                Name
              </Label>
              <Input
                id="s-username"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                className="bg-transparent border-stone-200 dark:border-[#38332a] dark:bg-[#23201a] text-stone-900 dark:text-[#EDE9E0] focus-visible:ring-amber-500/70"
              />
              {nameMessage === "success" && (
                <p className="text-xs text-green-600 dark:text-green-400">Name updated.</p>
              )}
              {nameMessage === "error" && (
                <p className="text-xs text-red-600 dark:text-red-400">Could not update. Try again.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-email" className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500 dark:text-[#8A8070]">
                Email
              </Label>
              <Input
                id="s-email"
                type="text"
                value={email}
                readOnly
                disabled
                className="bg-stone-50 dark:bg-[#2a2720]/50 border-stone-200 dark:border-[#38332a] text-stone-600 dark:text-[#8A8070] cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <Button
              type="button"
              onClick={handleSaveName}
              disabled={nameSaving}
            >
              {nameSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Devotion Preferences */}
      <Card className="border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#1e1c18] shadow-sm rounded-xl overflow-hidden mt-8">
        <CardHeader className="pb-4 border-b border-stone-100 dark:border-[#2a2720] sm:pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-[#EDE9E0]">Devotion Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-2 p-0">

          {/* Timezone — first since it affects everything below */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Timezone</h4>
              <p className="text-xs text-stone-500 dark:text-[#8A8070]">Used for devotion dates and reminder times</p>
            </div>
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="s-timezone" className="w-[200px] border-stone-200 dark:border-[#38332a] dark:bg-[#23201a] focus:ring-amber-500/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="dark:bg-[#2a2720]" />

          {/* Daily reminder times */}
          <div className="p-4 px-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Daily Reminder Times</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Add one or more times to be reminded each day</p>
              </div>
              <form onSubmit={handleAddReminder} className="flex items-center gap-2 shrink-0">
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="rounded-md border border-stone-200 dark:border-[#38332a] bg-transparent dark:bg-[#23201a] px-3 py-1.5 text-sm text-stone-900 dark:text-[#d6d3c8] outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Button
                  type="submit"
                  disabled={remindersSaving || !newReminderTime}
                  variant="outline"
                  size="sm"
                  className="bg-transparent dark:bg-[#23201a] border-stone-200 dark:border-[#38332a]"
                >
                  {remindersSaving ? "…" : "Add"}
                </Button>
              </form>
            </div>

            {reminders.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-full border border-stone-200 dark:border-[#38332a] bg-stone-50 dark:bg-[#23201a] px-3 py-1.5 text-sm text-stone-700 dark:text-stone-200"
                  >
                    <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-[#7e7b72]" />
                    <span>{formatReminderTime(r.time)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReminder(r.id)}
                      disabled={remindersSaving}
                      className="ml-0.5 text-stone-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400 leading-none"
                      aria-label="Remove reminder"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 dark:text-[#7e7b72] italic">No reminders set yet.</p>
            )}
          </div>

          <Separator className="dark:bg-[#2a2720]" />

          <div className="p-4 px-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 text-amber-600 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Accountability Partner</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Invite someone to see if you completed your devotion today</p>
              </div>
            </div>
            <div className="space-y-4">

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
                      fetchPartners();
                    } else {
                      setInviteError((data as { error?: string }).error ?? "Failed to send invite");
                    }
                  } catch {
                    setInviteError("Network error.");
                  } finally {
                    setInviteLoading(false);
                  }
                }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <Input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="flex-1 focus-visible:ring-amber-500/70 dark:bg-[#23201a] border-stone-200 dark:border-[#38332a]"
                  disabled={inviteLoading}
                />
                <Button
                  type="submit"
                  disabled={!partnerEmail.trim() || inviteLoading}
                >
                  {inviteLoading ? "Sending…" : "Invite"}
                </Button>
              </form>
              {inviteSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Invite sent! Share this link:{" "}
                  <a href={inviteSuccess} target="_blank" rel="noopener noreferrer" className="underline break-all">
                    {inviteSuccess}
                  </a>
                </p>
              )}
              {inviteError && (
                <p className="text-sm text-red-600 dark:text-red-400">{inviteError}</p>
              )}
              {partners.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72] mb-2 mt-4">
                    Current partners
                  </p>
                  <ul className="space-y-2">
                    {partners.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-col gap-3 rounded-lg border border-stone-200 dark:border-[#38332a] bg-stone-50 dark:bg-[#23201a] px-3 py-3 text-sm text-stone-700 dark:text-stone-200 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="truncate text-stone-900 dark:text-[#EDE9E0]">{p.email}</span>
                          <span className="text-xs text-stone-500 dark:text-[#7e7b72]">
                            {p.status === "accepted" ? "Accepted" : "Pending"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (revokeLoading) return;
                            setRevokeLoading(p.id);
                            try {
                              const res = await fetch(`/api/accountability/partners/${p.id}`, {
                                method: "DELETE",
                                credentials: "include",
                              });
                              if (res.ok) {
                                setPartners((prev) => prev.filter((x) => x.id !== p.id));
                              }
                            } finally {
                              setRevokeLoading(null);
                            }
                          }}
                          disabled={revokeLoading === p.id}
                          className="w-full sm:w-auto text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                        >
                          {revokeLoading === p.id ? "Revoking…" : "Revoke"}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          <Separator className="dark:bg-[#2a2720]" />
          {templateMarkdown !== null && (
            <DefaultTemplateEditorSection initialMarkdown={templateMarkdown} />
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#1e1c18] shadow-sm rounded-xl overflow-hidden mt-8">
        <CardHeader className="pb-4 border-b border-stone-100 dark:border-[#2a2720] sm:pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-[#EDE9E0]">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-2 p-0 flex flex-col">
          <div className="flex items-center justify-between p-4 px-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 text-[#f0a531] rounded-full bg-amber-50 dark:bg-[#2a2215] flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Daily Devotion Reminder</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Get notified to start your daily devotion</p>
              </div>
            </div>
            <Switch
              id="reminder-emails"
              checked={reminderEmails}
              onCheckedChange={handleReminderEmailsChange}
              className="data-[state=checked]:bg-[#f0a531] dark:data-[state=checked]:bg-[#f0a531]"
            />
          </div>
          <Separator className="dark:bg-[#2a2720]" />
          <div className="flex items-center justify-between p-4 px-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 text-pink-600 rounded-full bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Streak Reminder</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Be reminded if you haven&apos;t logged today</p>
              </div>
            </div>
            <Switch
              id="grace-period"
              checked={gracePeriodWarnings}
              onCheckedChange={handleGracePeriodWarningsChange}
              className="data-[state=checked]:bg-[#f0a531] dark:data-[state=checked]:bg-[#f0a531]"
            />
          </div>
          <Separator className="dark:bg-[#2a2720]" />
          <div className="flex items-center justify-between p-4 px-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 text-emerald-600 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Weekly Progress Report</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Receive a Sunday summary of your week</p>
              </div>
            </div>
            <Switch
              id="weekly-digest"
              checked={weeklyDigest}
              onCheckedChange={handleWeeklyDigestChange}
              className="data-[state=checked]:bg-[#f0a531] dark:data-[state=checked]:bg-[#f0a531]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className="border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#1e1c18] shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-stone-100 dark:border-[#2a2720] sm:pb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-[#EDE9E0]">Keyboard Shortcuts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <li className="flex items-center justify-between gap-3">
              <span className="text-sm text-stone-600 dark:text-[#8A8070]">Search devotions</span>
              <span className="flex gap-1 shrink-0"><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">⌘</kbd><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">K</kbd></span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-sm text-stone-600 dark:text-[#8A8070]">New devotion</span>
              <span className="flex gap-1 shrink-0"><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">⌘</kbd><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">N</kbd></span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-sm text-stone-600 dark:text-[#8A8070]">Dashboard</span>
              <span className="flex gap-1 shrink-0"><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">⌘</kbd><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">D</kbd></span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-sm text-stone-600 dark:text-[#8A8070]">Save (in editor)</span>
              <span className="flex gap-1 shrink-0"><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">⌘</kbd><kbd className="px-1.5 py-0.5 rounded border border-stone-200 bg-stone-100 dark:border-[#38332a] dark:bg-[#2a2720] text-xs font-mono shadow-sm">S</kbd></span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#1e1c18] shadow-sm rounded-xl overflow-hidden mt-8">
        <CardHeader className="pb-4 border-b border-stone-100 dark:border-[#2a2720] sm:pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-[#EDE9E0]">Data & Privacy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-2 p-0 flex flex-col">
          <button onClick={() => handleExport("json")} className="w-full text-left flex items-center justify-between p-4 px-6 hover:bg-stone-50 dark:hover:bg-[#23201a] transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 text-indigo-600 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Export My Data</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Download all your devotions, notes, and prayers</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-400 dark:text-[#6a665d]" />
          </button>

          <Separator className="dark:bg-[#2a2720]" />
          <button className="w-full text-left flex items-center justify-between p-4 px-6 hover:bg-stone-50 dark:hover:bg-[#23201a] transition-colors relative">
            <label className="absolute inset-0 w-full h-full cursor-pointer z-10">
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
            </label>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 text-emerald-600 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Restore Backup</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Upload a backup JSON file to restore</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-400 dark:text-[#6a665d]" />
          </button>

          <Separator className="dark:bg-[#2a2720]" />
          <button onClick={() => setDeleteConfirmOpen(true)} className="w-full text-left flex items-center justify-between p-4 px-6 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 text-red-600 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#EDE9E0]">Delete Account</h4>
                <p className="text-xs text-stone-500 dark:text-[#8A8070]">Permanently remove your account and data</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-400 dark:text-[#6a665d]" />
          </button>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="border-stone-200 dark:border-[#38332a] bg-white dark:bg-[#1e1c18] shadow-sm rounded-xl overflow-hidden mt-8">
        <CardHeader className="pb-4 border-b border-stone-100 dark:border-[#2a2720] sm:pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-base font-semibold text-stone-900 dark:text-[#EDE9E0]">Feedback</CardTitle>
          </div>
          <CardDescription className="pt-2">Share ideas, report bugs, or tell us what you want to see next.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-fb-type" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Type
              </Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger id="s-fb-type" className="focus:ring-amber-500/70 border-stone-200 dark:border-[#38332a] dark:bg-[#23201a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Idea">Idea</SelectItem>
                  <SelectItem value="Praise">Praise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-fb-msg" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Your message
              </Label>
              <Textarea
                id="s-fb-msg"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                maxLength={1500}
                placeholder="Write your feedback here..."
                className="focus-visible:ring-amber-500/70 border-stone-200 dark:border-[#38332a] dark:bg-[#23201a]"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500 dark:text-[#7e7b72]">
                {feedbackText.length}/1500
              </p>
              <Button
                type="submit"
                disabled={!feedbackText.trim() || feedbackLoading}
                className="bg-[#f0a531] hover:bg-[#c0831a] text-stone-900"
              >
                {feedbackLoading ? "Sending..." : "Send feedback"}
              </Button>
            </div>
            {feedbackStatus === "success" && (
              <p className="text-sm text-green-600 dark:text-green-400">Thanks! Your feedback was sent.</p>
            )}
            {feedbackStatus === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">{feedbackError ?? "Could not send feedback."}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmOpen(false);
          setDeleteConfirmText("");
          setDeleteError(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              Type <strong>delete my account</strong> below to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="delete my account"
            className="focus-visible:ring-red-500/70"
          />
          {deleteError && (
            <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteConfirmText("");
                setDeleteError(null);
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "delete my account" || deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
