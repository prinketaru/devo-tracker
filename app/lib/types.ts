/** Devotion document stored in MongoDB (devotions collection). */
export type Devotion = {
  _id: string;
  userId: string;
  title: string;
  passage: string;
  content: string;
  createdAt: Date;
  tags?: string[];
  minutesSpent?: number;
};

/** Single reminder (stored in user_preferences.reminders). */
export type Reminder = {
  id: string;
  time: string; // "HH:mm" 24h
};

/** User preferences (user_preferences collection). */
export type UserPreferences = {
  userId: string;
  timezone: string;
  defaultTemplateMarkdown: string;
  reminders?: Reminder[];
  profileImageUrl?: string;
  reminderEmails?: boolean;
  weeklyDigest?: boolean;
  onboardingCompleted?: boolean;
};
