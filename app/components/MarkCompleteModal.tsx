"use client";

import { useRef, useState, useEffect } from "react";
import { DEVOTION_CATEGORIES, DEVOTION_CATEGORY_LABELS } from "@/app/lib/devotion-categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

type MarkCompleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; passage: string; content: string; notes?: string; category?: string }) => Promise<void>;
  initialTitle?: string;
  initialPassage?: string;
};

export function MarkCompleteModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = "",
  initialPassage = "",
}: MarkCompleteModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const passageRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [category, setCategory] = useState("devotion");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const title = titleRef.current?.value?.trim() ?? "";
      const passage = passageRef.current?.value?.trim() ?? "";
      const notes = notesRef.current?.value?.trim() ?? "";

      await onSave({ title, passage, content: "", notes, category: category || undefined });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ql-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Title <span className="font-normal normal-case tracking-normal text-stone-400 dark:text-stone-500">(optional)</span>
              </Label>
              <Input
                id="ql-title"
                ref={titleRef}
                type="text"
                defaultValue={initialTitle}
                placeholder="e.g. Morning with Psalm 23"
                className="focus-visible:ring-amber-500/70"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ql-passage" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Passage <span className="font-normal normal-case tracking-normal text-stone-400 dark:text-stone-500">(optional)</span>
              </Label>
              <Input
                id="ql-passage"
                ref={passageRef}
                type="text"
                defaultValue={initialPassage}
                placeholder="e.g. Psalm 23:1-6"
                className="focus-visible:ring-amber-500/70"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ql-notes" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Notes <span className="font-normal normal-case tracking-normal text-stone-400 dark:text-stone-500">(optional)</span>
              </Label>
              <Textarea
                id="ql-notes"
                ref={notesRef}
                rows={3}
                placeholder="A brief reflection or prayer..."
                className="focus-visible:ring-amber-500/70 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ql-category" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-[#7e7b72]">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="ql-category" className="focus:ring-amber-500/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVOTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {DEVOTION_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#f0a531] hover:bg-[#c0831a] text-stone-900"
            >
              {isSaving ? "Saving..." : "Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
