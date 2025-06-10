"use client"

import { AdminLayout } from "@/components/admin-layout"
import { RegionsContent } from "@/components/regions-content"

export default function RegionsPage() {
  return (
    <AdminLayout title="Regions & Tribes" description="Manage regional content and tribal cuisine categories.">
      <RegionsContent />
    </AdminLayout>
  )
}
