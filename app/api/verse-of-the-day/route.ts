import { NextResponse } from "next/server";

/** Curated verses for verse of the day (same verse for everyone each calendar day). */
const VERSE_OF_DAY_LIST = [
  "Psalm 119:105",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Proverbs 3:5-6",
  "Isaiah 41:10",
  "Romans 8:28",
  "Matthew 11:28",
  "Psalm 23:1",
  "John 3:16",
  "Isaiah 40:31",
  "Joshua 1:9",
  "Romans 12:2",
  "Psalm 46:1",
  "2 Timothy 1:7",
  "Philippians 4:6-7",
  "Psalm 27:1",
  "Isaiah 43:19",
  "Romans 8:38-39",
  "Proverbs 16:3",
  "Matthew 6:33",
  "Psalm 121:1-2",
  "Colossians 3:2",
  "John 14:27",
  "Isaiah 26:3",
  "Psalm 34:4",
  "Hebrews 11:1",
  "Psalm 139:23-24",
  "2 Corinthians 5:17",
  "James 1:5",
  "Psalm 91:1-2",
  "Proverbs 22:6",
  "Matthew 28:19-20",
  "Psalm 37:4",
  "1 Corinthians 13:4-7",
  "Ephesians 2:8-9",
  "Psalm 100:4-5",
  "Galatians 5:22-23",
  "1 Peter 5:7",
  "Psalm 19:14",
  "John 15:5",
  "Romans 5:8",
  "Psalm 90:12",
  "Colossians 3:12",
  "Philippians 2:13",
  "Psalm 143:8",
  "Proverbs 4:23",
  "1 Thessalonians 5:16-18",
  "Psalm 119:11",
  "Micah 6:8",
  "Matthew 5:14-16",
  "Psalm 32:8",
  "Romans 10:9-10",
  "2 Chronicles 7:14",
  "Psalm 119:105",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Proverbs 3:5-6",
];

/** GET /api/verse-of-the-day – returns today's verse reference (deterministic by date). */
export async function GET() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const index = dayOfYear % VERSE_OF_DAY_LIST.length;
  const reference = VERSE_OF_DAY_LIST[index];

  const apiKey = process.env.ESV_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reference,
      text: null,
      error: "ESV API not configured",
    });
  }

  try {
    const params = new URLSearchParams({
      q: reference,
      "include-passage-references": "false",
      "include-verse-numbers": "true",
      "include-footnotes": "false",
      "include-headings": "false",
      "include-short-copyright": "false",
      "include-copyright": "false",
    });
    const res = await fetch(`https://api.esv.org/v3/passage/text/?${params}`, {
      headers: { Authorization: `Token ${apiKey}` },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json({
        reference,
        text: null,
        ...(res.status === 429 && { error: "Verse of the day temporarily unavailable (rate limit). Try again later." }),
      });
    }
    const data = (await res.json()) as { passages?: string[] };
    const text = data.passages?.[0]?.trim() ?? null;
    return NextResponse.json({ reference, text });
  } catch {
    return NextResponse.json({ reference, text: null });
  }
}
