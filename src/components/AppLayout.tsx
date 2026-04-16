import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sparkles, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const showBack = location.pathname !== "/";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-white/90 backdrop-blur-sm px-3 md:px-4 sticky top-0 z-20 shadow-sm gap-2">
            {/* Hamburger */}
            <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg flex-shrink-0" />

            {/* Back button */}
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block">Back</span>
              </button>
            )}

            {showBack && <div className="w-px h-5 bg-border flex-shrink-0" />}

            {/* Brand */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gradient-primary truncate">Event Manager</span>
            </div>

            {/* User + Logout */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user && (
                <span className="hidden sm:block text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg capitalize">
                  {user.username} <span className="opacity-70">({user.role})</span>
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
