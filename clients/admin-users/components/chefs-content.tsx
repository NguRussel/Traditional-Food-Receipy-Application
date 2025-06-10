"use client"

import { useState } from "react"
import { Search, MoreHorizontal, CheckCircle, XCircle, Shield, Star, Filter } from "lucide-react"

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

// Mock data for chefs
const chefs = [
  {
    id: 1,
    name: "Chef Mireille Koumba",
    avatar: "/placeholder.svg?height=32&width=32",
    location: "Douala, Littoral",
    specialty: "Coastal Cuisine",
    verified: true,
    featured: true,
    rating: 4.9,
    recipes: 24,
    followers: 1250,
    status: "active",
  },
  {
    id: 2,
    name: "Chef Paul Nkeng",
    avatar: "/placeholder.svg?height=32&width=32",
    location: "Yaoundé, Centre",
    specialty: "Traditional Beti Cuisine",
    verified: true,
    featured: false,
    rating: 4.7,
    recipes: 18,
    followers: 980,
    status: "active",
  },
  {
    id: 3,
    name: "Chef Solange Mbida",
    avatar: "/placeholder.svg?height=32&width=32",
    location: "Bamenda, Northwest",
    specialty: "Grassfields Cuisine",
    verified: false,
    featured: false,
    rating: 4.5,
    recipes: 12,
    followers: 720,
    status: "pending",
  },
  {
    id: 4,
    name: "Chef Jean-Pierre Ekobe",
    avatar: "/placeholder.svg?height=32&width=32",
    location: "Buea, Southwest",
    specialty: "Fusion Cuisine",
    verified: true,
    featured: true,
    rating: 4.8,
    recipes: 32,
    followers: 1560,
    status: "active",
  },
  {
    id: 5,
    name: "Chef Yvette Ngo",
    avatar: "/placeholder.svg?height=32&width=32",
    location: "Bafoussam, West",
    specialty: "Bamiléké Cuisine",
    verified: true,
    featured: false,
    rating: 4.6,
    recipes: 21,
    followers: 1050,
    status: "active",
  },
  {
    id: 6,
    name: "Chef Emmanuel Tabi",
    avatar: "/placeholder.svg?height=32&width=32",
    location: "Limbe, Southwest",
    specialty: "Seafood",
    verified: false,
    featured: false,
    rating: 4.3,
    recipes: 9,
    followers: 480,
    status: "pending",
  },
  {
    id: 7,
    name: "Chef Carine Atangana",
    avatar: "/placeholder.svg?height=32&width=32",
    location: "Kribi, South",
    specialty: "Coastal Delicacies",
    verified: true,
    featured: false,
    rating: 4.7,
    recipes: 16,
    followers: 890,
    status: "active",
  },
]

const chefStats = [
  { title: "Total Chefs", value: "87", change: "+5 this month" },
  { title: "Verified Chefs", value: "64", change: "+3 this month" },
  { title: "Featured Chefs", value: "12", change: "No change" },
  { title: "Pending Verification", value: "8", change: "-2 this week" },
]

export function ChefsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")

  const filteredChefs = chefs.filter((chef) => {
    const matchesSearch =
      chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || chef.status === statusFilter
    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && chef.verified) ||
      (verificationFilter === "unverified" && !chef.verified)
    return matchesSearch && matchesStatus && matchesVerification
  })

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {chefStats.map((stat) => (
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
            placeholder="Search chefs..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Chefs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chefs</CardTitle>
          <CardDescription>Manage chef profiles and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chef</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Recipes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChefs.map((chef) => (
                <TableRow key={chef.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={chef.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {chef.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center">
                          {chef.name}
                          {chef.verified && <CheckCircle className="ml-1 h-4 w-4 text-blue-500" />}
                          {chef.featured && <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{chef.followers} followers</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{chef.location}</TableCell>
                  <TableCell>{chef.specialty}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{chef.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>{chef.recipes} recipes</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        chef.status === "active" ? "default" : chef.status === "pending" ? "secondary" : "destructive"
                      }
                    >
                      {chef.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        {!chef.verified ? (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify Chef
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <XCircle className="mr-2 h-4 w-4" />
                            Remove Verification
                          </DropdownMenuItem>
                        )}
                        {!chef.featured ? (
                          <DropdownMenuItem>
                            <Star className="mr-2 h-4 w-4" />
                            Feature Chef
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Star className="mr-2 h-4 w-4" />
                            Unfeature Chef
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Shield className="mr-2 h-4 w-4" />
                          Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
