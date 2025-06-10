"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Flag,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  MessageSquare,
  ImageIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for content reports
const contentReports = [
  {
    id: 1,
    type: "recipe",
    title: "Inappropriate Recipe Content",
    reportedContent: "Jollof Rice (Nigerian)",
    reportedBy: "Amara Okafor",
    reporterAvatar: "/placeholder.svg?height=32&width=32",
    reason: "Inappropriate content",
    description: "Recipe contains offensive language and inappropriate images",
    date: "2024-12-05",
    status: "pending",
    severity: "high",
    contentAuthor: "Chef Yemi Alade",
  },
  {
    id: 2,
    type: "comment",
    title: "Spam Comment",
    reportedContent: "Comment on Injera recipe",
    reportedBy: "Kwame Asante",
    reporterAvatar: "/placeholder.svg?height=32&width=32",
    reason: "Spam",
    description: "User posting promotional links in comments",
    date: "2024-12-04",
    status: "under_review",
    severity: "medium",
    contentAuthor: "User123",
  },
  {
    id: 3,
    type: "profile",
    title: "Fake Chef Profile",
    reportedContent: "Chef Profile: Chef Fake Name",
    reportedBy: "Fatima Al-Rashid",
    reporterAvatar: "/placeholder.svg?height=32&width=32",
    reason: "Impersonation",
    description: "User claiming to be a famous chef with stolen photos",
    date: "2024-12-03",
    status: "resolved",
    severity: "high",
    contentAuthor: "FakeChef2024",
  },
]

const reportStats = [
  { title: "Open Reports", value: "15", change: "+3 from yesterday", icon: Flag },
  { title: "Resolved Today", value: "8", change: "+2 from yesterday", icon: CheckCircle },
  { title: "High Priority", value: "4", change: "Same as yesterday", icon: AlertTriangle },
  { title: "Average Resolution", value: "2.3h", change: "-45min from last week", icon: Eye },
]

export function ContentReportsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredReports = contentReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesSeverity = severityFilter === "all" || report.severity === severityFilter
    const matchesType = typeFilter === "all" || report.type === typeFilter
    return matchesSearch && matchesStatus && matchesSeverity && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "recipe":
        return <ImageIcon className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "profile":
        return <Eye className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {reportStats.map((stat) => (
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

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports, content, users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="recipe">Recipe</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Reports</CardTitle>
          <CardDescription>Review and moderate reported content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-muted-foreground">{report.date}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.reporterAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {report.reportedBy
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{report.reportedBy}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.reportedContent}</div>
                      <div className="text-sm text-muted-foreground">by {report.contentAuthor}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.reason}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">{report.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.severity === "high"
                          ? "destructive"
                          : report.severity === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {report.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "resolved"
                          ? "default"
                          : report.status === "under_review"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {report.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Content
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact Reporter
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Take Action</DropdownMenuItem>
                          <DropdownMenuItem>Dismiss Report</DropdownMenuItem>
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
    </>
  )
}
