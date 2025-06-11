import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Share2, Star, DollarSign, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalyticsSectionProps {
  activeTab: string
}

export function AnalyticsSection({ activeTab }: AnalyticsSectionProps) {
  const performanceMetrics = [
    { title: "Total Views", value: "89.4K", change: "+12.5%", trend: "up", icon: Eye },
    { title: "Engagement Rate", value: "8.2%", change: "+2.1%", trend: "up", icon: Heart },
    { title: "Comments", value: "2.1K", change: "-5.3%", trend: "down", icon: MessageSquare },
    { title: "Shares", value: "1.8K", change: "+18.7%", trend: "up", icon: Share2 },
  ]

  const topRecipes = [
    { name: "Chocolate Lava Cake", views: "12.3K", rating: 4.9, engagement: 92 },
    { name: "Spicy Thai Basil Chicken", views: "8.7K", rating: 4.8, engagement: 87 },
    { name: "Homemade Pasta Carbonara", views: "6.2K", rating: 4.7, engagement: 84 },
    { name: "Mediterranean Quinoa Bowl", views: "4.1K", rating: 4.6, engagement: 79 },
    { name: "Classic Beef Stroganoff", views: "3.8K", rating: 4.5, engagement: 76 },
  ]

  const audienceData = [
    { age: "18-24", percentage: 15, color: "bg-blue-500" },
    { age: "25-34", percentage: 35, color: "bg-green-500" },
    { age: "35-44", percentage: 28, color: "bg-yellow-500" },
    { age: "45-54", percentage: 15, color: "bg-orange-500" },
    { age: "55+", percentage: 7, color: "bg-red-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your recipe performance and audience engagement</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>{metric.change}</span>
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performing Recipes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Recipes</CardTitle>
            <CardDescription>Your most popular recipes this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRecipes.map((recipe, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{recipe.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {recipe.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {recipe.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{recipe.engagement}%</div>
                    <div className="text-xs text-muted-foreground">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
            <CardDescription>Age distribution of your followers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audienceData.map((data) => (
                <div key={data.age} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{data.age} years</span>
                    <span className="font-medium">{data.percentage}%</span>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>Premium features and monetization performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Premium Subscribers</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+23</span> this month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold">$3,742</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Avg. Revenue per User</p>
              <p className="text-2xl font-bold">$3.00</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+$0.15</span> from last month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Trending Analysis</CardTitle>
          <CardDescription>Popular recipe categories by season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-medium">Spring</h4>
              <div className="space-y-1">
                <Badge variant="outline">Fresh Salads</Badge>
                <Badge variant="outline">Light Soups</Badge>
                <Badge variant="outline">Grilled Vegetables</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Summer</h4>
              <div className="space-y-1">
                <Badge variant="outline">BBQ Recipes</Badge>
                <Badge variant="outline">Cold Desserts</Badge>
                <Badge variant="outline">Refreshing Drinks</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Fall</h4>
              <div className="space-y-1">
                <Badge variant="outline">Pumpkin Dishes</Badge>
                <Badge variant="outline">Warm Stews</Badge>
                <Badge variant="outline">Apple Desserts</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Winter</h4>
              <div className="space-y-1">
                <Badge variant="outline">Comfort Food</Badge>
                <Badge variant="outline">Hot Beverages</Badge>
                <Badge variant="outline">Holiday Treats</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
