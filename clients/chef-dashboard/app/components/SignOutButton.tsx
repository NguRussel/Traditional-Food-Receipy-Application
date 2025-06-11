"use client"

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      
      // Clear any auth tokens or user data from localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
        window.sessionStorage.clear()
        
        // Clear any cookies
        document.cookie.split(";").forEach((c: string) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
      }
      
      // Redirect to login page
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Signing out...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </div>
      )}
    </Button>
  )
} 