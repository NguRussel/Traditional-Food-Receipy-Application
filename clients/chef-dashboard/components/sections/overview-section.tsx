import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Eye, Star, TrendingUp, Award, MessageSquare, PlusCircle, BarChart3 } from "lucide-react"

export function OverviewSection() {
  const stats = [
    { title: "Total Cameroonian Recipes", value: "127", icon: BookOpen, change: "+12", color: "text-blue-600" },
    { title: "Followers", value: "15.2K", icon: Users, change: "+324", color: "text-green-600" },
    { title: "Cameroonian Recipe Views", value: "89.4K", icon: Eye, change: "+2.1K", color: "text-purple-600" },
    { title: "Average Rating", value: "4.8", icon: Star, change: "+0.2", color: "text-yellow-600" },
  ]

  const recentRecipes = [
    { name: "Ndolé (Bitterleaf Stew)", views: "2.3K", rating: 4.9, status: "Published" },
    { name: "Poulet DG (Chicken and Plantains)", views: "1.8K", rating: 4.7, status: "Published" },
    { name: "Koki (Black Eyed Pea Pudding)", views: "3.1K", rating: 4.8, status: "Published" },
    { name: "Eru (Okok with Waterfufu)", views: "892", rating: 4.6, status: "Draft" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, Chef Abena!</h2>
          <p className="text-muted-foreground">Here's what's happening with your Cameroonian culinary journey today.</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Cameroonian Recipe
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Recipes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Cameroonian Recipes</CardTitle>
            <CardDescription>Your latest Cameroonian culinary creations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecipes.map((recipe, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{recipe.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {recipe.views}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {recipe.rating}
                    </div>
                  </div>
                  <Badge variant={recipe.status === "Published" ? "default" : "secondary"}>{recipe.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Cameroonian Recipe
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond to Reviews
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Award className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Verification Status
          </CardTitle>
          <CardDescription>Your Cameroonian chef verification progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">85%</span>
            </div>
            <Progress value={85} className="h-2" />
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Profile information completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Cameroonian culinary credentials uploaded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Portfolio showcase (3 more Cameroonian recipes needed)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span>Social media verification pending</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}