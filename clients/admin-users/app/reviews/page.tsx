"use client"

import { AdminLayout } from "@/components/admin-layout"
import { ReviewsContent } from "@/components/reviews-content"

export default function ReviewsPage() {
  return (
    <AdminLayout title="Reviews Management" description="Manage user reviews and ratings across the platform.">
      <ReviewsContent />
    </AdminLayout>
  )
}
