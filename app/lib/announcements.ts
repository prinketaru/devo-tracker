import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Announcement {
  slug: string;
  title: string;
  date: string;
  category: string;
  author?: string;
  content: string;
  excerpt?: string;
}

const announcementsDir = path.join(
  process.cwd(),
  "app",
  "data",
  "announcements"
);

export async function getAnnouncements(): Promise<Announcement[]> {
  const files = fs.readdirSync(announcementsDir);
  const announcements: Announcement[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const filePath = path.join(announcementsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const { data, content: markdown } = matter(content);

    const slug = file.replace(".md", "");

    // Normalize date to ensure consistent formatting
    let dateStr = data.date || new Date().toISOString();
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0];
    } else if (typeof dateStr === 'string') {
      dateStr = dateStr.split('T')[0];
    }

    announcements.push({
      slug,
      title: data.title || "Untitled",
      date: dateStr,
      category: data.category || "Update",
      author: data.author,
      content: markdown,
      excerpt: data.excerpt || markdown.slice(0, 150),
    });
  }

  // Sort by date, newest first
  announcements.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return announcements;
}

export async function getAnnouncementBySlug(
  slug: string
): Promise<Announcement | null> {
  try {
    const filePath = path.join(announcementsDir, `${slug}.md`);
    const content = fs.readFileSync(filePath, "utf-8");
    const { data, content: markdown } = matter(content);

    // Normalize date to ensure consistent formatting
    let dateStr = data.date || new Date().toISOString();
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0];
    } else if (typeof dateStr === 'string') {
      dateStr = dateStr.split('T')[0];
    }

    return {
      slug,
      title: data.title || "Untitled",
      date: dateStr,
      category: data.category || "Update",
      author: data.author,
      content: markdown,
      excerpt: data.excerpt,
    };
  } catch {
    return null;
  }
}
