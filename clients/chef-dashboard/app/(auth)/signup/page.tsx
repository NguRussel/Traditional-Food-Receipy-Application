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

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialties: "",
    password: "",
    acceptTerms: false
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.fullName || !formData.email || !formData.password || !formData.specialties) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError("Please accept the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement registration with Supabase
      // const { data, error } = await supabase.auth.signUp({
      //   email: formData.email,
      //   password: formData.password,
      //   options: {
      //     data: {
      //       full_name: formData.fullName,
      //       phone: formData.phone,
      //       specialties: formData.specialties.split(',').map(s => s.trim()),
      //       role: 'chef'
      //     }
      //   }
      // })

      // if (error) throw error

      router.push("/onboarding")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/auth-bg.jpg')] bg-cover bg-center bg-no-repeat py-8">
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
            <CardTitle className="text-2xl font-semibold text-center">Join as a Chef</CardTitle>
            <CardDescription className="text-center">
              Create your chef account to share your culinary expertise
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
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
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
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Culinary Specialties *</Label>
                <Input
                  id="specialties"
                  placeholder="e.g. Ndolé, Eru, Achu (comma separated)"
                  value={formData.specialties}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    Create Chef Account
                  </div>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-orange-600 hover:text-orange-500">
                  Sign in here
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