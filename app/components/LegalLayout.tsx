import { HomeNav } from "@/app/components/HomeNav";
import { AppSidebar } from "@/app/components/AppSidebar";
import { AppTopBar } from "@/app/components/AppTopBar";
import { Footer } from "@/app/components/Footer";

type Props = {
  isLoggedIn: boolean;
  children: React.ReactNode;
};

export function LegalLayout({ isLoggedIn, children }: Props) {
  if (isLoggedIn) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          <div className="hidden md:block">
            <AppTopBar />
          </div>
          <div className="flex-1 flex flex-col">
            {children}
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNav />
      <div className="flex-1 flex flex-col">
        {children}
        <Footer />
      </div>
    </div>
  );
}
