"use client"

import { Card } from "@/components/ui/card"

export function ContentCreationSection({ activeTab }: { activeTab: string }) {
  const renderContent = () => {
    switch (activeTab) {
      case "rich-editor":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rich Text Editor</h3>
            <div className="border rounded-md p-4">
              <div className="flex items-center gap-2 border-b pb-2 mb-4">
                <button className="p-1.5 hover:bg-gray-100 rounded">B</button>
                <button className="p-1.5 hover:bg-gray-100 rounded">I</button>
                <button className="p-1.5 hover:bg-gray-100 rounded">U</button>
                <span className="w-px h-4 bg-gray-300" />
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 7h16M4 12h16M4 17h7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <textarea
                className="w-full min-h-[200px] resize-none focus:outline-none"
                placeholder="Start writing your content..."
              />
            </div>
          </Card>
        )
      case "media-gallery":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Media Gallery</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
              ))}
              <button className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </Card>
        )
      case "video-upload":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Video Upload</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7m4 2v4m0 0l-2-2m2 2l2-2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-gray-500">Drag and drop your video here, or click to browse</p>
            </div>
          </Card>
        )
      case "templates":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Templates</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {["Recipe Blog Post", "Video Script", "Social Media Post", "Newsletter"].map((template) => (
                <button key={template} className="p-4 border rounded-lg text-left hover:bg-gray-50">
                  <h4 className="font-medium">{template}</h4>
                  <p className="text-sm text-gray-500 mt-1">Start with a pre-made template</p>
                </button>
              ))}
            </div>
          </Card>
        )
      case "scheduler":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Scheduler</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Scheduled Post {i}</p>
                    <p className="text-sm text-gray-500">Tomorrow at 9:00 AM</p>
                  </div>
                  <button className="px-3 py-1 text-sm rounded-md bg-gray-100">Edit</button>
                </div>
              ))}
              <button className="w-full px-4 py-2 border rounded-md hover:bg-gray-50">
                Schedule New Post
              </button>
            </div>
          </Card>
        )
      default:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Content Creation</h3>
            <p className="mt-2 text-gray-500">Select an option from the sidebar to get started.</p>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
} 