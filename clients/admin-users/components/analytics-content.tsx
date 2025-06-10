"use client"

import { Calendar, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data
const userGrowthData = [
  { month: "Jan", users: 1200, chefs: 120 },
  { month: "Feb", users: 1900, chefs: 150 },
  { month: "Mar", users: 2400, chefs: 180 },
  { month: "Apr", users: 3100, chefs: 210 },
  { month: "May", users: 3800, chefs: 250 },
  { month: "Jun", users: 4500, chefs: 290 },
  { month: "Jul", users: 5200, chefs: 340 },
  { month: "Aug", users: 6100, chefs: 390 },
  { month: "Sep", users: 7000, chefs: 450 },
  { month: "Oct", users: 7800, chefs: 510 },
  { month: "Nov", users: 8500, chefs: 580 },
  { month: "Dec", users: 9200, chefs: 650 },
]

const recipeEngagementData = [
  { category: "West African", views: 4500, likes: 2800, shares: 1200 },
  { category: "East African", views: 3800, likes: 2200, shares: 950 },
  { category: "North African", views: 3200, likes: 1900, shares: 820 },
  { category: "Southern African", views: 2900, likes: 1700, shares: 740 },
  { category: "Central African", views: 2100, likes: 1300, shares: 580 },
]

const userDemographicsData = [
  { name: "Nigeria", value: 35 },
  { name: "Kenya", value: 20 },
  { name: "South Africa", value: 18 },
  { name: "Ghana", value: 12 },
  { name: "Ethiopia", value: 8 },
  { name: "Other", value: 7 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const deviceUsageData = [
  { name: "Mobile", value: 68 },
  { name: "Desktop", value: 24 },
  { name: "Tablet", value: 8 },
]

const DEVICE_COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

export function AnalyticsContent() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Last 12 months
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="regional">Regional Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly growth of users and chefs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    width={500}
                    height={300}
                    data={userGrowthData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="chefs" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Recipe Engagement Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Engagement</CardTitle>
              <CardDescription>Views, likes, and shares by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={recipeEngagementData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" />
                    <Bar dataKey="likes" fill="#82ca9d" />
                    <Bar dataKey="shares" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* User Demographics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>User distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDemographicsData}
                      cx={150}
                      cy={120}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userDemographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Device Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Device Usage</CardTitle>
              <CardDescription>Usage distribution by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceUsageData}
                      cx={150}
                      cy={120}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
