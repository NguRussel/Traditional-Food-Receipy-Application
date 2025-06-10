"use client"

import {
  Users,
  ChefHat,
  BookOpen,
  Flag,
  Calendar,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  AlertTriangle,
  UserCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

// Mock data
const todaysMetrics = [
  {
    title: "Total Users",
    value: "5.2K",
    change: "+15% from yesterday",
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "Active Chefs",
    value: "347",
    change: "+8% from yesterday",
    icon: ChefHat,
    color: "text-green-500",
  },
  {
    title: "Recipes Pending",
    value: "23",
    change: "-12% from yesterday",
    icon: BookOpen,
    color: "text-orange-500",
  },
  {
    title: "New Reports",
    value: "7",
    change: "+3% from yesterday",
    icon: Flag,
    color: "text-red-500",
  },
]

const topRecipes = [
  { rank: "01", name: "Ndolé (Littoral)", popularity: 85, approvals: "94%" },
  { rank: "02", name: "Poulet DG (Littoral)", popularity: 72, approvals: "89%" },
  { rank: "03", name: "Achu Soup (Northwest)", popularity: 68, approvals: "92%" },
  { rank: "04", name: "Koki Beans (Southwest)", popularity: 61, approvals: "87%" },
  { rank: "05", name: "Eru (Southwest)", popularity: 58, approvals: "91%" },
]

const pendingModerations = [
  {
    id: 1,
    recipe: "Mbongo Tchobi (Fish in Black Sauce)",
    chef: "Chef Diane M.",
    region: "Littoral",
    submitted: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    recipe: "Kati Kati (Grilled Chicken)",
    chef: "Chef Paul N.",
    region: "Centre",
    submitted: "4 hours ago",
    status: "pending",
  },
  {
    id: 3,
    recipe: "Ekwang (Cocoyam Leaf Wraps)",
    chef: "Chef Marie T.",
    region: "Southwest",
    submitted: "6 hours ago",
    status: "pending",
  },
]

const recentActivities = [
  {
    action: "Recipe approved",
    details: "Pepper Soup by Chef Emmanuel",
    time: "5 minutes ago",
    type: "approval",
  },
  {
    action: "Chef verified",
    details: "Chef Solange from Douala",
    time: "15 minutes ago",
    type: "verification",
  },
  {
    action: "Content flagged",
    details: "Inappropriate comment on Ndolé recipe",
    time: "1 hour ago",
    type: "flag",
  },
  {
    action: "New user registered",
    details: "User from Yaoundé, Centre",
    time: "2 hours ago",
    type: "user",
  },
]

const visitorData = [
  { name: "Jan", visitors: 200 },
  { name: "Feb", visitors: 250 },
  { name: "Mar", visitors: 180 },
  { name: "Apr", visitors: 320 },
  { name: "May", visitors: 280 },
  { name: "Jun", visitors: 450 },
  { name: "Jul", visitors: 380 },
  { name: "Aug", visitors: 420 },
  { name: "Sep", visitors: 520 },
  { name: "Oct", visitors: 480 },
  { name: "Nov", visitors: 560 },
  { name: "Dec", visitors: 600 },
]

const userEngagementData = [
  { name: "Jan", recipes: 65, reviews: 40 },
  { name: "Feb", recipes: 78, reviews: 52 },
  { name: "Mar", recipes: 90, reviews: 60 },
  { name: "Apr", recipes: 81, reviews: 70 },
  { name: "May", recipes: 95, reviews: 80 },
  { name: "Jun", recipes: 110, reviews: 90 },
  { name: "Jul", recipes: 120, reviews: 100 },
]

export function DashboardContent() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-2">
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Last 7 days
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {todaysMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        {/* Top Recipes */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Recipes</CardTitle>
            <CardDescription>Most popular recipes by region</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Recipe Name</TableHead>
                  <TableHead>Popularity</TableHead>
                  <TableHead>Approval Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRecipes.map((recipe) => (
                  <TableRow key={recipe.rank}>
                    <TableCell className="font-medium">{recipe.rank}</TableCell>
                    <TableCell>{recipe.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={recipe.popularity} className="w-[60px]" />
                        <span className="text-sm text-muted-foreground">{recipe.popularity}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{recipe.approvals}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Server Uptime</span>
                <span className="font-medium">99.9%</span>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Response Time</span>
                <span className="font-medium">120ms</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Database Performance</span>
                <span className="font-medium">Optimal</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage Usage</span>
                <span className="font-medium">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Visitor Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Insights</CardTitle>
            <CardDescription>Platform traffic over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  visitors: {
                    label: "Visitors",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitorData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="var(--color-visitors)"
                      fillOpacity={1}
                      fill="url(#colorVisitors)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Recipe creation and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  recipes: {
                    label: "Recipes",
                    color: "hsl(var(--chart-1))",
                  },
                  reviews: {
                    label: "Reviews",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="recipes" stroke="var(--color-recipes)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="reviews" stroke="var(--color-reviews)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Pending Moderations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Moderations</CardTitle>
              <CardDescription>Recipes awaiting approval</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingModerations.map((item) => (
                <div key={item.id} className="flex items-center justify-between space-x-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.recipe}</p>
                    <p className="text-sm text-muted-foreground">
                      by {item.chef} • {item.region}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.submitted}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest admin actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {activity.type === "approval" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === "verification" && <UserCheck className="h-4 w-4 text-blue-500" />}
                    {activity.type === "flag" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    {activity.type === "user" && <Users className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
