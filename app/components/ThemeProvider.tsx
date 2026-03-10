"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const isDark =
    theme === "dark"
      ? true
      : theme === "light"
        ? false
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
  // Also toggle on body so Radix UI portal elements (direct body children)
  // inherit the dark variant from their immediate parent.
  document.body.classList.toggle("dark", isDark);
}

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
    const isDark =
      stored === "dark"
        ? true
        : stored === "light"
          ? false
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setResolvedTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
        setResolvedTheme(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [mounted]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    const isDark =
      next === "dark"
        ? true
        : next === "light"
          ? false
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setResolvedTheme(isDark ? "dark" : "light");
  }, []);

  const value: ThemeContextValue = { theme, resolvedTheme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "system",
      resolvedTheme: "light",
      setTheme(next: Theme) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, next);
          applyTheme(next);
        }
      },
    };
  }
  return ctx;
}
