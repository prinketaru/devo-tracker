"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarkCompleteModal } from "./MarkCompleteModal";

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

  const handleSave = async (data: { title: string; passage: string; content: string }) => {
    const res = await fetch("/api/devotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error("Failed to save");
    }
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="inline-flex items-center justify-center rounded-md border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
      >
        {todayDevotionId ? "Edit today's devotion" : "✓ Mark today as complete"}
      </button>

      <MarkCompleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
