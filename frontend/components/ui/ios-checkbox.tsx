"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface IOSCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function IOSCheckbox({
  checked,
  onChange,
  disabled = false,
  className,
  id,
  name,
  size = 'md',
  label
}: IOSCheckboxProps) {
  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-11 h-6',
    lg: 'w-14 h-7'
  }

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      handleClick()
    }
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      id={id}
    >
      {/* Hidden input for form compatibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}} // Handled by parent div
        disabled={disabled}
        className="sr-only"
        name={name}
        tabIndex={-1}
      />
      
      {/* Toggle track */}
      <div
        className={cn(
          "relative rounded-full transition-colors duration-200 ease-in-out",
          sizeClasses[size],
          checked 
            ? "bg-blue-500" 
            : "bg-gray-300",
          disabled && "bg-gray-200"
        )}
      >
        {/* Toggle thumb */}
        <div
          className={cn(
            "absolute top-0.5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out",
            thumbSizeClasses[size],
            checked 
              ? size === 'sm' ? "translate-x-3" : size === 'md' ? "translate-x-5" : "translate-x-7"
              : "translate-x-0.5"
          )}
        />
      </div>
      
      {/* Label */}
      {label && (
        <span className="text-sm capitalize select-none">
          {label}
        </span>
      )}
    </div>
  )
}
