"use client"

import { useState } from "react"
import { Bell, Mail, Database, Save, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsContent() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [userRegistration, setUserRegistration] = useState(true)

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Configure general platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="AFRI-Plates" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-url">Platform URL</Label>
                <Input id="platform-url" defaultValue="https://afriplates.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-description">Platform Description</Label>
              <Textarea
                id="platform-description"
                defaultValue="Discover and share authentic African recipes from across the continent"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" defaultValue="admin@afriplates.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" defaultValue="support@afriplates.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Configure user registration and management settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch checked={userRegistration} onCheckedChange={setUserRegistration} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-recipes">Max Recipes per Chef</Label>
              <Input id="max-recipes" type="number" defaultValue="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-required">Chef Verification</Label>
              <Select defaultValue="manual">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual Review</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>System maintenance and backup settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Backup Now
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure email notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" defaultValue="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" defaultValue="587" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input id="smtp-username" defaultValue="noreply@afriplates.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input id="smtp-password" type="password" defaultValue="••••••••" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Configure push notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Send push notifications to mobile apps</p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fcm-key">FCM Server Key</Label>
              <Input id="fcm-key" type="password" defaultValue="••••••••••••••••" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Settings</CardTitle>
            <CardDescription>Configure authentication and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-policy">Password Policy</Label>
              <Select defaultValue="strong">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">Weak (6+ characters)</SelectItem>
                  <SelectItem value="medium">Medium (8+ characters, mixed case)</SelectItem>
                  <SelectItem value="strong">Strong (12+ characters, mixed case, numbers, symbols)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input id="max-login-attempts" type="number" defaultValue="5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Security</CardTitle>
            <CardDescription>Configure API security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
              <Input id="rate-limit" type="number" defaultValue="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key-expiry">API Key Expiry (days)</Label>
              <Input id="api-key-expiry" type="number" defaultValue="365" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>Customize the platform appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input id="primary-color" defaultValue="#0066CC" />
                <div className="w-10 h-10 rounded border" style={{ backgroundColor: "#0066CC" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input id="secondary-color" defaultValue="#FF6B35" />
                <div className="w-10 h-10 rounded border" style={{ backgroundColor: "#FF6B35" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select defaultValue="inter">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="opensans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo & Branding</CardTitle>
            <CardDescription>Upload and manage platform branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Platform Logo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">Click to upload logo</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">Click to upload favicon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integrations" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Third-party Integrations</CardTitle>
            <CardDescription>Configure external service integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">SendGrid</h4>
                    <p className="text-sm text-muted-foreground">Email delivery service</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">AWS S3</h4>
                    <p className="text-sm text-muted-foreground">File storage service</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Firebase</h4>
                    <p className="text-sm text-muted-foreground">Push notifications</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Configure analytics and tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="google-analytics">Google Analytics ID</Label>
              <Input id="google-analytics" placeholder="G-XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
              <Input id="facebook-pixel" placeholder="123456789" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </Tabs>
  )
}
