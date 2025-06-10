"use client"

import { AdminLayout } from "@/components/admin-layout"
import { SettingsContent } from "@/components/settings-content"

export default function SettingsPage() {
  return (
    <AdminLayout title="Settings" description="Manage platform settings and configurations.">
      <SettingsContent />
    </AdminLayout>
  )
}
