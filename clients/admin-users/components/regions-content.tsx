"use client"

import { useState } from "react"
import { Globe, MapPin, Users, ChefHat, Plus, Edit, Trash2, MoreHorizontal, Search, Filter } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock data for regions
const regions = [
  {
    id: 1,
    name: "Littoral",
    divisions: ["Wouri", "Moungo", "Nkam", "Sanaga-Maritime"],
    ethnicGroups: 12,
    recipes: 78,
    chefs: 34,
    description: "Coastal region known for seafood dishes and plantain-based recipes",
    status: "active",
  },
  {
    id: 2,
    name: "Centre",
    divisions: ["Mfoundi", "Nyong-et-Kéllé", "Lekié", "Mbam-et-Inoubou"],
    ethnicGroups: 15,
    recipes: 65,
    chefs: 28,
    description: "Home to the capital Yaoundé with diverse culinary traditions",
    status: "active",
  },
  {
    id: 3,
    name: "Northwest",
    divisions: ["Mezam", "Momo", "Bui", "Donga-Mantung"],
    ethnicGroups: 8,
    recipes: 52,
    chefs: 19,
    description: "Known for achu soup and other traditional dishes",
    status: "active",
  },
  {
    id: 4,
    name: "Southwest",
    divisions: ["Fako", "Meme", "Ndian", "Kupe-Manenguba"],
    ethnicGroups: 10,
    recipes: 61,
    chefs: 23,
    description: "Rich in seafood and forest ingredients like eru",
    status: "active",
  },
]

// Mock data for ethnic groups
const ethnicGroups = [
  {
    id: 1,
    name: "Bamiléké",
    region: "West",
    population: "3.2 million",
    recipes: 42,
    specialties: ["Nkui", "Kondre", "Achu"],
    description: "One of the largest ethnic groups in Cameroon",
    status: "verified",
  },
  {
    id: 2,
    name: "Duala",
    region: "Littoral",
    population: "1.5 million",
    recipes: 36,
    specialties: ["Ndolé", "Mbongo Tchobi", "Ekwang"],
    description: "Coastal people with rich seafood traditions",
    status: "verified",
  },
  {
    id: 3,
    name: "Beti",
    region: "Centre",
    population: "2 million",
    recipes: 28,
    specialties: ["Okok", "Kpwem", "Nnam Ngon"],
    description: "Forest people with unique vegetable dishes",
    status: "verified",
  },
]

const regionStats = [
  { title: "Total Regions", value: "10", change: "Complete coverage", icon: Globe },
  { title: "Ethnic Groups", value: "250+", change: "+5 this month", icon: Users },
  { title: "Regional Recipes", value: "420", change: "+25 this week", icon: ChefHat },
  { title: "Divisions", value: "58", change: "Full Cameroon coverage", icon: MapPin },
]

function AddRegionDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Region
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Region</DialogTitle>
          <DialogDescription>Create a new regional category for Cameroonian cuisine</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Region Name</Label>
            <Input id="name" placeholder="e.g., East" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="divisions">Divisions</Label>
            <Input id="divisions" placeholder="e.g., Haut-Nyong, Kadey, Lom-et-Djérem" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the culinary traditions..." />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Create Region</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddEthnicGroupDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Ethnic Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Ethnic Group</DialogTitle>
          <DialogDescription>Add a new ethnic cuisine category</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tribeName">Ethnic Group Name</Label>
            <Input id="tribeName" placeholder="e.g., Bakweri" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="region">Region</Label>
            <Input id="region" placeholder="e.g., Southwest" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="specialties">Culinary Specialties</Label>
            <Input id="specialties" placeholder="e.g., Kwacoco, Mbanga soup" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tribeDescription">Description</Label>
            <Textarea id="tribeDescription" placeholder="Describe the ethnic group's culinary traditions..." />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Add Ethnic Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function RegionsContent() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {regionStats.map((stat) => (
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

      <Tabs defaultValue="regions" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="ethnicGroups">Ethnic Groups</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="regions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Regional Categories</h3>
            <AddRegionDialog />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cameroon Regions</CardTitle>
              <CardDescription>Manage regional cuisine categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Divisions</TableHead>
                    <TableHead>Statistics</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div className="font-medium">{region.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {region.divisions.slice(0, 3).map((division) => (
                            <Badge key={division} variant="outline" className="text-xs">
                              {division}
                            </Badge>
                          ))}
                          {region.divisions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{region.divisions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{region.ethnicGroups} ethnic groups</div>
                          <div>{region.recipes} recipes</div>
                          <div>{region.chefs} chefs</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">{region.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{region.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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
                                <MapPin className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ChefHat className="mr-2 h-4 w-4" />
                                View Recipes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Region
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

        <TabsContent value="ethnicGroups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ethnic Cuisines</h3>
            <AddEthnicGroupDialog />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cameroonian Ethnic Groups</CardTitle>
              <CardDescription>Manage ethnic cuisine categories and traditions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ethnic Group</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Population</TableHead>
                    <TableHead>Recipes</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ethnicGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-muted-foreground">{group.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{group.region}</div>
                        </div>
                      </TableCell>
                      <TableCell>{group.population}</TableCell>
                      <TableCell>{group.recipes} recipes</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {group.specialties.slice(0, 2).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {group.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{group.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{group.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ChefHat className="mr-2 h-4 w-4" />
                                View Recipes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Ethnic Group
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
