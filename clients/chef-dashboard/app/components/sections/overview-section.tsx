"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Users,
  Eye,
  Star,
  Plus,
  MessageSquare,
  BarChart3,
  User,
  CheckCircle,
  AlertCircle,
  Circle,
  ShieldCheck,
} from "lucide-react"

export function OverviewSection() {
  const recentRecipes = [
    {
      name: "Spicy Thai Basil Chicken",
      views: "2.3K",
      rating: "4.9",
      status: "Published",
    },
    {
      name: "Homemade Pasta Carbonara",
      views: "1.8K",
      rating: "4.7",
      status: "Published",
    },
    {
      name: "Chocolate Lava Cake",
      views: "3.1K",
      rating: "4.8",
      status: "Published",
    },
    {
      name: "Mediterranean Quinoa Bowl",
      views: "892",
      rating: "4.6",
      status: "Draft",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, Chef Julia!
        </h1>
        <p className="text-gray-500">
          Here's what's happening with your culinary journey today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Recipes</p>
              <p className="text-2xl font-bold">127</p>
              <p className="text-sm text-green-500">+12 from last month</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Followers</p>
              <p className="text-2xl font-bold">15.2K</p>
              <p className="text-sm text-green-500">+324 from last month</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Recipe Views</p>
              <p className="text-2xl font-bold">89.4K</p>
              <p className="text-sm text-green-500">+2.1K from last month</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-green-500">+0.2 from last month</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Recipes</CardTitle>
            <p className="text-sm text-gray-500">Your latest culinary creations</p>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                {recentRecipes.map((recipe) => (
                  <tr key={recipe.name} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{recipe.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>
                          <Eye className="mr-1 inline h-4 w-4" />
                          {recipe.views}
                        </span>
                        <span>
                          <Star className="mr-1 inline h-4 w-4" />
                          {recipe.rating}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          recipe.status === "Published"
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {recipe.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Create New Recipe
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              Respond to Reviews
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <User className="h-4 w-4" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gray-800" />
            <CardTitle className="text-xl font-semibold">Verification Status</CardTitle>
          </div>
          <p className="text-sm text-gray-500">Your chef verification progress</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="mb-1 flex justify-between">
              <span className="text-sm font-medium text-gray-800">
                Profile Completion
              </span>
              <span className="text-sm font-medium text-gray-800">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Profile information completed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Culinary credentials uploaded</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">
                Portfolio showcase (3 more recipes needed)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                Social media verification pending
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 