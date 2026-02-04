"use client";

import { useState, useEffect } from "react";
import { OnboardingModal } from "./OnboardingModal";

type OnboardingWrapperProps = {
  showOnboarding: boolean;
};

export function OnboardingWrapper({ showOnboarding }: OnboardingWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Delay showing the modal slightly to let the page render first
    if (showOnboarding) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding]);

  const handleComplete = () => {
    setIsOpen(false);
    // Optionally refresh the page or update state
    // For now, just close the modal
  };

  return <OnboardingModal isOpen={isOpen} onComplete={handleComplete} />;
}
