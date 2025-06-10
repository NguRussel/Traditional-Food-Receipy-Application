import { AdminLayout } from "@/components/admin-layout"
import { UserManagement } from "@/components/user-management"

export default function UsersPage() {
  return (
    <AdminLayout title="User Management" description="Manage users, chefs, and administrators across the platform.">
      <UserManagement />
    </AdminLayout>
  )
}
