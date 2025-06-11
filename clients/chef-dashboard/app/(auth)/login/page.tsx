"use client"

import { useState } from "react"
import { ChefHat, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement authentication with Supabase
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: formData.email,
      //   password: formData.password,
      // })

      // if (error) throw error

      // Verify user is a chef
      // if (data.user?.user_metadata?.role !== 'chef') {
      //   throw new Error('Unauthorized access. This portal is for chefs only.')
      // }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/auth-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-lg mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo-white.png"
            alt="AFRI-Plates Chef"
            width={200}
            height={60}
            className="mx-auto"
          />
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <ChefHat className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-center">Welcome Back, Chef!</CardTitle>
            <CardDescription className="text-center">
              Sign in to your dashboard to manage your recipes and connect with food lovers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="chef@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-500"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    Sign In to Dashboard
                  </div>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Don't have a chef account?{" "}
                <Link href="/signup" className="text-orange-600 hover:text-orange-500">
                  Sign up here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-white">
              Help Center
            </Link>
          </div>
          <p className="mt-2 text-xs">
            © 2024 AFRI-Plates. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
} 