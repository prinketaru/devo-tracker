"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userLabel = session?.user?.name || session?.user?.email || "Account";
  const userEmail = session?.user?.email || "Signed in";
  const userImage = session?.user?.image;

  return (
    <nav className="border-b border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/60 backdrop-blur">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg font-semibold shadow-sm group-hover:bg-amber-700 transition-colors">
            D
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-50">
              Devo Tracker
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Daily devotion, made consistent.
            </span>
          </div>
        </Link>
        <div className="flex gap-3 items-center">
          {session?.user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white transition-colors text-sm cursor-pointer"
              >
                <span className="h-8 w-8 rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center text-xs font-semibold text-stone-700 dark:text-stone-200">
                  {userImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userImage}
                      alt={userLabel}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userLabel.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="max-w-[140px] truncate">{userLabel}</span>
              </button>
              {isOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-2 text-sm cursor-pointer">
                  <div className="px-4 pb-2">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {userLabel}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {userEmail}
                    </p>
                  </div>
                  <div className="border-t border-stone-200 dark:border-zinc-700 my-2" />
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Settings
                  </Link>
                  <div className="border-t border-stone-200 dark:border-zinc-700 my-2" />
                  <button
                    type="button"
                    onClick={() =>
                      authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => router.push("/"),
                        },
                      })
                    }
                    className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors text-sm"
            >
              Sign In
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
