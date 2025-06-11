import type { Metadata } from 'next'
import './globals.css'
import { SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: 'Chef Dashboard',
  description: 'Your culinary command center',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  )
}
