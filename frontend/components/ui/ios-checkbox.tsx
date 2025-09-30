"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface IOSRadioButtonProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  value?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
  lg: 'w-8 h-8'
}

const dotSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-4.5 h-4.5',
  lg: 'w-5.5 h-5.5'
}


export default function IOSRadioButton({
  checked,
  onChange,
  disabled = false,
  className,
  id,
  name,
  value,
  size = 'md',
  label
}: IOSRadioButtonProps) {
 
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
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      id={id}
    >
      {/* Hidden input for form compatibility */}
      <input
        type="radio"
        checked={checked}
        onChange={() => {}} // Handled by parent div
        disabled={disabled}
        className="sr-only"
        name={name}
        value={value}
        tabIndex={-1}
      />
      
      {/* Radio button circle */}
      <div
        className={cn(
          "relative rounded-full border-3 transition-all duration-200 ease-in-out flex items-center justify-center",
          sizeClasses[size],
          checked 
            ? "bg-white" 
            : "border-gray-300 bg-white",
          disabled && "border-gray-200 bg-gray-50"
        )}
        style={checked ? { borderColor: 'rgb(103, 58, 183)' } : undefined}
      >
        {/* Inner dot */}
        {checked && (
          <div
            className={cn(
              "rounded-full transition-all duration-200 ease-in-out",
              dotSizeClasses[size]
            )}
            style={{ backgroundColor: 'rgb(103, 58, 183)' }}
          />
        )}
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
