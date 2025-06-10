"use client"

import { AdminLayout } from "@/components/admin-layout"
import { ContentReportsContent } from "@/components/content-reports-content"

export default function ContentReportsPage() {
  return (
    <AdminLayout title="Content Reports" description="Manage user reports and content moderation issues.">
      <ContentReportsContent />
    </AdminLayout>
  )
}
