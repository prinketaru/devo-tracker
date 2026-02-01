/**
 * Input validation limits for API routes.
 * Prevents abuse and ensures reasonable payload sizes.
 */

export const LIMITS = {
  /** Max devotion content length (chars). */
  devotionContent: 100_000,
  /** Max devotion title length. */
  devotionTitle: 200,
  /** Max devotion passage length. */
  devotionPassage: 200,
  /** Max tags per devotion. */
  devotionTags: 20,
  /** Max tag length. */
  devotionTagLength: 50,
  /** Max prayer request text length. */
  prayerText: 2000,
} as const;

/** Validate devotion input; returns error message or null. */
export function validateDevotionInput(
  title: string,
  passage: string,
  content: string,
  tags: string[]
): string | null {
  if (title.length > LIMITS.devotionTitle) {
    return `Title must be at most ${LIMITS.devotionTitle} characters`;
  }
  if (passage.length > LIMITS.devotionPassage) {
    return `Passage must be at most ${LIMITS.devotionPassage} characters`;
  }
  if (content.length > LIMITS.devotionContent) {
    return `Content must be at most ${LIMITS.devotionContent} characters`;
  }
  if (tags.length > LIMITS.devotionTags) {
    return `At most ${LIMITS.devotionTags} tags allowed`;
  }
  if (tags.some((t) => t.length > LIMITS.devotionTagLength)) {
    return `Each tag must be at most ${LIMITS.devotionTagLength} characters`;
  }
  return null;
}

/** Validate prayer text; returns error message or null. */
export function validatePrayerText(text: string): string | null {
  if (text.length > LIMITS.prayerText) {
    return `Prayer request must be at most ${LIMITS.prayerText} characters`;
  }
  return null;
}
