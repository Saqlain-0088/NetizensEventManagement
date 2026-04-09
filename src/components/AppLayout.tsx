import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sparkles } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-white/90 backdrop-blur-sm px-3 md:px-4 sticky top-0 z-20 shadow-sm">
            {/* Hamburger — visible on all screen sizes, opens sheet on mobile */}
            <SidebarTrigger className="mr-3 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg flex-shrink-0" />
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
