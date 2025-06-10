"use client"

import { AdminLayout } from "@/components/admin-layout"
import { RecipeModerationContent } from "@/components/recipe-moderation-content"

export default function RecipeModerationPage() {
  return (
    <AdminLayout title="Recipe Moderation" description="Review and moderate recipe submissions from chefs.">
      <RecipeModerationContent />
    </AdminLayout>
  )
}
