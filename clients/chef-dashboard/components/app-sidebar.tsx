"use client"

import {
  ChefHat,
  BarChart3,
  BookOpen,
  Users,
  Settings,
  PlusCircle,
  Eye,
  User,
  Shield,
  Calendar,
  TrendingUp,
  Star,
  Edit,
  FileText,
  Video,
  ImageIcon,
  Bell,
  Award,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

const menuItems = [
  {
    title: "Overview",
    icon: BarChart3,
    id: "overview",
  },
  {
    title: "Cameroonian Recipe Management",
    icon: BookOpen,
    id: "recipes",
    submenu: [
      { title: "All Cameroonian Recipes", icon: BookOpen, id: "all-recipes" },
      { title: "Create Cameroonian Recipe", icon: PlusCircle, id: "create-recipe" },
      { title: "Cameroonian Recipe Analytics", icon: TrendingUp, id: "recipe-analytics" },
      { title: "Bulk Operations", icon: Edit, id: "bulk-operations" },
    ],
  },
  {
    title: "Content Creation",
    icon: Edit,
    id: "content",
    submenu: [
      { title: "Rich Editor", icon: FileText, id: "rich-editor" },
      { title: "Media Gallery", icon: ImageIcon, id: "media-gallery" },
      { title: "Video Upload", icon: Video, id: "video-upload" },
      { title: "Templates", icon: FileText, id: "templates" },
      { title: "Scheduler", icon: Calendar, id: "scheduler" },
    ],
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    id: "analytics",
    submenu: [
      { title: "Performance", icon: BarChart3, id: "performance" },
      { title: "Engagement", icon: Users, id: "engagement" },
      { title: "Revenue", icon: TrendingUp, id: "revenue" },
      { title: "Trending", icon: Star, id: "trending" },
    ],
  },
  {
    title: "Community",
    icon: Users,
    id: "community",
    submenu: [
      { title: "Reviews", icon: Star, id: "reviews" },
      { title: "Followers", icon: Users, id: "followers" },
      { title: "Live Sessions", icon: Video, id: "live-sessions" },
      { title: "Notifications", icon: Bell, id: "notifications" },
      { title: "Moderation", icon: Shield, id: "moderation" },
    ],
  },
  {
    title: "Profile",
    icon: User,
    id: "profile",
    submenu: [
      { title: "Profile Settings", icon: Settings, id: "profile-settings" },
      { title: "Verification", icon: Award, id: "verification" },
      { title: "Portfolio", icon: Eye, id: "portfolio" },
      { title: "Credentials", icon: Shield, id: "credentials" },
    ],
  },
]

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Cameroon Chef Panel</h2>
            <p className="text-sm text-muted-foreground">Authentic Cameroonian Recipes</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={
                      activeSection === item.id ||
                      (item.submenu && item.submenu.some((sub) => sub.id === activeSection))
                    }
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.submenu &&
                    (activeSection === item.id || item.submenu.some((sub) => sub.id === activeSection)) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <SidebarMenuButton
                            key={subItem.id}
                            onClick={() => setActiveSection(subItem.id)}
                            isActive={activeSection === subItem.id}
                            size="sm"
                            className="w-full"
                          >
                            <subItem.icon className="h-3 w-3" />
                            <span>{subItem.title}</span>
                          </SidebarMenuButton>
                        ))}
                      </div>
                    )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Chef Abena</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
              <Badge variant="outline" className="text-xs">
                Pro
              </Badge>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
