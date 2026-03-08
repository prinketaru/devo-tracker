"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/devotions": "Devotions",
    "/prayer": "Prayer",
    "/settings": "Settings",
    "/announcements": "Updates",
};

function getPageTitle(pathname: string): string {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    const prefix = Object.keys(PAGE_TITLES).find(
        (key) => key !== "/" && pathname.startsWith(key + "/")
    );
    return prefix ? PAGE_TITLES[prefix] : "DayMark";
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

export function AppTopBar() {
    const pathname = usePathname();
    const title = getPageTitle(pathname);
    const date = getFormattedDate();

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[#E3DED4] dark:border-[#2E2B23] bg-[#F9F8F5]/90 dark:bg-[#171510]/90 backdrop-blur-md">
            <div>
                <h1 className="text-xl font-semibold leading-tight text-[#1A1710] dark:text-[#EDE9E0]">
                    {title}
                </h1>
                <p className="text-xs mt-0.5 font-normal text-[#7A7166] dark:text-[#8A8070]">
                    {date}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-[#7A7166] hover:text-[#1A1710] hover:bg-[#F0EDE6] dark:text-[#8A8070] dark:hover:text-[#EDE9E0] dark:hover:bg-[#252118]"
                title="Updates & Announcements"
            >
                <Link href="/announcements">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">View announcements</span>
                </Link>
            </Button>
        </header>
    );
}
