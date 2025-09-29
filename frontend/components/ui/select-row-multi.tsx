"use client"

import * as React from 'react'

import { Button } from './button'
import { cn } from '@/lib/utils'

export interface SelectRowMultiOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectRowMultiProps {
  value?: (string | number)[]
  onChange: (value: (string | number)[]) => void
  options: SelectRowMultiOption[]
  placeholder?: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
}

export default function SelectRowMulti({
  value = [],
  onChange,
  options,
  placeholder = 'Select options',
  className,
  size = 'sm',
  disabled = false
}: SelectRowMultiProps) {
  const handleOptionClick = (optionValue: string | number) => {
    if (disabled) return

    const currentValue = value || []
    const isSelected = currentValue.includes(optionValue)
    
    // Special handling for "all" option
    if (optionValue === 'all') {
      if (isSelected) {
        // If "all" is selected, deselect it (clear all)
        onChange([])
      } else {
        // If "all" is not selected, select only "all" (deselect everything else)
        onChange(['all'])
      }
    } else {
      // For other options, remove "all" if it exists and handle normal selection
      const valueWithoutAll = currentValue.filter(v => v !== 'all')
      const isOtherSelected = valueWithoutAll.includes(optionValue)
      
      if (isOtherSelected) {
        // Remove from selection
        onChange(valueWithoutAll.filter(v => v !== optionValue))
      } else {
        // Add to selection
        onChange([...valueWithoutAll, optionValue])
      }
    }
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {options.map((option) => {
        const isSelected = value?.includes(option.value) || false
        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size={size}
            onClick={() => handleOptionClick(option.value)}
            disabled={disabled || option.disabled}
            className={cn(
              "transition-colors",
              isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
