import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    { num: "1", title: "Sign in", description: "Create an account in seconds with Google, Discord, or email." },
    { num: "2", title: "Start today's devotion", description: "Open the editor, read Scripture, and capture your thoughts." },
    { num: "3", title: "Keep your streak", description: "Log daily and watch your consistency grow." },
  ];

  return (
    <section className="bg-background border-t border-stone-200 dark:border-[#2a2720]">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-widest">
            Getting started
          </span>
          <h2 className="text-4xl font-bold text-stone-900 dark:text-[#d6d3c8] mb-4">
            Simple to start
          </h2>
          <p className="text-lg text-stone-500 dark:text-[#7e7b72] max-w-xl mx-auto">
            Three steps to a more consistent devotion practice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {steps.map((step, index) => (
            <div key={step.num} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] -right-4 h-px bg-stone-200 dark:bg-[#2a2720]" />
              )}
              <div className="rounded-2xl border border-stone-200 dark:border-[#2a2720] bg-stone-50 dark:bg-[#171510] p-7 text-center hover:shadow-md dark:hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-800/60 transition-all duration-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-[#d6d3c8] mb-2">
                  {step.title}
                </h3>
                <p className="text-stone-500 dark:text-[#7e7b72] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white rounded-xl font-semibold text-sm shadow-sm shadow-amber-600/20 transition-colors"
          >
            Start your journey
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
