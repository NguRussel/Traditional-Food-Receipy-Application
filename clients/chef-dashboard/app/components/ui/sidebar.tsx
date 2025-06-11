"use client"

import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const toggle = () => setIsOpen(!isOpen)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-white transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {children}
    </div>
  )
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  return (
    <div className={cn("flex flex-col", isOpen ? "visible" : "invisible")}>
      {children}
    </div>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {children}
    </div>
  )
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar()
  return (
    <button
      onClick={toggle}
      className={cn(
        "rounded-lg p-1.5 hover:bg-gray-100",
        className
      )}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  )
} 