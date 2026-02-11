export const DEVOTION_CATEGORIES = [
  "devotion",
  "sermon",
  "bible-study",
  "journal",
  "other",
] as const;

export type DevotionCategory = (typeof DEVOTION_CATEGORIES)[number];

export const DEVOTION_CATEGORY_LABELS: Record<DevotionCategory, string> = {
  devotion: "Devotion",
  sermon: "Sermon",
  "bible-study": "Bible Study",
  journal: "Journal",
  other: "Other",
};

export function normalizeDevotionCategory(value?: string): DevotionCategory | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return (DEVOTION_CATEGORIES as readonly string[]).includes(normalized)
    ? (normalized as DevotionCategory)
    : undefined;
}
