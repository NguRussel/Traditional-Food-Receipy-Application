"use client"

import { AdminLayout } from "@/components/admin-layout"
import { CulturalContentContent } from "@/components/cultural-content-content"

export default function CulturalContentPage() {
  return (
    <AdminLayout title="Cultural Content" description="Manage cultural stories, traditions, and educational content.">
      <CulturalContentContent />
    </AdminLayout>
  )
}
