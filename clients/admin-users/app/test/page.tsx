"use client"

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Protected Test Page</h1>
        <p className="text-muted-foreground">
          If you can see this page, you are authenticated!
        </p>
      </div>
    </div>
  )
} 