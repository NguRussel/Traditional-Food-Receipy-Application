"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, Edit, Trash2, Eye, Star, Clock, MoreHorizontal, Upload, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface RecipeManagementSectionProps {
  activeTab: string
}

export function RecipeManagementSection({ activeTab }: RecipeManagementSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const recipes = [
    {
      id: 1,
      name: "Ndolé (Bitterleaf Stew)",
      category: "Stew",
      difficulty: "Medium",
      cookTime: "90 min",
      status: "Published",
      views: "2.3K",
      rating: 4.9,
      reviews: 127,
      lastUpdated: "2 days ago",
    },
    {
      id: 2,
      name: "Poulet DG (Chicken and Plantains)",
      category: "Main Course",
      difficulty: "Easy",
      cookTime: "60 min",
      status: "Published",
      views: "1.8K",
      rating: 4.7,
      reviews: 89,
      lastUpdated: "1 week ago",
    },
    {
      id: 3,
      name: "Koki (Black Eyed Pea Pudding)",
      category: "Pudding",
      difficulty: "Hard",
      cookTime: "120 min",
      status: "Published",
      views: "3.1K",
      rating: 4.8,
      reviews: 203,
      lastUpdated: "3 days ago",
    },
    {
      id: 4,
      name: "Eru (Okok with Waterfufu)",
      category: "Vegetable Stew",
      difficulty: "Medium",
      cookTime: "75 min",
      status: "Draft",
      views: "0",
      rating: 0,
      reviews: 0,
      lastUpdated: "1 day ago",
    },
  ]

  if (activeTab === "create-recipe") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create New Cameroonian Recipe</h2>
            <p className="text-muted-foreground">Share your Cameroonian culinary masterpiece with the world</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Save as Draft</Button>
            <Button>Publish Cameroonian Recipe</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cameroonian Recipe Details</CardTitle>
            <CardDescription>Basic information about your Cameroonian recipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipe-name">Cameroonian Recipe Name</Label>
                <Input id="recipe-name" placeholder="Enter Cameroonian recipe name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="main">Main Course</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="stew">Stew</SelectItem>
                    <SelectItem value="pudding">Pudding</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                <Input id="prep-time" type="number" placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                <Input id="cook-time" type="number" placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Cameroonian Recipe Description</Label>
              <Textarea id="description" placeholder="Describe your Cameroonian recipe..." className="min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label>Cameroonian Recipe Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drag and drop an image, or click to browse</p>
                <Button variant="outline" className="mt-2">
                  Choose File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cameroonian Ingredients</CardTitle>
            <CardDescription>List all ingredients needed for this Cameroonian recipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Ingredient name" className="flex-1" />
                <Input placeholder="Amount" className="w-24" />
                <Input placeholder="Unit" className="w-24" />
                <Button size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Ingredient name" className="flex-1" />
                <Input placeholder="Amount" className="w-24" />
                <Input placeholder="Unit" className="w-24" />
                <Button size="icon" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cameroonian Cooking Instructions</CardTitle>
            <CardDescription>Step-by-step Cameroonian cooking instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <Textarea placeholder="Describe the first step..." className="flex-1" />
                <Button size="icon" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <Textarea placeholder="Describe the next step..." className="flex-1" />
                <Button size="icon" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cameroonian Recipe Management</h2>
          <p className="text-muted-foreground">Manage all your Cameroonian recipes in one place</p>
        </div>
        <Button onClick={() => { /* TODO: Navigate to create-recipe or set activeTab */ }}>
          <Plus className="h-4 w-4 mr-2" />
          New Cameroonian Recipe
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Cameroonian recipes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="appetizer">Appetizer</SelectItem>
                <SelectItem value="main">Main Course</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
                <SelectItem value="stew">Stew</SelectItem>
                <SelectItem value="pudding">Pudding</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Cameroonian Recipes</CardTitle>
          <CardDescription>{recipes.length} Cameroonian recipes total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cameroonian Recipe</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Cook Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes
                .filter((recipe) =>
                  recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>
                      <div className="font-medium">{recipe.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{recipe.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          recipe.difficulty === "Easy"
                            ? "default"
                            : recipe.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {recipe.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.cookTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={recipe.status === "Published" ? "default" : "secondary"}>{recipe.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-3 w-3" />
                          {recipe.views}
                        </div>
                        {recipe.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {recipe.rating} ({recipe.reviews})
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{recipe.lastUpdated}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
    </div>
  )
}