import { AppSidebar } from "@/app/components/AppSidebar";
import { AppTopBar } from "@/app/components/AppTopBar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background">
            <AppSidebar />
            {/*
              The main content area gets margin-left on desktop (w-64 = 16rem = 256px)
              to accommodate the fixed desktop sidebar.
              On mobile, the AppSidebar renders a top sticky bar instead.
            */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                {/* Top bar: hidden on mobile (AppSidebar already renders a top bar there) */}
                <div className="hidden md:block">
                    <AppTopBar />
                </div>
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
