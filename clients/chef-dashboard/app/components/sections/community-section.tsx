"use client"

import { Card } from "@/components/ui/card"

export function CommunitySection({ activeTab }: { activeTab: string }) {
  const renderContent = () => {
    switch (activeTab) {
      case "reviews":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recipe Reviews</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <p className="font-medium">User {i}</p>
                    </div>
                    <div className="flex items-center text-orange-500">
                      {[...Array(5)].map((_, j) => (
                        <svg
                          key={j}
                          className={`w-4 h-4 ${j < 5 - i + 1 ? "fill-current" : "stroke-current fill-none"}`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">Great recipe! I made this for my family and they loved it.</p>
                  <p className="text-sm text-gray-500 mt-2">2 days ago</p>
                </div>
              ))}
            </div>
          </Card>
        )
      case "followers":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Followers</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium">Follower {i}</p>
                      <p className="text-sm text-gray-500">Joined 2 weeks ago</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-sm rounded-md bg-gray-100">Follow Back</button>
                </div>
              ))}
            </div>
          </Card>
        )
      case "live-sessions":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Cooking Sessions</h3>
            <div className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <h4 className="font-medium mb-2">Start a Live Session</h4>
                <p className="text-sm text-gray-500 mb-4">Share your cooking experience in real-time</p>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-md">Go Live</button>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Upcoming Sessions</h4>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cooking Session {i}</p>
                        <p className="text-sm text-gray-500">Tomorrow at {i + 1}:00 PM</p>
                      </div>
                      <button className="px-3 py-1 text-sm rounded-md bg-gray-100">Set Reminder</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )
      case "notifications":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 border-b pb-4">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 text-sm">{i}</span>
                  </div>
                  <div>
                    <p className="font-medium">New comment on your recipe</p>
                    <p className="text-sm text-gray-600">User {i} commented: "This looks amazing!"</p>
                    <p className="text-xs text-gray-500 mt-1">{i} hour{i !== 1 ? "s" : ""} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      case "moderation":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Moderation</h3>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Pending Reviews</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Reported Comments</p>
                  <p className="text-2xl font-semibold">5</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">Spam Detected</p>
                  <p className="text-2xl font-semibold">3</p>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Recent Reports</h4>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Reported Comment {i}</p>
                        <p className="text-sm text-gray-500">Reported by User {i}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-600">Remove</button>
                        <button className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-600">Approve</button>
                      </div>
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
            <h3 className="text-lg font-semibold">Community</h3>
            <p className="mt-2 text-gray-500">Select an option from the sidebar to manage your community.</p>
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