"use client";

import { useState, useEffect } from "react";
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
};

const steps: Step[] = [
  {
    id: 1,
    title: "Welcome to Devo Tracker! 🎉",
    description: "Your daily companion for spiritual growth and consistency",
    icon: <FiBook className="w-12 h-12" />,
    features: [
      "Track your daily devotional time",
      "Record reflections and spiritual insights",
      "Build consistent habits with streak tracking",
    ],
  },
  {
    id: 2,
    title: "Create Daily Devotions",
    description: "Write and organize your daily spiritual reflections",
    icon: <FiCalendar className="w-12 h-12" />,
    features: [
      "Use Bible passages to guide your devotions",
      "Rich text editor with formatting options",
      "Track time spent in devotion",
      "Quick log feature for busy days",
    ],
  },
  {
    id: 3,
    title: "Stay Consistent with Reminders",
    description: "Never miss your devotion time",
    icon: <FiBell className="w-12 h-12" />,
    features: [
      "Set multiple daily reminder times",
      "Email notifications to keep you on track",
      "Weekly digest of your spiritual journey",
      "Grace period to maintain your streak",
    ],
  },
  {
    id: 4,
    title: "Track Your Progress",
    description: "Monitor your spiritual growth journey",
    icon: <FiTrendingUp className="w-12 h-12" />,
    features: [
      "View your current and best streaks",
      "Weekly statistics and insights",
      "Devotion calendar to see your consistency",
      "Verse of the day for daily inspiration",
    ],
  },
  {
    id: 5,
    title: "Accountability Partners",
    description: "Share your journey with others",
    icon: <FiUsers className="w-12 h-12" />,
    features: [
      "Invite accountability partners to track your progress",
      "Partners can see your devotion streaks",
      "Encourage each other in spiritual growth",
      "Privacy-focused sharing (partners see stats, not content)",
    ],
  },
  {
    id: 6,
    title: "Customize Your Experience",
    description: "Make Devo Tracker work for you",
    icon: <FiSettings className="w-12 h-12" />,
    features: [
      "Set your timezone for accurate tracking",
      "Create devotion templates to save time",
      "Enable prayer requests and tracking",
      "Export devotions as PDF or Word documents",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
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
