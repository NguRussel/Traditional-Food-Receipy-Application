"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

const SidebarNav = React.forwardRef<
  HTMLElement,
  SidebarNavProps
>(({ className, children, ...props }, ref) => {
  return (
    <nav
      ref={ref}
      className={cn("flex flex-col gap-1 px-2", className)}
      {...props}
    >
      {children}
    </nav>
  )
})
SidebarNav.displayName = "SidebarNav"

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  icon?: React.ReactNode
  active?: boolean
}

const SidebarNavItem = React.forwardRef<
  HTMLAnchorElement,
  SidebarNavItemProps
>(({ className, href, icon, children, ...props }, ref) => {
  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {icon && icon}
      {children}
    </a>
  )
})
SidebarNavItem.displayName = "SidebarNavItem"

interface SidebarNavHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarNavHeader = React.forwardRef<
  HTMLDivElement,
  SidebarNavHeaderProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-xs font-medium text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarNavHeader.displayName = "SidebarNavHeader"

export { SidebarNav, SidebarNavItem, SidebarNavHeader }