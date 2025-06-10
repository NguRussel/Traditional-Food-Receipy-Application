"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Download,
  Upload,
  Mail,
  Ban,
  UserX,
  Edit,
  Trash2,
  Star,
  Award,
  TrendingUp,
  Activity,
  Users,
  UserCheck,
  Shield,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Mock data for users - Updated with Cameroon-specific data
const allUsers = [
  {
    id: 1,
    name: "Amina Ngozi",
    email: "amina.ngozi@email.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "User",
    status: "Active",
    location: "Douala, Cameroon",
    joinDate: "2024-01-15",
    lastActive: "2 hours ago",
    recipesLiked: 45,
    recipesShared: 12,
    verified: true,
  },
  {
    id: 2,
    name: "Jean-Baptiste Mballa",
    email: "jb.mballa@email.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "User",
    status: "Active",
    location: "Yaoundé, Cameroon",
    joinDate: "2024-02-03",
    lastActive: "1 day ago",
    recipesLiked: 23,
    recipesShared: 8,
    verified: false,
  },
  {
    id: 3,
    name: "Marie-Claire Fouda",
    email: "mc.fouda@email.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "User",
    status: "Suspended",
    location: "Bamenda, Cameroon",
    joinDate: "2023-11-20",
    lastActive: "1 week ago",
    recipesLiked: 67,
    recipesShared: 3,
    verified: true,
  },
  {
    id: 4,
    name: "Paul Biya Nkomo",
    email: "paul.nkomo@email.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "User",
    status: "Active",
    location: "Garoua, Cameroon",
    joinDate: "2024-01-28",
    lastActive: "5 minutes ago",
    recipesLiked: 89,
    recipesShared: 15,
    verified: true,
  },
]

const chefs = [
  {
    id: 1,
    name: "Chef Mama Ngozi",
    email: "mama.ngozi@chef.com",
    avatar: "/placeholder.svg?height=32&width=32",
    speciality: "Bamiléké Cuisine",
    status: "Verified",
    location: "Douala, Cameroon",
    joinDate: "2023-08-15",
    lastActive: "30 minutes ago",
    recipesPublished: 45,
    followers: 2340,
    rating: 4.8,
    verificationDate: "2023-08-20",
    earnings: "150,000 FCFA",
  },
  {
    id: 2,
    name: "Chef Pierre Essomba",
    email: "pierre.essomba@chef.com",
    avatar: "/placeholder.svg?height=32&width=32",
    speciality: "Coastal Cuisine",
    status: "Pending",
    location: "Kribi, Cameroon",
    joinDate: "2024-01-10",
    lastActive: "2 hours ago",
    recipesPublished: 12,
    followers: 456,
    rating: 4.5,
    verificationDate: null,
    earnings: "45,000 FCFA",
  },
  {
    id: 3,
    name: "Chef Fatima Alhadji",
    email: "fatima.alhadji@chef.com",
    avatar: "/placeholder.svg?height=32&width=32",
    speciality: "Northern Cuisine",
    status: "Verified",
    location: "Maroua, Cameroon",
    joinDate: "2023-06-22",
    lastActive: "1 hour ago",
    recipesPublished: 67,
    followers: 5670,
    rating: 4.9,
    verificationDate: "2023-07-01",
    earnings: "320,000 FCFA",
  },
  {
    id: 4,
    name: "Chef Emmanuel Beti",
    email: "emmanuel.beti@chef.com",
    avatar: "/placeholder.svg?height=32&width=32",
    speciality: "Central Region Cuisine",
    status: "Under Review",
    location: "Yaoundé, Cameroon",
    joinDate: "2024-02-05",
    lastActive: "4 hours ago",
    recipesPublished: 8,
    followers: 234,
    rating: 4.2,
    verificationDate: null,
    earnings: "25,000 FCFA",
  },
]

const admins = [
  {
    id: 1,
    name: "Sarah Mbongo",
    email: "sarah.mbongo@cameroonplates.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Super Admin",
    status: "Active",
    location: "Yaoundé, Cameroon",
    joinDate: "2023-01-01",
    lastActive: "5 minutes ago",
    permissions: ["All Access"],
    lastLogin: "2024-12-06 14:30",
  },
  {
    id: 2,
    name: "Michel Atangana",
    email: "michel.atangana@cameroonplates.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Content Moderator",
    status: "Active",
    location: "Douala, Cameroon",
    joinDate: "2023-03-15",
    lastActive: "1 hour ago",
    permissions: ["Content Management", "User Moderation"],
    lastLogin: "2024-12-06 13:15",
  },
  {
    id: 3,
    name: "Aisha Bello",
    email: "aisha.bello@cameroonplates.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Regional Manager",
    status: "Active",
    location: "Bamenda, Cameroon",
    joinDate: "2023-05-20",
    lastActive: "30 minutes ago",
    permissions: ["Regional Content", "Cultural Verification"],
    lastLogin: "2024-12-06 14:00",
  },
]

