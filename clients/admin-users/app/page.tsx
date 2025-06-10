"use client"

import { AdminLayout } from "@/components/admin-layout"
import { DashboardContent } from "@/components/dashboard-content"

export default function Page() {
  return (
    <AdminLayout
      title="Dashboard Overview"
      description="Welcome back! Here's what's happening with CAMEROON-PLATES today."
    >
      <DashboardContent />
    </AdminLayout>
  )
}
