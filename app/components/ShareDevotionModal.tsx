"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ShareDevotionModalProps = {
  devotionId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function ShareDevotionModal({ devotionId, isOpen, onClose }: ShareDevotionModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(true);
      fetch(`/api/devotions/${devotionId}/share`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { shareUrl?: string | null } | null) => {
          setShareUrl(data?.shareUrl ?? null);
        })
        .catch(() => setShareUrl(null))
        .finally(() => setLoading(false));
    } else {
      setShareUrl(null);
    }
  }, [isOpen, devotionId]);

  const fetchShareLink = async () => {
    if (shareUrl) return shareUrl;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/devotions/${devotionId}/share`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.shareUrl) {
        setShareUrl(data.shareUrl);
        return data.shareUrl;
      }
      setError((data as { error?: string }).error ?? "Failed to create share link.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleCopy = async (urlToCopy?: string | null) => {
    const url = urlToCopy ?? shareUrl ?? (await fetchShareLink());
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share devotion</DialogTitle>
          <DialogDescription>
            Anyone with this link can view your devotion (read-only).
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            readOnly
            value={shareUrl ?? (loading ? "Loading…" : "")}
            placeholder={loading ? "" : "Click to create link"}
            className="flex-1 truncate"
          />
          <Button
            type="button"
            onClick={async () => {
              if (shareUrl) handleCopy();
              else {
                const url = await fetchShareLink();
                if (url) handleCopy(url);
              }
            }}
            disabled={loading}
            className="bg-[#f0a531] hover:bg-[#c0831a] text-stone-900 shrink-0"
          >
            {copied ? "Copied!" : shareUrl ? "Copy" : loading ? "..." : "Create link"}
          </Button>
          {shareUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                if (deleteLoading) return;
                setDeleteLoading(true);
                try {
                  const res = await fetch(`/api/devotions/${devotionId}/share`, {
                    method: "DELETE",
                    credentials: "include",
                  });
                  if (res.ok) {
                    setShareUrl(null);
                  }
                } finally {
                  setDeleteLoading(false);
                }
              }}
              disabled={deleteLoading}
              className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