function UserDetailsDialog({ user, type }: { user: any; type: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Detailed information about {user.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge
                variant={user.status === "Active" ? "default" : user.status === "Verified" ? "default" : "secondary"}
              >
                {user.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <p className="text-sm text-muted-foreground">{user.location}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Join Date</Label>
              <p className="text-sm text-muted-foreground">{user.joinDate}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Active</Label>
              <p className="text-sm text-muted-foreground">{user.lastActive}</p>
            </div>
            {type === "chef" && (
              <div>
                <Label className="text-sm font-medium">Speciality</Label>
                <p className="text-sm text-muted-foreground">{user.speciality}</p>
              </div>
            )}
          </div>

          {type === "user" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Recipes Liked</Label>
                <p className="text-sm text-muted-foreground">{user.recipesLiked}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Recipes Shared</Label>
                <p className="text-sm text-muted-foreground">{user.recipesShared}</p>
              </div>
            </div>
          )}

          {type === "chef" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Recipes Published</Label>
                <p className="text-sm text-muted-foreground">{user.recipesPublished}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Followers</Label>
                <p className="text-sm text-muted-foreground">{user.followers.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Rating</Label>
                <p className="text-sm text-muted-foreground">{user.rating}/5.0</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            {user.status !== "Suspended" && (
              <Button variant="outline" size="sm" className="text-red-500">
                <Ban className="mr-2 h-4 w-4" />
                Suspend User
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function UserManagement() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("users")

  const handleSelectAll = (checked: boolean, userList: any[]) => {
    if (checked) {
      setSelectedUsers(userList.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredChefs = chefs.filter((chef) => {
    const matchesSearch =
      chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || chef.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, chefs, and administrators across the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button size="sm">
            <Users className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, chefs, admins..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="users">All Users ({allUsers.length})</TabsTrigger>
          <TabsTrigger value="chefs">Chefs ({chefs.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="mb-4">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-sm font-medium">
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Verify
                </Button>
                <Button variant="outline" size="sm" className="text-red-500">
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
                <Button variant="outline" size="sm" className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all registered users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, filteredUsers)}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.location}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                        {user.verified && (
                          <Badge variant="outline" className="ml-1">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Joined: {user.joinDate}</div>
                          <div className="text-muted-foreground">Last: {user.lastActive}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{user.recipesLiked} likes</div>
                          <div className="text-muted-foreground">{user.recipesShared} shared</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UserDetailsDialog user={user} type="user" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="mr-2 h-4 w-4" />
                                View Activity
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend User
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

        <TabsContent value="chefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chef Management</CardTitle>
              <CardDescription>Manage chef profiles, verification status, and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedUsers.length === filteredChefs.length && filteredChefs.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, filteredChefs)}
                      />
                    </TableHead>
                    <TableHead>Chef</TableHead>
                    <TableHead>Speciality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChefs.map((chef) => (
                    <TableRow key={chef.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(chef.id)}
                          onCheckedChange={(checked) => handleSelectUser(chef.id, checked as boolean)}
                        />
                      </TableCell>
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
                            <div className="font-medium">{chef.name}</div>
                            <div className="text-sm text-muted-foreground">{chef.email}</div>
                            <div className="text-sm text-muted-foreground">{chef.location}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{chef.speciality}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            chef.status === "Verified" ? "default" : chef.status === "Pending" ? "secondary" : "outline"
                          }
                        >
                          {chef.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {chef.rating}
                          </div>
                          <div className="text-muted-foreground">{chef.recipesPublished} recipes</div>
                          <div className="text-muted-foreground">{chef.followers.toLocaleString()} followers</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{chef.earnings}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UserDetailsDialog user={chef} type="chef" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify Chef
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Award className="mr-2 h-4 w-4" />
                                Feature Chef
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend Chef
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

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Administrator Management</CardTitle>
              <CardDescription>Manage admin users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrator</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={admin.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {admin.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-sm text-muted-foreground">{admin.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.role === "Super Admin" ? "default" : "secondary"}>{admin.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{admin.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{admin.lastLogin}</div>
                          <div className="text-muted-foreground">Active: {admin.lastActive}</div>
                        </div>
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
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Security Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="mr-2 h-4 w-4" />
                                View Activity Log
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Revoke Access
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
    </div>
  )
}
