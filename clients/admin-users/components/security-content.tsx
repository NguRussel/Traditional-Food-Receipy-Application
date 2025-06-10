"use client"

import { useState } from "react"
import {
  Shield,
  AlertTriangle,
  Lock,
  Key,
  Eye,
  MoreHorizontal,
  Search,
  Calendar,
  Activity,
  Users,
  Globe,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for security events
const securityEvents = [
  {
    id: 1,
    type: "failed_login",
    user: "admin@afriplates.com",
    ip: "192.168.1.100",
    location: "Lagos, Nigeria",
    timestamp: "2024-12-06 14:30:25",
    severity: "medium",
    status: "resolved",
    description: "Multiple failed login attempts",
  },
  {
    id: 2,
    type: "suspicious_activity",
    user: "chef.yemi@email.com",
    ip: "10.0.0.45",
    location: "Accra, Ghana",
    timestamp: "2024-12-06 13:15:10",
    severity: "high",
    status: "investigating",
    description: "Unusual recipe upload pattern detected",
  },
  {
    id: 3,
    type: "password_change",
    user: "user123@email.com",
    ip: "172.16.0.20",
    location: "Cairo, Egypt",
    timestamp: "2024-12-06 12:45:33",
    severity: "low",
    status: "normal",
    description: "Password changed successfully",
  },
]

const apiKeys = [
  {
    id: 1,
    name: "Mobile App API",
    key: "ak_live_••••••••••••••••",
    created: "2024-01-15",
    lastUsed: "2024-12-06",
    permissions: ["read", "write"],
    status: "active",
  },
  {
    id: 2,
    name: "Analytics Service",
    key: "ak_live_••••••••••••••••",
    created: "2024-03-20",
    lastUsed: "2024-12-05",
    permissions: ["read"],
    status: "active",
  },
  {
    id: 3,
    name: "Backup Service",
    key: "ak_live_••••••••••••••••",
    created: "2024-02-10",
    lastUsed: "2024-11-30",
    permissions: ["read"],
    status: "inactive",
  },
]

const securityStats = [
  { title: "Security Events", value: "23", change: "+5 from yesterday", icon: Shield },
  { title: "Failed Logins", value: "12", change: "-3 from yesterday", icon: Lock },
  { title: "Active Sessions", value: "156", change: "+12 from yesterday", icon: Users },
  { title: "API Requests", value: "2.4K", change: "+8% from yesterday", icon: Activity },
]

export function SecurityContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredEvents = securityEvents.filter((event) => {
    const matchesSearch =
      event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "failed_login":
        return <Lock className="h-4 w-4" />
      case "suspicious_activity":
        return <AlertTriangle className="h-4 w-4" />
      case "password_change":
        return <Key className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {securityStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events, users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Monitor and investigate security events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <div>
                            <div className="font-medium">{event.type.replace("_", " ")}</div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.user}</div>
                          <div className="text-sm text-muted-foreground">{event.ip}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {event.location}
                        </div>
                      </TableCell>
                      <TableCell>{event.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(event.severity) as any}>{event.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === "resolved"
                              ? "default"
                              : event.status === "investigating"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Activity className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Block IP
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">API Key Management</h3>
            <Button>
              <Key className="mr-2 h-4 w-4" />
              Generate New Key
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys and access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{apiKey.key}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{apiKey.created}</TableCell>
                      <TableCell>{apiKey.lastUsed}</TableCell>
                      <TableCell>
                        <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>{apiKey.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Key className="mr-2 h-4 w-4" />
                                Regenerate Key
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Revoke Key</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Monitor active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Active sessions monitoring will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
