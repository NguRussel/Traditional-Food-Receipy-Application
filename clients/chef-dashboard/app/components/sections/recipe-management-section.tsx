"use client"

import { Card } from "@/components/ui/card"

export function RecipeManagementSection({ activeTab }: { activeTab: string }) {
  const renderContent = () => {
    switch (activeTab) {
      case "all-recipes":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">All Recipes</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-orange-100" />
                    <div>
                      <p className="font-medium">Recipe {i}</p>
                      <p className="text-sm text-gray-500">Published 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm rounded-md bg-gray-100">Edit</button>
                    <button className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      case "create-recipe":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Recipe</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recipe Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border rounded-md" rows={4} />
              </div>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md">Create Recipe</button>
            </form>
          </Card>
        )
      case "recipe-analytics":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recipe Analytics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-semibold">1,234</p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500">Likes</p>
                <p className="text-2xl font-semibold">567</p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500">Comments</p>
                <p className="text-2xl font-semibold">89</p>
              </div>
            </div>
          </Card>
        )
      case "bulk-operations":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Operations</h3>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50">
                Import Recipes
              </button>
              <button className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50">
                Export Recipes
              </button>
              <button className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50">
                Bulk Update Categories
              </button>
            </div>
          </Card>
        )
      default:
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Recipe Management</h3>
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