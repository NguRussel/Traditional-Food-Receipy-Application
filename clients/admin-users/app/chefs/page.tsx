import { AdminLayout } from "@/components/admin-layout"
import { ChefsContent } from "@/components/chefs-content"

export default function ChefsPage() {
  return (
    <AdminLayout title="Chef Management" description="Manage chef profiles and verification">
      <ChefsContent />
    </AdminLayout>
  )
}
