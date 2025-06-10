"use client"

import { AdminLayout } from "@/components/admin-layout"
import { SecurityContent } from "@/components/security-content"

export default function SecurityPage() {
  return (
    <AdminLayout title="Security" description="Monitor security events and manage platform security.">
      <SecurityContent />
    </AdminLayout>
  )
}
