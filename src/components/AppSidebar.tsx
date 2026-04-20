import { LayoutDashboard, CalendarDays, PlusCircle, Sparkles, Database, Calendar, Link2, Link2Off } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
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
  const { user, roles } = useAuth();
  const { isAuthenticated, login, logout } = useGoogleAuth();
  const role = roles.find(r => r.id === user?.roleId);
  const isAdmin = role?.permissions.canView && role?.permissions.canAdd && role?.permissions.canEdit && role?.permissions.canDelete;
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
      <SidebarContent className="gradient-sidebar flex flex-col h-full">
        <div className="flex-1">
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
                  if (item.adminOnly && !isAdmin) return null;
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
        </div>

        {/* Google Calendar Connection Status */}
        <div className="px-2 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={isAuthenticated ? logout : login}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isAuthenticated 
                    ? "text-green-400 hover:bg-green-400/10" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {isAuthenticated ? (
                  <>
                    <Calendar className="h-4 w-4 shrink-0" />
                    {(!collapsed || isMobile) && (
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="truncate">Calendar Connected</span>
                        <span className="text-[9px] opacity-70">Click to disconnect</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 shrink-0 opacity-50" />
                    {(!collapsed || isMobile) && (
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="truncate">Connect Calendar</span>
                        <span className="text-[9px] opacity-70">Sync confirmed events</span>
                      </div>
                    )}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
