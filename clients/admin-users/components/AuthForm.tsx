"use client"

import { useState } from "react"
import { ChefHat, Eye, EyeOff, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface AuthFormProps {
  userType: "admin" | "chef"
}

export function AuthForm({ userType }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
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
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (
        userType === "admin" &&
        formData.email === "admin@cameroon-plates.com" &&
        formData.password === "admin123"
      ) {
        document.cookie = `admin-token=authenticated; path=/; max-age=${
          60 * 60 * 24 * 7
        }; secure; samesite=strict`
        router.push("/")
      } else if (
        userType === "chef" &&
        formData.email === "chef@cameroon-plates.com" &&
        formData.password === "chef123"
      ) {
        document.cookie = `chef-token=authenticated; path=/; max-age=${
          60 * 60 * 24 * 7
        }; secure; samesite=strict`
        router.push("/")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const demoCredentials =
    userType === "admin"
      ? {
          email: "admin@cameroon-plates.com",
          password: "admin123",
        }
      : {
          email: "chef@cameroon-plates.com",
          password: "chef123",
        }

  return (
    <div className="min-h-screen w-full bg-slate-800">
      {/* Centered Auth Form */}
      <div className="flex min-h-screen w-full items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Hero Image Section - Add your image here */}
          <div className="text-center">
            {/* Example using existing placeholder logo - Replace with your custom image */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/placeholder-logo.png"
                alt="CAMEROON-PLATES Logo"
                width={120}
                height={120}
                className="rounded-lg shadow-lg"
              />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="mt-2 text-slate-300">
              Sign in to access the CAMEROON-PLATES {userType} panel
            </p>
          </div>

          <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access the {userType} dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={demoCredentials.email}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12 pr-12 text-base"
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

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          rememberMe: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-slate-400">
              Protected by enterprise-grade security
            </p>
            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400">
              <span>© 2024 CAMEROON-PLATES</span>
              <span>•</span>
              <Link href="/privacy" className="hover:underline text-slate-300">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:underline text-slate-300">
                Terms of Service
              </Link>
            </div>
          </div>

          <Card className="border-blue-200 bg-blue-50/95 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Demo Credentials
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Email:{" "}
                    <code className="rounded bg-blue-100 px-1.5 py-0.5 dark:bg-blue-900 text-xs">
                      {demoCredentials.email}
                    </code>
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Password:{" "}
                    <code className="rounded bg-blue-100 px-1.5 py-0.5 dark:bg-blue-900 text-xs">
                      {demoCredentials.password}
                    </code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 