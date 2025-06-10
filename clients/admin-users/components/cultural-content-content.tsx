"use client"

import { useState } from "react"
import {
  BookOpen,
  ImageIcon,
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Eye,
  CheckCircle,
  XCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for cultural content
const culturalStories = [
  {
    id: 1,
    title: "The History of Ndolé",
    type: "story",
    region: "Littoral",
    author: "Dr. Esther Ngo",
    authorAvatar: "/placeholder.svg?height=32&width=32",
    publishDate: "2024-12-01",
    status: "published",
    views: 2340,
    likes: 156,
    description: "Exploring the origins and cultural significance of Cameroon's national dish",
    tags: ["history", "ndole", "tradition"],
  },
  {
    id: 2,
    title: "Bamiléké Food Traditions",
    type: "tradition",
    region: "West",
    author: "Chef Jean Kamga",
    authorAvatar: "/placeholder.svg?height=32&width=32",
    publishDate: "2024-11-28",
    status: "published",
    views: 1890,
    likes: 203,
    description: "Traditional food preparation and cultural significance in Bamiléké culture",
    tags: ["bamileke", "tradition", "west"],
  },
  {
    id: 3,
    title: "Cooking with Palm Oil in Cameroon",
    type: "educational",
    region: "Southwest",
    author: "Chef Beatrice Etonde",
    authorAvatar: "/placeholder.svg?height=32&width=32",
    publishDate: "2024-11-25",
    status: "pending",
    views: 0,
    likes: 0,
    description: "Traditional cooking methods using palm oil in Cameroonian cuisine",
    tags: ["cooking", "palm oil", "techniques"],
  },
]

const culturalEvents = [
  {
    id: 1,
    name: "Ngondo Festival Food Showcase",
    type: "festival",
    region: "Littoral",
    date: "2024-12-15",
    status: "upcoming",
    participants: 45,
    recipes: 23,
    description: "Traditional recipes prepared during the annual Ngondo festival",
  },
  {
    id: 2,
    name: "Nyem-Nyem Cultural Food Fair",
    type: "cultural",
    region: "Adamawa",
    date: "2024-03-15",
    status: "completed",
    participants: 32,
    recipes: 28,
    description: "Showcasing the rich culinary heritage of the Adamawa region",
  },
]

const contentStats = [
  { title: "Published Stories", value: "56", change: "+8 this month", icon: BookOpen },
  { title: "Cultural Events", value: "12", change: "+2 this week", icon: Calendar },
  { title: "Total Views", value: "18.5K", change: "+15% this month", icon: ImageIcon },
  { title: "Pending Review", value: "8", change: "-2 from yesterday", icon: CheckCircle },
]

export function CulturalContentContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredStories = culturalStories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || story.status === statusFilter
    const matchesRegion = regionFilter === "all" || story.region === regionFilter
    const matchesType = typeFilter === "all" || story.type === typeFilter
    return matchesSearch && matchesStatus && matchesRegion && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "story":
        return <BookOpen className="h-4 w-4" />
      case "tradition":
        return <Users className="h-4 w-4" />
      case "educational":
        return <BookOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {contentStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon && <stat.icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="stories" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="stories">Cultural Stories</TabsTrigger>
            <TabsTrigger value="events">Cultural Events</TabsTrigger>
          </TabsList>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stories, authors..."
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
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[140px]">
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="tradition">Tradition</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cultural Stories</CardTitle>
              <CardDescription>Manage cultural stories and educational content</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(story.type)}
                          <div>
                            <div className="font-medium">{story.title}</div>
                            <div className="text-sm text-muted-foreground max-w-xs truncate">{story.description}</div>
                            <div className="text-xs text-muted-foreground">{story.publishDate}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={story.authorAvatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {story.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{story.author}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {story.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{story.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{story.views.toLocaleString()} views</div>
                          <div className="text-muted-foreground">{story.likes} likes</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            story.status === "published"
                              ? "default"
                              : story.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {story.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
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
                                Publish
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cultural Events</CardTitle>
              <CardDescription>Manage cultural events and celebrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Participation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {culturalEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.name}</div>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">{event.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {event.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {event.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.participants} participants</div>
                          <div className="text-muted-foreground">{event.recipes} recipes</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === "completed"
                              ? "default"
                              : event.status === "upcoming"
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
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                View Participants
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookOpen className="mr-2 h-4 w-4" />
                                View Recipes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Event
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
        </TabsContent>
      </Tabs>
    </>
  )
}
