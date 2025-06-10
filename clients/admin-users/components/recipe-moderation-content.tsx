"use client"

import { useState } from "react"
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Search,
  Calendar,
  ChefHat,
  MapPin,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data for pending recipes
const pendingRecipes = [
  {
    id: 1,
    title: "Authentic Mbongo Tchobi (Black Soup)",
    chef: "Chef Marie Ngo",
    chefAvatar: "/placeholder.svg?height=32&width=32",
    region: "Littoral",
    division: "Wouri",
    submittedDate: "2024-12-05",
    cookingTime: "1 hour 30 minutes",
    difficulty: "Medium",
    ingredients: 15,
    status: "pending",
    priority: "high",
    description: "Traditional Cameroonian black soup made with spices and fish or meat...",
  },
  {
    id: 2,
    title: "Poulet DG (Directeur Général Chicken)",
    chef: "Chef Paul Biya",
    chefAvatar: "/placeholder.svg?height=32&width=32",
    region: "Centre",
    division: "Mfoundi",
    submittedDate: "2024-12-04",
    cookingTime: "1 hour",
    difficulty: "Medium",
    ingredients: 12,
    status: "under_review",
    priority: "medium",
    description: "Popular Cameroonian dish with chicken, plantains, and vegetables...",
  },
  {
    id: 3,
    title: "Achu Soup with Yellow Soup",
    chef: "Chef Judith Fon",
    chefAvatar: "/placeholder.svg?height=32&width=32",
    region: "Northwest",
    division: "Mezam",
    submittedDate: "2024-12-03",
    cookingTime: "2 hours",
    difficulty: "Hard",
    ingredients: 18,
    status: "pending",
    priority: "low",
    description: "Traditional dish from the Northwest region made with cocoyam and yellow soup...",
  },
]

const moderationStats = [
  { title: "Pending Reviews", value: "23", change: "+5 from yesterday", icon: Clock },
  { title: "Approved Today", value: "12", change: "+3 from yesterday", icon: CheckCircle },
  { title: "Rejected Today", value: "2", change: "-1 from yesterday", icon: XCircle },
  { title: "Average Review Time", value: "2.5h", change: "-30min from last week", icon: Users },
]

function RecipeDetailsDialog({ recipe }: { recipe: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe.title}</DialogTitle>
          <DialogDescription>Recipe submitted by {recipe.chef}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Recipe Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Region:</span> {recipe.region}
                </div>
                <div>
                  <span className="font-medium">Division:</span> {recipe.division}
                </div>
                <div>
                  <span className="font-medium">Cooking Time:</span> {recipe.cookingTime}
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span> {recipe.difficulty}
                </div>
                <div>
                  <span className="font-medium">Ingredients:</span> {recipe.ingredients} items
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Chef Information</h4>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={recipe.chefAvatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {recipe.chef
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{recipe.chef}</div>
                  <div className="text-sm text-muted-foreground">Verified Chef</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{recipe.description}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recipe Image</h4>
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Recipe Image Preview</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Recipe
            </Button>
            <Button variant="outline" className="flex-1">
              Request Changes
            </Button>
            <Button variant="destructive" className="flex-1">
              <XCircle className="mr-2 h-4 w-4" />
              Reject Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function RecipeModerationContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")

  const filteredRecipes = pendingRecipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.chef.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || recipe.status === statusFilter
    const matchesRegion = regionFilter === "all" || recipe.region === regionFilter
    return matchesSearch && matchesStatus && matchesRegion
  })

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {moderationStats.map((stat) => (
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
            placeholder="Search recipes, chefs..."
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Recipes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Recipe Reviews</CardTitle>
          <CardDescription>Review and moderate recipe submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe</TableHead>
                <TableHead>Chef</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{recipe.title}</div>
                      <div className="text-sm text-muted-foreground">Submitted: {recipe.submittedDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={recipe.chefAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {recipe.chef
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{recipe.chef}</div>
                        <div className="text-sm text-muted-foreground">{recipe.division}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {recipe.region}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Time: {recipe.cookingTime}</div>
                      <div>Difficulty: {recipe.difficulty}</div>
                      <div>{recipe.ingredients} ingredients</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        recipe.status === "pending"
                          ? "secondary"
                          : recipe.status === "under_review"
                            ? "default"
                            : "outline"
                      }
                    >
                      {recipe.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        recipe.priority === "high"
                          ? "destructive"
                          : recipe.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {recipe.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <RecipeDetailsDialog recipe={recipe} />
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
                            <ChefHat className="mr-2 h-4 w-4" />
                            Contact Chef
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Recipe
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Request Changes</DropdownMenuItem>
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
