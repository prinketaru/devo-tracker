import { NextRequest, NextResponse } from "next/server";

const ESV_API_BASE = "https://api.esv.org/v3/passage/html";

export async function GET(request: NextRequest) {
  const apiKey = process.env.ESV_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ESV API is not configured (missing ESV_API_KEY)." },
      { status: 503 }
    );
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json(
      { error: "Passage query (q) is required." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    q,
    "include-passage-references": "false",
    "include-verse-numbers": "true",
    "include-footnotes": "true",
    "include-footnote-body": "true",
    "include-headings": "true",
    "include-short-copyright": "false",
    "include-copyright": "false",
    "include-audio-link": "true",
  });

  try {
    const res = await fetch(`${ESV_API_BASE}/?${params.toString()}`, {
      headers: { Authorization: `Token ${apiKey}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || `ESV API error: ${res.status}` },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    const data = (await res.json()) as {
      query?: string;
      canonical?: string;
      passages?: string[];
    };
    return NextResponse.json({
      query: data.query,
      canonical: data.canonical,
      passages: data.passages ?? [],
    });
  } catch (err) {
    console.error("ESV API request failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch passage." },
      { status: 502 }
    );
  }
}
