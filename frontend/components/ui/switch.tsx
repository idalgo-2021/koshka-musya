"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  value?: string
}

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
  name,
  value,
  ...props
}: SwitchProps) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base styles
        "relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",

        // Background colors
        checked
          ? "bg-blue-500"
          : "bg-gray-200",

        // Hover effects (only when not disabled)
        !disabled && "hover:bg-opacity-80",

        className
      )}
      id={id}
      name={name}
      value={value}
      {...props}
    >
      {/* Switch thumb */}
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

// Alternative version with more iOS-like styling
export function IOSSwitch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
  name,
  value,
  ...props
}: SwitchProps) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base styles - more iOS-like proportions
        "relative cursor-pointer inline-flex h-7 w-12 items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",

        // Background colors with subtle shadow
        checked
          ? "bg-blue-500 shadow-inner"
          : "bg-gray-300 shadow-inner",

        // Hover effects (only when not disabled)
        !disabled && "hover:shadow-md",

        className
      )}
      id={id}
      name={name}
      value={value}
      style={checked ? {
        backgroundColor: 'rgb(103, 58, 183)'
      } : undefined}
      {...props}
    >
      {/* Switch thumb with iOS-like styling */}
      <span
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-200 ease-in-out",
          "border border-gray-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}
