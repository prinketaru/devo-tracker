import Link from "next/link";

export function HowItWorks() {
  const steps = [
    { num: "1", title: "Sign in", description: "Create an account in seconds with Google, Discord, or email." },
    { num: "2", title: "Start today's devotion", description: "Open the editor, read Scripture, and capture your thoughts." },
    { num: "3", title: "Keep your streak", description: "Log daily and watch your consistency grow." },
  ];

  return (
    <section className="border-t border-stone-200 dark:border-[#2a2720]">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-[#d6d3c8] mb-4">
          Simple to start
        </h2>
        <p className="text-center text-stone-600 dark:text-[#b8b5ac] mb-14 max-w-xl mx-auto">
          Three steps to a more consistent devotion practice.
        </p>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8 mb-14">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-lg mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-[#d6d3c8] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-stone-600 dark:text-[#b8b5ac]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#f0a531] text-stone-900 rounded-xl font-semibold text-base hover:bg-[#c0831a] active:bg-[#c0831a] transition-colors shadow-lg shadow-[#f0a531]/20"
          >
            Start Your Journey
          </Link>
        </div>
      </div>
    </section>
  );
}
