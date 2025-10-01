"use client"

import React, { createContext, useContext, ReactNode, useState } from 'react'
import { useEventListener } from '@/hooks/useEventHooks'

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapse: () => void
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
  }

  // Handle keyboard shortcut for toggling sidebar
  useEventListener('keydown', (event: KeyboardEvent) => {
    // Check if '[' key is pressed and no modifier keys are held
    if (event.key === '[' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      // Only trigger if not typing in an input field
      const target = event.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.contentEditable === 'true' ||
                          target.getAttribute('role') === 'textbox'

      if (!isInputField) {
        event.preventDefault()
        toggleCollapse()
      }
    }
  })

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
