import { LayoutDashboard, CalendarDays, PlusCircle, Sparkles, Database } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard",   url: "/",            icon: LayoutDashboard },
  { title: "Event List",  url: "/events",       icon: CalendarDays    },
  { title: "Add Enquiry", url: "/add-enquiry",  icon: PlusCircle      },
  { title: "Masters",     url: "/masters",      icon: Database, adminOnly: true },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isActive = (url: string) =>
    url === "/" ? currentPath === "/" : currentPath.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="gradient-sidebar border-r border-white/10">
      <SidebarContent className="gradient-sidebar">
        {/* Brand — always show on mobile, show when expanded on desktop */}
        {(!collapsed || isMobile) && (
          <div className="px-4 py-5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center glow-primary shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Event Manager</p>
              <p className="text-[10px] text-white/50">Pro Suite</p>
            </div>
          </div>
        )}
        {collapsed && !isMobile && <div className="h-5" />}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {items.map((item) => {
                const active = isActive(item.url);
                if (item.adminOnly && user?.role !== "admin") return null;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        onClick={handleNavClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-white/20 text-white shadow-sm"
                            : "text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {(!collapsed || isMobile) && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
