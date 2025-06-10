"use client"

import { AdminLayout } from "@/components/admin-layout"
import { AnalyticsContent } from "@/components/analytics-content"

export default function AnalyticsPage() {
  return (
    <AdminLayout
      title="Analytics Dashboard"
      description="Comprehensive analytics and insights for AFRI-Plates platform."
    >
      <AnalyticsContent />
    </AdminLayout>
  )
}
