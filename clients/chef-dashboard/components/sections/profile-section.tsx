"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Award,
  Upload,
  Save,
  Edit,
  Eye,
  Globe,
  Star,
  Shield,
  CheckCircle,
  Camera,
  MapPin,
  Link,
  Calendar,
  ChefHat,
  Users,
  Heart,
  TrendingUp,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface ProfileSectionProps {
  activeTab: string
}

export function ProfileSection({ activeTab }: ProfileSectionProps) {
  const [profileData, setProfileData] = useState({
    name: "Chef Julia Martinez",
    bio: "Passionate chef specializing in Mediterranean and fusion cuisine. 15+ years of culinary experience creating memorable dining experiences.",
    location: "San Francisco, CA",
    website: "www.chefjulia.com",
    specialties: ["Mediterranean", "Fusion", "Vegetarian"],
    experience: "15+ years",
  })

  if (activeTab === "verification") {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Chef Verification</h1>
              <p className="text-lg text-gray-600">Verify your culinary credentials and expertise</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">Verified Chef</span>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -translate-y-32 translate-x-32"></div>
        </div>

        {/* Verification Progress */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Verification Status</CardTitle>
                <CardDescription className="text-base">Your current verification progress</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Overall Progress</span>
                <span className="text-2xl font-bold text-green-600">100%</span>
              </div>
              <div className="relative">
                <Progress value={100} className="h-3 bg-gray-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Profile Information", icon: User, status: "Complete", color: "green" },
                { title: "Culinary Credentials", icon: Award, status: "Verified", color: "blue" },
                { title: "Portfolio Showcase", icon: Star, status: "Approved", color: "purple" },
                { title: "Identity Verification", icon: Shield, status: "Verified", color: "green" },
                { title: "Social Media Links", icon: Globe, status: "Connected", color: "blue" },
                { title: "Background Check", icon: CheckCircle, status: "Passed", color: "green" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.color === "green"
                          ? "bg-green-100"
                          : item.color === "blue"
                            ? "bg-blue-100"
                            : "bg-purple-100"
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 ${
                          item.color === "green"
                            ? "text-green-600"
                            : item.color === "blue"
                              ? "text-blue-600"
                              : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <Badge
                        variant="default"
                        className={`mt-2 ${
                          item.color === "green"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : item.color === "blue"
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-100"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-600" />
                Verification Benefits
              </CardTitle>
              <CardDescription>What you get with chef verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    icon: Award,
                    title: "Verified Badge",
                    desc: "Display your verified status to build trust",
                    color: "yellow",
                  },
                  { icon: Star, title: "Priority Ranking", desc: "Higher visibility in search results", color: "blue" },
                  {
                    icon: Shield,
                    title: "Enhanced Security",
                    desc: "Additional account protection features",
                    color: "green",
                  },
                  {
                    icon: Globe,
                    title: "Global Recognition",
                    desc: "Recognized across our platform network",
                    color: "purple",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        benefit.color === "yellow"
                          ? "bg-yellow-100"
                          : benefit.color === "blue"
                            ? "bg-blue-100"
                            : benefit.color === "green"
                              ? "bg-green-100"
                              : "bg-purple-100"
                      }`}
                    >
                      <benefit.icon
                        className={`h-5 w-5 ${
                          benefit.color === "yellow"
                            ? "text-yellow-600"
                            : benefit.color === "blue"
                              ? "text-blue-600"
                              : benefit.color === "green"
                                ? "text-green-600"
                                : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>Your verification documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Culinary Arts Degree", icon: Award, color: "blue", date: "3 months ago" },
                  { title: "Professional License", icon: Shield, color: "green", date: "3 months ago" },
                  { title: "Government ID", icon: User, color: "purple", date: "3 months ago" },
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          doc.color === "blue"
                            ? "bg-blue-100"
                            : doc.color === "green"
                              ? "bg-green-100"
                              : "bg-purple-100"
                        }`}
                      >
                        <doc.icon
                          className={`h-6 w-6 ${
                            doc.color === "blue"
                              ? "text-blue-600"
                              : doc.color === "green"
                                ? "text-green-600"
                                : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">Uploaded {doc.date}</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                      Verified
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (activeTab === "portfolio") {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Showcase</h1>
              <p className="text-lg text-gray-600">Showcase your best culinary creations</p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Upload className="h-5 w-5 mr-2" />
              Add to Portfolio
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-32 translate-x-32"></div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card
              key={i}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt={`Portfolio item ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-3">
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {i < 3 && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      ⭐ Featured
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Signature Dish {i + 1}</h3>
                <p className="text-gray-600 mb-4">Mediterranean fusion with seasonal ingredients and aromatic herbs</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">4.9</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">2.3K</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Mediterranean
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="relative z-10">
          <div className="flex items-start gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl font-bold">JM</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 bg-white shadow-lg">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h1>
                <p className="text-lg text-gray-600 leading-relaxed">{profileData.bio}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  <span className="text-blue-600">{profileData.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{profileData.experience} experience</span>
                </div>
              </div>
              <div className="flex gap-2">
                {profileData.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="bg-blue-100 text-blue-700">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right space-y-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">127</div>
                  <div className="text-xs text-gray-600">Recipes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">15.2K</div>
                  <div className="text-xs text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-32 translate-x-32"></div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Basic Information</CardTitle>
                  <CardDescription className="text-base">Your public profile information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold">
                  Website
                </Label>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Culinary Expertise</CardTitle>
                  <CardDescription className="text-base">Showcase your culinary specializations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-semibold">
                    Years of Experience
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="4-7">4-7 years</SelectItem>
                      <SelectItem value="8-15">8-15 years</SelectItem>
                      <SelectItem value="15+">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine-type" className="text-sm font-semibold">
                    Primary Cuisine Type
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="fusion">Fusion</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Specializations</Label>
                <div className="flex flex-wrap gap-2">
                  {["Mediterranean", "Fusion", "Vegetarian", "Seafood", "Pastry", "Grilling"].map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-50 hover:border-orange-300"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  Add Specialization
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold">Dietary Accommodations</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo", "Dairy-Free"].map((diet) => (
                    <div key={diet} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium">{diet}</span>
                      <Switch />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Settings */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Total Recipes", value: "127", icon: ChefHat, color: "blue" },
                { label: "Followers", value: "15.2K", icon: Users, color: "green" },
                { label: "Likes Received", value: "89.4K", icon: Heart, color: "red" },
                { label: "Average Rating", value: "4.8", icon: Star, color: "yellow" },
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        stat.color === "blue"
                          ? "bg-blue-100"
                          : stat.color === "green"
                            ? "bg-green-100"
                            : stat.color === "red"
                              ? "bg-red-100"
                              : "bg-yellow-100"
                      }`}
                    >
                      <stat.icon
                        className={`h-4 w-4 ${
                          stat.color === "blue"
                            ? "text-blue-600"
                            : stat.color === "green"
                              ? "text-green-600"
                              : stat.color === "red"
                                ? "text-red-600"
                                : "text-yellow-600"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your profile visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Public Profile", desc: "Make your profile visible to everyone", checked: true },
                { title: "Show Contact Info", desc: "Display email and website publicly", checked: false },
                { title: "Recipe Analytics", desc: "Share anonymous usage data", checked: true },
                { title: "Marketing Emails", desc: "Receive updates and promotions", checked: false },
              ].map((setting, index) => (
                <div key={index} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{setting.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{setting.desc}</p>
                  </div>
                  <Switch defaultChecked={setting.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
