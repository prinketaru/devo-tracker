"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, BookOpen, HeartPulse, Settings, LogOut, MoreVertical, Menu, Flame } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FooterActions } from "@/app/components/FooterActions";

const NAV_LINKS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Devotions", href: "/devotions", icon: BookOpen },
    { name: "Prayer", href: "/prayer", icon: HeartPulse },
    { name: "Settings", href: "/settings", icon: Settings },
];

// Sidebar always uses these fixed dark palette colors — independent of site theme
const SIDEBAR_BG = "#100f0c";       // darker than page bg #171510
const SIDEBAR_BORDER = "#2a2720";   // subtle warm border
const SIDEBAR_TEXT = "#d6d3c8";     // warm light text
const SIDEBAR_MUTED = "#7e7b72";    // muted warm gray
const SIDEBAR_HOVER_BG = "#1e1c18"; // hover state
const SIDEBAR_ACTIVE_BG = "rgba(180,83,9,0.18)"; // amber tint active
const SIDEBAR_ACTIVE_TEXT = "#fbbf24"; // amber-400

export function AppSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
    const [streak, setStreak] = useState<number | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (!session?.user?.id) return;
        fetch("/api/user/preferences", { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: { profileImageUrl?: string } | null) => {
                if (typeof data?.profileImageUrl === "string" && data.profileImageUrl.trim() !== "") {
                    setProfileImageUrl(data.profileImageUrl.trim());
                } else {
                    setProfileImageUrl(undefined);
                }
            })
            .catch(() => { });
    }, [session?.user?.id]);

    useEffect(() => {
        const handler = (e: Event) => {
            const url = (e as CustomEvent<{ url: string }>).detail?.url;
            setProfileImageUrl(url || undefined);
        };
        window.addEventListener("profile-image-updated", handler);
        return () => window.removeEventListener("profile-image-updated", handler);
    }, []);

    useEffect(() => {
        if (!session?.user?.id) return;
        fetch("/api/user/grace-status", { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: { streak?: number } | null) => {
                setStreak(typeof data?.streak === "number" ? data.streak : null);
            })
            .catch(() => setStreak(null));
    }, [session?.user?.id]);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const userLabel = session?.user?.name || session?.user?.email || "Account";
    const userEmail = session?.user?.email || "";
    const userImage = profileImageUrl ?? session?.user?.image;

    const brandingJsx = (
        <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                D
            </div>
            <span className="text-xl font-semibold tracking-wide font-serif" style={{ color: SIDEBAR_TEXT }}>
                DayMark
            </span>
        </Link>
    );

    const navItemsJsx = (
        <nav className="flex-1 space-y-0.5 mt-2">
            {NAV_LINKS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            background: isActive ? SIDEBAR_ACTIVE_BG : "transparent",
                            color: isActive ? SIDEBAR_ACTIVE_TEXT : SIDEBAR_TEXT,
                            transition: "all 0.3s ease-out",
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all duration-300 ease-out hover:bg-[#1e1c18]"
                    >
                        <Icon
                            className="h-5 w-5"
                            style={{
                                color: isActive ? SIDEBAR_ACTIVE_TEXT : SIDEBAR_MUTED,
                                transition: "color 0.3s ease-out"
                            }}
                        />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );

    const userMenuJsx = (
        <div className="pt-4" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[#1e1c18]"
                    >
                        <Avatar className="h-10 w-10 shrink-0" style={{ border: `1px solid ${SIDEBAR_BORDER}` }}>
                            <AvatarImage src={userImage ?? undefined} alt={userLabel} />
                            <AvatarFallback
                                className="text-sm font-semibold"
                                style={{ background: "#2a2720", color: SIDEBAR_TEXT }}
                            >
                                {userLabel.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                            <span className="text-base font-medium truncate w-full" style={{ color: SIDEBAR_TEXT }}>
                                {userLabel}
                            </span>
                        </div>
                        <MoreVertical className="h-5 w-5 shrink-0" style={{ color: SIDEBAR_MUTED }} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[240px]" sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-base font-medium leading-none text-stone-900 dark:text-stone-100">{userLabel}</p>
                            <p className="text-sm leading-none text-stone-500 dark:text-stone-400 truncate">{userEmail}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer"
                        onClick={() =>
                            authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => router.push("/"),
                                },
                            })
                        }
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    const footerLinksJsx = (
        <div className="mt-auto flex flex-col gap-2.5 px-3 pb-5">
            <Link
                href="/privacy"
                className="text-xs text-[#7A7166] dark:text-[#8A8070] hover:text-[#1A1710] dark:hover:text-[#EDE9E0] transition-colors"
            >
                Privacy
            </Link>
            <Link
                href="/terms"
                className="text-xs text-[#7A7166] dark:text-[#8A8070] hover:text-[#1A1710] dark:hover:text-[#EDE9E0] transition-colors"
            >
                Terms
            </Link>
            <FooterActions />
        </div>
    );

    const sidebarStyle = {
        background: SIDEBAR_BG,
        borderColor: SIDEBAR_BORDER,
    };

    const streakJsx = streak != null && streak > 0 ? (
        <div className="mb-4 flex items-center gap-3.5 rounded-xl border px-4 py-3 shadow-inner cursor-default" style={{ backgroundColor: '#2a1806', borderColor: '#4a2b10' }}>
            <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5" style={{ color: '#fbbf24' }} />
                <span className="text-xl font-bold" style={{ color: '#fbbf24' }}>
                    {streak}
                </span>
            </div>
            <div className="flex flex-col justify-center">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: '#e5a845' }}>
                    Day Streak
                </span>
                <span className="text-xs font-medium" style={{ color: '#998d7d' }}>
                    Keep it going!
                </span>
            </div>
        </div>
    ) : null;

    return (
        <>
            {/* Mobile Top Bar */}
            <div
                className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b"
                style={sidebarStyle}
            >
                {brandingJsx}
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="-mr-2"
                            style={{ color: SIDEBAR_TEXT }}
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-72 flex flex-col p-6 border-r"
                        style={sidebarStyle}
                    >
                        <div className="mb-6">
                            {brandingJsx}
                        </div>
                        <div className="border-t -mx-6 mb-6" style={{ borderColor: SIDEBAR_BORDER }} />
                        {streakJsx}
                        {navItemsJsx}
                        {footerLinksJsx}
                        {userMenuJsx}
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div
                className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 border-r"
                style={sidebarStyle}
            >
                <div className="h-[79px] shrink-0 flex items-center px-6 border-b" style={{ borderColor: SIDEBAR_BORDER }}>
                    {brandingJsx}
                </div>
                <div className="flex-1 flex flex-col pt-6 pb-2 px-4 overflow-y-auto">
                    {streakJsx}
                    {navItemsJsx}
                    {footerLinksJsx}
                    {userMenuJsx}
                </div>
            </div>
        </>
    );
}
