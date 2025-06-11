"use client"

import { Card } from "@/components/ui/card"

export function ProfileSection({ activeTab }: { activeTab: string }) {
  const renderContent = () => {
    switch (activeTab) {
      case "profile-settings":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
            <form className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-200" />
                <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                  Change Photo
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Name</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md" defaultValue="Chef John" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border rounded-md" defaultValue="chef@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea className="w-full px-3 py-2 border rounded-md" rows={4} defaultValue="Professional chef with 10 years of experience..." />
                </div>
              </div>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md">Save Changes</button>
            </form>
          </Card>
        )
      case "verification":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Chef Verification</h3>
            <div className="space-y-6">
              <div className="p-4 border rounded-md bg-orange-50">
                <h4 className="font-medium text-orange-800">Verification Status</h4>
                <p className="text-sm text-orange-600 mt-1">Your account is pending verification</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Certification</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Upload your culinary certification</p>
                    <button className="px-4 py-2 border rounded-md hover:bg-gray-50">Upload Document</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Work Experience</label>
                  <textarea className="w-full px-3 py-2 border rounded-md" rows={4} placeholder="Describe your professional experience..." />
                </div>
              </div>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md">Submit for Verification</button>
            </div>
          </Card>
        )
      case "portfolio":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recipe Portfolio</h3>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                      <button className="px-4 py-2 bg-white rounded-md">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full px-4 py-2 border rounded-md hover:bg-gray-50">
                Add New Recipe
              </button>
            </div>
          </Card>
        )
      case "credentials":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Credentials</h3>
            <div className="space-y-6">
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Change Password</h4>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input type="password" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input type="password" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input type="password" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-md">Update Password</button>
                </form>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 border rounded-md hover:bg-gray-50">Enable 2FA</button>
              </div>
            </div>
          </Card>
        )
      default:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Profile</h3>
            <p className="mt-2 text-gray-500">Select an option from the sidebar to manage your profile.</p>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
} 