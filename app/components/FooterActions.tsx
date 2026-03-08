"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

export function FooterActions() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("General");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"success" | "error" | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/preferences", { credentials: "include" })
      .then((res) => {
        if (cancelled) return;
        setIsLoggedIn(res.ok);
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoggedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleOpenFeedback = () => {
    setFeedbackStatus(null);
    setFeedbackError(null);
    setFeedbackOpen(true);
  };

  const loggedIn = isLoggedIn === true;

  return (
    <>
      <div className="flex flex-col items-start gap-2.5">
        {!loggedIn && (
          <Link
            href="/login"
            className="text-xs text-[#7A7166] dark:text-[#8A8070] hover:text-[#1A1710] dark:hover:text-[#EDE9E0] transition-colors"
          >
            Sign In
          </Link>
        )}
        {!loggedIn && (
          <a
            href="#features"
            className="text-xs text-[#7A7166] dark:text-[#8A8070] hover:text-[#1A1710] dark:hover:text-[#EDE9E0] transition-colors"
          >
            Features
          </a>
        )}
        {loggedIn && (
          <button
            type="button"
            onClick={handleOpenFeedback}
            className="text-xs text-[#7A7166] dark:text-[#8A8070] hover:text-[#1A1710] dark:hover:text-[#EDE9E0] transition-colors"
          >
            Feedback
          </button>
        )}
        <a
          href="https://buymeacoffee.com/prinke"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#7A7166] dark:text-[#8A8070] hover:text-[#1A1710] dark:hover:text-[#EDE9E0] transition-colors"
        >
          Donate
        </a>
      </div>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-lg" fadeOnly>
          <DialogHeader>
            <DialogTitle>Send feedback</DialogTitle>
            <DialogDescription>
              Share ideas, report bugs, or tell us what you want to see next.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fb-type" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Type
              </Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger id="fb-type">
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fb-message" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Your message
              </Label>
              <Textarea
                id="fb-message"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                maxLength={1500}
                placeholder="Write your feedback here..."
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
        </DialogContent>
      </Dialog>
    </>
  );
}
