import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Users, Eye, Star, TrendingUp, Award, MessageSquare, PlusCircle, BarChart3, Calendar, CheckCircle, Utensils, Edit, MoreHorizontal } from "lucide-react"

export function OverviewSection() {
  const stats = [
    { title: "Total Recipes", value: "127", icon: BookOpen, change: "+12", color: "text-blue-600" },
    { title: "Followers", value: "15.2K", icon: Users, change: "+324", color: "text-green-600" },
    { title: "Recipe Views", value: "89.4K", icon: Eye, change: "+2.1K", color: "text-purple-600" },
    { title: "Average Rating", value: "4.8", icon: Star, change: "+0.2", color: "text-yellow-600" },
  ]

  const recentRecipes = [
    { name: "Spicy Thai Basil Chicken", views: "2.3K", rating: 4.9, status: "Published", date: "2 days ago" },
    { name: "Homemade Pasta Carbonara", views: "1.8K", rating: 4.7, status: "Published", date: "5 days ago" },
    { name: "Chocolate Lava Cake", views: "3.1K", rating: 4.8, status: "Published", date: "1 week ago" },
    { name: "Mediterranean Quinoa Bowl", views: "892", rating: 4.6, status: "Draft", date: "3 days ago" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <Card className="animate-fade-in overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 pointer-events-none"></div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary animate-pulse-slow mb-2">
              <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
              Dashboard Updated
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, Chef Julia!</h2>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your recipes today.
            </p>
          </div>
          <Button className="shrink-0 px-6 py-6">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Recipe
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-fade-in overflow-hidden" style={{animationDelay: `${index * 100}ms`}}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <div className="h-4 w-4 text-primary">
                    {(() => {
                      const Icon = stat.icon;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </div>
                </div>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Recipes */}
        <Card className="col-span-1 md:col-span-2 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Recent Recipes
            </CardTitle>
            <CardDescription>You have {recentRecipes.length} recipes this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecipes.map((recipe, index) => (
                <div key={index} className="flex items-center justify-between space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{recipe.name}</p>
                      <div className="flex items-center mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/70 mr-2"></div>
                        <p className="text-xs text-muted-foreground">{recipe.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start group" variant="outline">
              <div className="p-1.5 rounded-full bg-primary/10 mr-2 group-hover:bg-primary/20 transition-colors">
                <PlusCircle className="h-4 w-4 text-primary" />
              </div>
              Create New Recipe
            </Button>
            <Button className="w-full justify-start group" variant="outline">
              <div className="p-1.5 rounded-full bg-primary/10 mr-2 group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              Respond to Reviews
            </Button>
            <Button className="w-full justify-start group" variant="outline">
              <div className="p-1.5 rounded-full bg-primary/10 mr-2 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              View Analytics
            </Button>
            <Button className="w-full justify-start group" variant="outline">
              <div className="p-1.5 rounded-full bg-primary/10 mr-2 group-hover:bg-primary/20 transition-colors">
                <Award className="h-4 w-4 text-primary" />
              </div>
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
          <CardDescription>Your chef verification progress</CardDescription>
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
                <span>Culinary credentials uploaded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Portfolio showcase (3 more recipes needed)</span>
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