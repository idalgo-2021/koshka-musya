"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface TabsProps {
  items: TabItem[]
  defaultActiveTab?: string
  className?: string
  onTabChange?: (tabId: string) => void
}

export function Tabs({ items, defaultActiveTab, className, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultActiveTab || items[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const activeTabContent = items.find(item => item.id === activeTab)?.content

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer",
                activeTab === item.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTabContent}
      </div>
    </div>
  )
}

// Individual tab components for more control
interface TabListProps {
  children: React.ReactNode
  className?: string
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className={cn("border-b border-gray-200", className)}>
      <nav className="-mb-px flex space-x-8">
        {children}
      </nav>
    </div>
  )
}

interface TabTriggerProps {
  id: string
  activeTab: string
  onTabChange: (tabId: string) => void
  children: React.ReactNode
  className?: string
}

export function TabTrigger({ id, activeTab, onTabChange, children, className }: TabTriggerProps) {
  return (
    <button
      onClick={() => onTabChange(id)}
      className={cn(
        "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
        activeTab === id
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabContentProps {
  id: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

export function TabContent({ id, activeTab, children, className }: TabContentProps) {
  if (activeTab !== id) return null

  return (
    <div className={cn("mt-6", className)}>
      {children}
    </div>
  )
}
