"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { SidebarInset } from "@/components/ui/sidebar"

export default function ChefDashboard() {
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <SidebarInset>
        <DashboardContent activeSection={activeSection} />
      </SidebarInset>
    </div>
  )
}
