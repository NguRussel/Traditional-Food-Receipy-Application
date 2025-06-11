import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { OverviewSection } from "@/components/sections/overview-section"
import { RecipeManagementSection } from "@/components/sections/recipe-management-section"
import { ContentCreationSection } from "@/components/sections/content-creation-section"
import { AnalyticsSection } from "@/components/sections/analytics-section"
import { CommunitySection } from "@/components/sections/community-section"
import { ProfileSection } from "@/components/sections/profile-section"

interface DashboardContentProps {
  activeSection: string
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />
      case "recipes":
      case "all-recipes":
      case "create-recipe":
      case "recipe-analytics":
      case "bulk-operations":
        return <RecipeManagementSection activeTab={activeSection} />
      case "content":
      case "rich-editor":
      case "media-gallery":
      case "video-upload":
      case "templates":
      case "scheduler":
        return <ContentCreationSection activeTab={activeSection} />
      case "analytics":
      case "performance":
      case "engagement":
      case "revenue":
      case "trending":
        return <AnalyticsSection activeTab={activeSection} />
      case "community":
      case "reviews":
      case "followers":
      case "live-sessions":
      case "notifications":
      case "moderation":
        return <CommunitySection activeTab={activeSection} />
      case "profile":
      case "profile-settings":
      case "verification":
      case "portfolio":
      case "credentials":
        return <ProfileSection activeTab={activeSection} />
      default:
        return <OverviewSection />
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold capitalize">{activeSection.replace("-", " ")}</h1>
      </header>
      <div className="flex-1 overflow-auto p-4">{renderContent()}</div>
    </SidebarInset>
  )
}
