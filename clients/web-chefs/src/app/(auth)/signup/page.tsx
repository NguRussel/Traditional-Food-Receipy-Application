"use client"

import { useState } from "react"
import { ChefHat, Eye, EyeOff, Utensils, AlertCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"

const CUISINE_SPECIALTIES = [
  "Traditional Cameroonian",
  "West African",
  "Modern African Fusion",
  "African Pastries",
  "African Street Food",
  "African Vegan/Vegetarian",
  "African Seafood",
  "African BBQ/Grills",
] as const;

export default function ChefSignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    specialties: [] as string[],
    acceptTerms: false
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (formData.specialties.length === 0) {
      setError("Please select at least one specialty")
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError("Please accept the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      const response = await auth.signUpChef({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        specialties: formData.specialties,
        phoneNumber: formData.phoneNumber,
      })

      if (!response.success) {
        throw new Error(response.error)
      }

      // Redirect to onboarding or verification page
      router.push("/verification")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpecialtyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter(s => s !== value)
        : [...prev.specialties, value]
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-600 text-white shadow-lg">
              <ChefHat className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Join as a Chef</h1>
          <p className="text-muted-foreground mt-2">
            Share your culinary expertise with food lovers across Cameroon
          </p>
        </div>

        {/* Sign Up Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Create Your Chef Account</CardTitle>
            <CardDescription>
              Fill in your details to start your culinary journey
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
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Chef John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="chef@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+237 XXX XXX XXX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Culinary Specialties</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CUISINE_SPECIALTIES.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyChange(specialty)}
                      />
                      <label
                        htmlFor={specialty}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acceptTerms: checked as boolean })
                  }
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-orange-600 hover:text-orange-500 hover:underline"
                  >
                    terms and conditions
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Create Chef Account
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-600 hover:text-orange-500 hover:underline">
              Sign in
            </Link>
          </p>
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>© 2024 AFRI-Plates</span>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 