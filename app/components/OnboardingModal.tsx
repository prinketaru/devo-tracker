"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiBook, FiCalendar, FiBell, FiTrendingUp, FiUsers, FiCheckCircle, FiSettings } from "react-icons/fi";

type OnboardingModalProps = {
  isOpen: boolean;
  onComplete: () => void;
};

type Step = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  locations?: { label: string; href: string; description?: string }[];
};

const steps: Step[] = [
  {
    id: 1,
    title: "Welcome to DayMark! 🎉",
    description: "Your daily companion for spiritual growth and consistency",
    icon: <FiBook className="w-12 h-12" />,
    features: [
      "Start from the Dashboard—your home base for today’s devotion",
      "Use the top buttons to log or start a devotion right away",
      "Check your streak and Verse of the Day in one place",
    ],
    locations: [
      {
        label: "Dashboard",
        href: "/dashboard",
        description: "Today’s actions, streak, and recent devotions.",
      },
    ],
  },
  {
    id: 2,
    title: "Create Daily Devotions",
    description: "Write and organize your daily spiritual reflections",
    icon: <FiCalendar className="w-12 h-12" />,
    features: [
      "Start a new entry from the Dashboard or the Devotions page",
      "Use the editor to add passages, reflections, and tags",
      "Quick log lets you record a devotion in seconds",
      "View and edit past devotions anytime",
    ],
    locations: [
      {
        label: "Start today’s devotion",
        href: "/devotions/new",
        description: "Open the editor for a new devotion.",
      },
      {
        label: "All devotions",
        href: "/devotions",
        description: "Browse, search, and open past devotions.",
      },
    ],
  },
  {
    id: 3,
    title: "Stay Consistent with Reminders",
    description: "Never miss your devotion time",
    icon: <FiBell className="w-12 h-12" />,
    features: [
      "Set daily reminder times in Settings",
      "Toggle email reminders and weekly digests",
      "Enable grace-period warnings so you never lose momentum",
      "Reminders show up on your Dashboard if missing",
    ],
    locations: [
      {
        label: "Reminder settings",
        href: "/settings",
        description: "Add times, emails, and weekly digest options.",
      },
    ],
  },
  {
    id: 4,
    title: "Track Your Progress",
    description: "Monitor your spiritual growth journey",
    icon: <FiTrendingUp className="w-12 h-12" />,
    features: [
      "Streaks and weekly stats live on your Dashboard",
      "Use the calendar to spot patterns at a glance",
      "Insights help you see your growth over time",
      "Verse of the Day appears on the Dashboard",
    ],
    locations: [
      {
        label: "Dashboard insights",
        href: "/dashboard",
        description: "Streaks, weekly stats, calendar, and insights.",
      },
    ],
  },
  {
    id: 5,
    title: "Accountability Partners",
    description: "Share your journey with others",
    icon: <FiUsers className="w-12 h-12" />,
    features: [
      "Invite partners from Settings",
      "Partners can view your streak and completion status",
      "Encourage each other without sharing devotion content",
      "Revoke or manage invites anytime",
    ],
    locations: [
      {
        label: "Accountability",
        href: "/settings",
        description: "Find the accountability section in Settings.",
      },
    ],
  },
  {
    id: 6,
    title: "Customize Your Experience",
    description: "Make DayMark work for you",
    icon: <FiSettings className="w-12 h-12" />,
    features: [
      "Set your timezone and profile preferences",
      "Create devotion templates for faster writing",
      "Enable prayer request tracking",
      "Export devotions as PDF, Word, or Markdown",
    ],
    locations: [
      {
        label: "Settings",
        href: "/settings",
        description: "Timezone, templates, prayer, and exports.",
      },
    ],
  },
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && currentStep === steps.length - 1) {
        handleComplete();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to mark onboarding as complete:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-stone-200 dark:bg-zinc-800">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900/30 p-4 text-amber-600 dark:text-amber-400">
              {step.icon}
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h2
                id="onboarding-title"
                className="text-2xl font-semibold text-stone-900 dark:text-stone-50 mb-2"
              >
                {step.title}
              </h2>
              <p className="text-stone-600 dark:text-stone-300 mb-6">
                {step.description}
              </p>

              <ul className="space-y-3">
                {step.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-stone-700 dark:text-stone-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {step.locations && step.locations.length > 0 ? (
                <div className="mt-6 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-900/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                    Where to find this
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {step.locations.map((location) => (
                      <Link
                        key={location.href}
                        href={location.href}
                        className="group rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 hover:border-amber-300 dark:hover:border-amber-500/60 hover:text-stone-900 dark:hover:text-stone-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{location.label}</span>
                          <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
                            Open →
                          </span>
                        </div>
                        {location.description ? (
                          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                            {location.description}
                          </p>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Step indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-amber-500"
                    : index < currentStep
                    ? "w-2 bg-amber-300 dark:bg-amber-600"
                    : "w-2 bg-stone-300 dark:bg-zinc-700"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-8 py-4 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-200 dark:border-zinc-800">
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            disabled={isCompleting}
          >
            Skip tour
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                disabled={isCompleting}
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-25"
              disabled={isCompleting}
            >
              {isCompleting ? "Finishing..." : isLastStep ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
