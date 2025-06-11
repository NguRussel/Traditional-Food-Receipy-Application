"use client"

import { OverviewSection } from "@/components/sections/overview-section"
import { RecipeManagementSection } from "@/components/sections/recipe-management-section"
import { ContentCreationSection } from "@/components/sections/content-creation-section"
import { AnalyticsSection } from "@/components/sections/analytics-section"
import { CommunitySection } from "@/components/sections/community-section"
import { ProfileSection } from "@/components/sections/profile-section"
import { Plus, BarChart3, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface DashboardContentProps {
  activeSection: string
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />
      case "recipe-management":
        return <RecipeManagementSection activeTab={activeSection} />
      case "content-creation":
        return <ContentCreationSection activeTab={activeSection} />
      case "analytics":
        return <AnalyticsSection activeTab={activeSection} />
      case "community":
        return <CommunitySection activeTab={activeSection} />
      case "profile":
        return <ProfileSection activeTab={activeSection} />
      default:
        return <OverviewSection />
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return "Overview"
      case "recipe-management":
        return "Recipe Management"
      case "content-creation":
        return "Content Creation"
      case "analytics":
        return "Analytics"
      case "community":
        return "Community"
      case "profile":
        return "Profile"
      default:
        return "Overview"
    }
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold">{getSectionTitle()}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="p-6">{renderContent()}</div>
      </main>
    </>
  )
} 