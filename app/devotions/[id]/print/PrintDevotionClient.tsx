"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Devotion = {
  id: string;
  title: string;
  passage: string;
  content: string;
  date: string;
  minutesSpent?: number;
  tags: string[];
};

export function PrintDevotionClient({ devotion }: { devotion: Devotion }) {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; }
        }
        @media screen {
          .print-only { display: block; }
        }
      `}</style>
      <article className="max-w-2xl mx-auto">
        <header className="mb-8 border-b border-stone-200 pb-4">
          <h1 className="text-2xl font-bold text-stone-900">{devotion.title}</h1>
          <p className="mt-2 text-sm text-stone-600">
            {devotion.date}
            {devotion.passage !== "—" && (
              <>
                <span className="mx-2">·</span>
                <span className="font-medium">{devotion.passage}</span>
              </>
            )}
            {devotion.minutesSpent != null && devotion.minutesSpent > 0 && (
              <>
                <span className="mx-2">·</span>
                <span>{devotion.minutesSpent} min</span>
              </>
            )}
          </p>
          {devotion.tags.length > 0 && (
            <p className="mt-2 text-xs text-stone-500">
              {devotion.tags.join(", ")}
            </p>
          )}
        </header>
        <div className="prose prose-stone max-w-none text-base leading-relaxed">
          <ReactMarkdown>{devotion.content}</ReactMarkdown>
        </div>
        <footer className="mt-12 pt-4 border-t border-stone-200 text-xs text-stone-500">
          Devo Tracker — devotracker.app
        </footer>
      </article>
    </>
  );
}
