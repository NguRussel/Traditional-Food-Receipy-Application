import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, Video, FileText, Calendar, Eye, Trash2, Edit, Play, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ContentCreationSectionProps {
  activeTab: string
}

export function ContentCreationSection({ activeTab }: ContentCreationSectionProps) {
  if (activeTab === "media-gallery") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Cameroonian Recipe Media Gallery</h2>
            <p className="text-muted-foreground">Manage your Cameroonian recipe images and videos</p>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Cameroonian Media
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted relative group">
                <img src="/placeholder.svg" alt={`Cameroonian Media ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {i % 3 === 0 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {i % 3 === 0 ? `Cameroonian Cooking Video ${i + 1}` : `Cameroonian Recipe Image ${i + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">Uploaded 2 days ago</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (activeTab === "video-upload") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Cameroonian Video Upload</h2>
            <p className="text-muted-foreground">Upload and manage your Cameroonian cooking videos</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Cameroonian Video</CardTitle>
            <CardDescription>Share your Cameroonian cooking process with step-by-step videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Upload Cameroonian Video</h3>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop your Cameroonian video file, or click to browse</p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Choose Cameroonian Video File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Supported formats: MP4, MOV, AVI (Max 500MB)</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="video-title">Cameroonian Video Title</Label>
                <Input id="video-title" placeholder="Enter Cameroonian video title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-category">Category</Label>
                <Input id="video-category" placeholder="e.g., Ndolé Tutorial, Poulet DG Demo" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Cameroonian Video Description</Label>
              <Textarea id="video-description" placeholder="Describe your Cameroonian video..." className="min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload custom thumbnail or auto-generate from video</p>
                <div className="flex gap-2 justify-center mt-2">
                  <Button variant="outline" size="sm">
                    Upload Thumbnail
                  </Button>
                  <Button variant="outline" size="sm">
                    Auto-Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Save as Draft
              </Button>
              <Button className="flex-1">Upload Cameroonian Video</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Cameroonian Videos</CardTitle>
            <CardDescription>Your uploaded Cameroonian cooking videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24 h-16 bg-muted rounded flex items-center justify-center">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{`Cameroonian Dish Tutorial ${i + 1}`}</h4>
                    <p className="text-sm text-muted-foreground">Uploaded 2 days ago • 1.2K views • 4:32 duration</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Tutorial</Badge>
                      <Badge variant={i === 0 ? "default" : "secondary"}>{i === 0 ? "Published" : "Processing"}</Badge>
                    </div>
                  </div>
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
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
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
          <h2 className="text-2xl font-bold">Cameroonian Content Creation Tools</h2>
          <p className="text-muted-foreground">Create engaging content for your Cameroonian recipes</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rich Text Editor
            </CardTitle>
            <CardDescription>Create detailed Cameroonian recipe instructions with formatting</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Open Editor</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image Gallery
            </CardTitle>
            <CardDescription>Manage and organize your Cameroonian recipe photos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Gallery
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Upload
            </CardTitle>
            <CardDescription>Upload Cameroonian cooking videos and tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Upload Video
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recipe Templates
            </CardTitle>
            <CardDescription>Use pre-made templates for quick Cameroonian recipe creation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Browse Templates
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cameroonian Content Scheduler
            </CardTitle>
            <CardDescription>Schedule your Cameroonian recipes for future publication</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Schedule Cameroonian Content
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Cameroonian Import
            </CardTitle>
            <CardDescription>Import Cameroonian recipes from external sources or files</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Import Cameroonian Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}