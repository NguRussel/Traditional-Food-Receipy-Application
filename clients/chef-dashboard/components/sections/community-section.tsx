"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  MessageSquare,
  Users,
  Reply,
  Flag,
  Video,
  Bell,
  Send,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CommunitySectionProps {
  activeTab: string
}

export function CommunitySection({ activeTab }: CommunitySectionProps) {
  const [replyText, setReplyText] = useState("")

  const reviews = [
    {
      id: 1,
      user: "Sarah Johnson",
      avatar: "/placeholder.svg",
      recipe: "Chocolate Lava Cake",
      rating: 5,
      comment: "Absolutely amazing! The cake was perfect and my family loved it. Will definitely make this again.",
      date: "2 hours ago",
      helpful: 12,
      replied: false,
    },
    {
      id: 2,
      user: "Mike Chen",
      avatar: "/placeholder.svg",
      recipe: "Spicy Thai Basil Chicken",
      rating: 4,
      comment: "Great recipe! I added a bit more chili for extra heat. The flavors were incredible.",
      date: "5 hours ago",
      helpful: 8,
      replied: true,
    },
    {
      id: 3,
      user: "Emma Wilson",
      avatar: "/placeholder.svg",
      recipe: "Homemade Pasta Carbonara",
      rating: 5,
      comment: "This is now my go-to carbonara recipe. The instructions were clear and easy to follow.",
      date: "1 day ago",
      helpful: 15,
      replied: false,
    },
  ]

  const followers = [
    {
      id: 1,
      name: "Alex Rodriguez",
      avatar: "/placeholder.svg",
      followers: "2.3K",
      following: true,
      verified: false,
      joinDate: "Joined 2 months ago",
    },
    {
      id: 2,
      name: "Lisa Thompson",
      avatar: "/placeholder.svg",
      followers: "892",
      following: true,
      verified: true,
      joinDate: "Joined 6 months ago",
    },
    {
      id: 3,
      name: "David Kim",
      avatar: "/placeholder.svg",
      followers: "1.5K",
      following: false,
      verified: false,
      joinDate: "Joined 1 month ago",
    },
  ]

  if (activeTab === "reviews") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Reviews & Comments</h2>
            <p className="text-muted-foreground">Manage feedback from your community</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">Mark All Read</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest feedback on your recipes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {review.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.user}</p>
                          <p className="text-sm text-muted-foreground">
                            Reviewed <span className="font-medium">{review.recipe}</span> • {review.date}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Flag className="h-4 w-4 mr-2" />
                              Report
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Hide Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>

                      <p className="text-sm">{review.comment}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          {review.helpful} helpful
                        </button>
                        <button className="flex items-center gap-1 hover:text-foreground">
                          <Reply className="h-3 w-3" />
                          Reply
                        </button>
                        {review.replied && (
                          <Badge variant="secondary" className="text-xs">
                            Replied
                          </Badge>
                        )}
                      </div>

                      {!review.replied && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm">
                              <Send className="h-3 w-3 mr-1" />
                              Send Reply
                            </Button>
                            <Button size="sm" variant="outline">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeTab === "followers") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Followers</h2>
            <p className="text-muted-foreground">Manage your community of food enthusiasts</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search followers..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Send Update
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {followers.map((follower) => (
            <Card key={follower.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={follower.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {follower.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{follower.name}</p>
                      {follower.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{follower.followers} followers</p>
                    <p className="text-xs text-muted-foreground">{follower.joinDate}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant={follower.following ? "secondary" : "default"} className="flex-1">
                    <Users className="h-3 w-3 mr-1" />
                    {follower.following ? "Following" : "Follow Back"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Hub</h2>
          <p className="text-muted-foreground">Connect with your audience and build relationships</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews & Ratings
            </CardTitle>
            <CardDescription>Respond to user feedback and manage reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pending responses</span>
                <Badge variant="destructive">12</Badge>
              </div>
              <Button className="w-full">View Reviews</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Followers
            </CardTitle>
            <CardDescription>Manage your community of food enthusiasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total followers</span>
                <span className="font-medium">15.2K</span>
              </div>
              <Button className="w-full" variant="outline">
                View Followers
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Live Sessions
            </CardTitle>
            <CardDescription>Host live cooking demonstrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Next session</span>
                <span className="font-medium">Tomorrow 3PM</span>
              </div>
              <Button className="w-full" variant="outline">
                Manage Sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Send updates to your followers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unread notifications</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <Button className="w-full" variant="outline">
                View Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
            </CardTitle>
            <CardDescription>Moderate and respond to comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pending moderation</span>
                <Badge variant="destructive">3</Badge>
              </div>
              <Button className="w-full" variant="outline">
                Moderate Comments
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Reports
            </CardTitle>
            <CardDescription>Handle reported content and users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Open reports</span>
                <Badge variant="destructive">2</Badge>
              </div>
              <Button className="w-full" variant="outline">
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
