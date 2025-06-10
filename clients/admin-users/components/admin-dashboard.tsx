"use client"
import {
  BarChart3,
  Bell,
  ChefHat,
  FileText,
  Flag,
  Globe,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Users,
  LogOut,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  UserCheck,
  BookOpen,
  MapPin,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Navigation items
const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: Home, url: "#", isActive: true },
      { title: "Analytics", icon: BarChart3, url: "#" },
      { title: "Reports", icon: FileText, url: "#" },
    ],
  },
  {
    title: "User Management",
    items: [
      { title: "All Users", icon: Users, url: "#" },
      { title: "Chefs", icon: ChefHat, url: "#" },
      { title: "Admins", icon: Shield, url: "#" },
    ],
  },
  {
    title: "Content",
    items: [
      { title: "Recipe Moderation", icon: BookOpen, url: "#" },
      { title: "Content Reports", icon: Flag, url: "#" },
      { title: "Reviews", icon: MessageSquare, url: "#" },
    ],
  },
  {
    title: "Regional",
    items: [
      { title: "Regions & Tribes", icon: Globe, url: "#" },
      { title: "Cultural Content", icon: MapPin, url: "#" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", icon: Settings, url: "#" },
      { title: "Security", icon: Shield, url: "#" },
    ],
  },
]

// Mock data
const todaysMetrics = [
  {
    title: "Total Users",
    value: "12.5K",
    change: "+15% from yesterday",
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "Active Chefs",
    value: "1,247",
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
  { rank: "01", name: "Jollof Rice (Nigerian)", popularity: 85, approvals: "94%" },
  { rank: "02", name: "Injera (Ethiopian)", popularity: 72, approvals: "89%" },
  { rank: "03", name: "Bobotie (South African)", popularity: 68, approvals: "92%" },
  { rank: "04", name: "Tagine (Moroccan)", popularity: 61, approvals: "87%" },
  { rank: "05", name: "Fufu (Ghanaian)", popularity: 58, approvals: "91%" },
]

const pendingModerations = [
  {
    id: 1,
    recipe: "Kenyan Ugali with Sukuma Wiki",
    chef: "Chef Amina K.",
    region: "East Africa",
    submitted: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    recipe: "Senegalese Thieboudienne",
    chef: "Chef Ousmane D.",
    region: "West Africa",
    submitted: "4 hours ago",
    status: "pending",
  },
  {
    id: 3,
    recipe: "Zimbabwean Sadza",
    chef: "Chef Tendai M.",
    region: "Southern Africa",
    submitted: "6 hours ago",
    status: "pending",
  },
]

const recentActivities = [
  {
    action: "Recipe approved",
    details: "Moroccan Couscous by Chef Fatima",
    time: "5 minutes ago",
    type: "approval",
  },
  {
    action: "Chef verified",
    details: "Chef Kwame from Ghana",
    time: "15 minutes ago",
    type: "verification",
  },
  {
    action: "Content flagged",
    details: "Inappropriate comment on Jollof Rice recipe",
    time: "1 hour ago",
    type: "flag",
  },
  {
    action: "New user registered",
    details: "User from Lagos, Nigeria",
    time: "2 hours ago",
    type: "user",
  },
]

function AppSidebar() {
  return (
    <Sidebar variant="inset" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">AFRI-Plates</span>
            <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span>Admin User</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AdminDashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search users, recipes, reports..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with AFRI-Plates today.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Last 7 days
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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

          <div className="grid gap-4 md:grid-cols-2">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
