"use client"

import { Card } from "@/components/ui/card"

export function AnalyticsSection({ activeTab }: { activeTab: string }) {
  const renderContent = () => {
    switch (activeTab) {
      case "performance":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500">Page Views</p>
                <p className="text-2xl font-semibold">12,345</p>
                <p className="text-xs text-green-600">+12.3% vs last month</p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500">Unique Visitors</p>
                <p className="text-2xl font-semibold">5,678</p>
                <p className="text-xs text-green-600">+8.7% vs last month</p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500">Avg. Time on Page</p>
                <p className="text-2xl font-semibold">4:32</p>
                <p className="text-xs text-red-600">-2.1% vs last month</p>
              </div>
            </div>
          </Card>
        )
      case "engagement":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Comments</p>
                  <p className="text-2xl font-semibold">1,234</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Shares</p>
                  <p className="text-2xl font-semibold">567</p>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Most Engaged Recipes</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p>Recipe {i}</p>
                      <p className="text-sm text-gray-500">{100 - i * 20} comments</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )
      case "revenue":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold">$12,345</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Premium Subscriptions</p>
                  <p className="text-2xl font-semibold">234</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Avg. Order Value</p>
                  <p className="text-2xl font-semibold">$52.80</p>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Revenue by Source</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p>Subscriptions</p>
                    <p className="text-sm text-gray-500">60%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>One-time Purchases</p>
                    <p className="text-sm text-gray-500">25%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>Affiliates</p>
                    <p className="text-sm text-gray-500">15%</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      case "trending":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Trending Content</h3>
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Top Recipes This Week</h4>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-orange-100" />
                      <div>
                        <p className="font-medium">Recipe {i}</p>
                        <p className="text-sm text-gray-500">{1000 - i * 100} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Popular Categories</h4>
                <div className="space-y-2">
                  {["Main Course", "Desserts", "Appetizers"].map((category) => (
                    <div key={category} className="flex items-center justify-between">
                      <p>{category}</p>
                      <p className="text-sm text-gray-500">+{Math.floor(Math.random() * 50)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )
      default:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Analytics</h3>
            <p className="mt-2 text-gray-500">Select an option from the sidebar to view detailed analytics.</p>
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