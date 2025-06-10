"use client"

import { useState } from "react"
import { Search, Download, Filter, Calendar } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mock data for reports
const reports = [
  {
    id: "REP-2024-001",
    title: "Monthly User Growth",
    category: "User Analytics",
    date: "2024-06-01",
    status: "completed",
    region: "All Regions",
  },
  {
    id: "REP-2024-002",
    title: "Popular Recipes - Littoral Region",
    category: "Content Analytics",
    date: "2024-06-02",
    status: "completed",
    region: "Littoral",
  },
  {
    id: "REP-2024-003",
    title: "Chef Performance Q2",
    category: "User Analytics",
    date: "2024-06-03",
    status: "pending",
    region: "All Regions",
  },
  {
    id: "REP-2024-004",
    title: "Content Engagement - Centre Region",
    category: "Content Analytics",
    date: "2024-06-04",
    status: "completed",
    region: "Centre",
  },
  {
    id: "REP-2024-005",
    title: "Recipe Rating Analysis",
    category: "Content Analytics",
    date: "2024-06-05",
    status: "processing",
    region: "All Regions",
  },
  {
    id: "REP-2024-006",
    title: "User Retention Report",
    category: "User Analytics",
    date: "2024-06-06",
    status: "completed",
    region: "All Regions",
  },
  {
    id: "REP-2024-007",
    title: "Popular Recipes - Northwest Region",
    category: "Content Analytics",
    date: "2024-06-07",
    status: "completed",
    region: "Northwest",
  },
]

const reportStats = [
  { title: "Total Reports", value: "124", change: "+8 this month" },
  { title: "Generated Today", value: "7", change: "+2 from yesterday" },
  { title: "Scheduled Reports", value: "12", change: "Next: Tomorrow" },
  { title: "Custom Reports", value: "35", change: "+3 this month" },
]

export function ReportsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter
    const matchesRegion = regionFilter === "all" || report.region === regionFilter
    return matchesSearch && matchesCategory && matchesRegion
  })

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {reportStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="User Analytics">User Analytics</SelectItem>
            <SelectItem value="Content Analytics">Content Analytics</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="Littoral">Littoral</SelectItem>
            <SelectItem value="Centre">Centre</SelectItem>
            <SelectItem value="Northwest">Northwest</SelectItem>
            <SelectItem value="Southwest">Southwest</SelectItem>
            <SelectItem value="West">West</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reports</CardTitle>
            <CardDescription>View and download system reports</CardDescription>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>{report.region}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "completed"
                          ? "default"
                          : report.status === "processing"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
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
