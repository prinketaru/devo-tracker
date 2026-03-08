"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarkCompleteModal } from "./MarkCompleteModal";
import { Button } from "@/components/ui/button";

type MarkCompleteButtonProps = {
  timezone: string;
  todayDevotionId?: string;
};

export function MarkCompleteButton({ timezone, todayDevotionId }: MarkCompleteButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (todayDevotionId) {
      // Already completed today, navigate to edit
      router.push(`/devotions/${todayDevotionId}/edit`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleSave = async (data: { title: string; passage: string; content: string; notes?: string; category?: string }) => {
    const title = data.title.trim() || "Devotion completed";
    const passage = data.passage.trim() || "—";
    const content = data.notes?.trim() ? `**Notes:**\n\n${data.notes.trim()}` : "";
    const res = await fetch("/api/devotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, passage, content, category: data.category }),
    });
    if (!res.ok) {
      throw new Error("Failed to save");
    }
    router.refresh();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpenModal}
        className="border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50"
      >
        {todayDevotionId ? "Edit today's devotion" : "Quick log"}
      </Button>

      <MarkCompleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
