import { AdminLayout } from "@/components/admin-layout"
import { ReportsContent } from "@/components/reports-content"

export default function ReportsPage() {
  return (
    <AdminLayout title="Reports" description="View and manage system reports">
      <ReportsContent />
    </AdminLayout>
  )
}
