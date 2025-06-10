"use client"

import { useState } from "react"
import { Star, Search, MoreHorizontal, Eye, Flag, Trash2, CheckCircle, XCircle, Calendar } from "lucide-react"

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

// Mock data for reviews
const reviews = [
  {
    id: 1,
    user: "Amara Okafor",
    userAvatar: "/placeholder.svg?height=32&width=32",
    recipe: "Jollof Rice (Nigerian)",
    chef: "Chef Yemi Alade",
    rating: 5,
    comment: "Absolutely delicious! The spices were perfectly balanced and the instructions were easy to follow.",
    date: "2024-12-05",
    status: "approved",
    helpful: 23,
    reported: false,
  },
  {
    id: 2,
    user: "Kwame Asante",
    userAvatar: "/placeholder.svg?height=32&width=32",
    recipe: "Injera (Ethiopian)",
    chef: "Chef Amina Hassan",
    rating: 4,
    comment: "Great recipe! Took a few tries to get the fermentation right, but worth it.",
    date: "2024-12-04",
    status: "pending",
    helpful: 12,
    reported: false,
  },
  {
    id: 3,
    user: "Fatima Al-Rashid",
    userAvatar: "/placeholder.svg?height=32&width=32",
    recipe: "Bobotie (South African)",
    chef: "Chef Sipho Ndlovu",
    rating: 2,
    comment: "This recipe is completely wrong and doesn't represent authentic Bobotie at all!",
    date: "2024-12-03",
    status: "flagged",
    helpful: 3,
    reported: true,
  },
  {
    id: 4,
    user: "Tendai Mukamuri",
    userAvatar: "/placeholder.svg?height=32&width=32",
    recipe: "Tagine (Moroccan)",
    chef: "Chef Amina Hassan",
    rating: 5,
    comment: "Perfect! My family loved this traditional recipe. Very authentic taste.",
    date: "2024-12-02",
    status: "approved",
    helpful: 45,
    reported: false,
  },
]

const reviewStats = [
  { title: "Total Reviews", value: "2,847", change: "+12% this month" },
  { title: "Average Rating", value: "4.6", change: "+0.2 from last month" },
  { title: "Pending Reviews", value: "23", change: "-5 from yesterday" },
  { title: "Flagged Reviews", value: "7", change: "+2 from yesterday" },
]

export function ReviewsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.recipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.chef.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    return matchesSearch && matchesStatus && matchesRating
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {reviewStats.map((stat) => (
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
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reviews, users, recipes..."
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>Manage user reviews and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Recipe</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Helpful</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {review.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.user}</div>
                        <div className="text-sm text-muted-foreground">{review.date}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.recipe}</div>
                      <div className="text-sm text-muted-foreground">by {review.chef}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{review.comment}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        review.status === "approved"
                          ? "default"
                          : review.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {review.status}
                    </Badge>
                    {review.reported && (
                      <Badge variant="outline" className="ml-1">
                        <Flag className="mr-1 h-3 w-3" />
                        Reported
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{review.helpful} helpful</span>
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
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" />
                            Flag as Inappropriate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Review
                          </DropdownMenuItem>
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
