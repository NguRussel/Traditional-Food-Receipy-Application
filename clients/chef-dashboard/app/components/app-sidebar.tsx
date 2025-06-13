"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  UtensilsCrossed,
  PenTool,
  BarChart3,
  Users,
  UserCircle,
  ChefHat,
  CheckCircle,
  Crown,
  LogOut,
} from "lucide-react"

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({
  activeSection,
  setActiveSection,
}: AppSidebarProps) {
  const navigationItems = [
    {
      section: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      section: "recipe-management",
      label: "Recipe Management",
      icon: UtensilsCrossed,
    },
    {
      section: "content-creation",
      label: "Content Creation",
      icon: PenTool,
    },
    {
      section: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      section: "community",
      label: "Community",
      icon: Users,
    },
    {
      section: "profile",
      label: "Profile",
      icon: UserCircle,
    },
  ]

  const handleSignOut = () => {
    // a mock sign out function
    // remove the auth cookie and redirect to login
    document.cookie = "chef-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login"
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <ChefHat className="h-7 w-7" />
          <div>
            <h2 className="text-lg font-semibold">Chef Dashboard</h2>
            <p className="text-sm text-muted-foreground">Culinary Excellence</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.section}
              variant={activeSection === item.section ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveSection(item.section)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <UserCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Chef Julia</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-500">Pro</span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-center gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
} 