import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  Bot, 
  User, 
  Users, 
  BarChart3,
  Moon,
  Sun,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = {
  student: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Materials", url: "/materials", icon: BookOpen },
    { title: "Assignments", url: "/assignments", icon: ClipboardList },
    { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
    { title: "Statistics", url: "/statistics", icon: BarChart3 },
    { title: "Profile", url: "/profile", icon: User },
  ],
  teacher: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Materials", url: "/materials", icon: BookOpen },
    { title: "Assignments", url: "/assignments", icon: ClipboardList },
    { title: "Classrooms", url: "/classrooms", icon: Users },
    { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
    { title: "Profile", url: "/profile", icon: User },
  ]
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;
  const items = user ? navigationItems[user.role] : navigationItems.student;
  
  const isActive = (path: string) => currentPath === path;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">EduPortal</h2>
              <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role} Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <div className="p-4 space-y-4">
            {!isCollapsed && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex-1 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {!isCollapsed && <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>}
              </Button>
              
              {isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}