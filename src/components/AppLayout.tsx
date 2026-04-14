import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Show back button on every page except the dashboard (root)
  const showBack = location.pathname !== "/";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-white/90 backdrop-blur-sm px-3 md:px-4 sticky top-0 z-20 shadow-sm gap-2">
            {/* Hamburger */}
            <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg flex-shrink-0" />

            {/* Back button — shown on all pages except dashboard */}
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block">Back</span>
              </button>
            )}

            {/* Divider */}
            {showBack && <div className="w-px h-5 bg-border flex-shrink-0" />}

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gradient-primary">Event Manager</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
