"use client"

import * as React from 'react'

import { Button } from './button'
import Select from './select'

import { cn } from '@/lib/utils'

export interface SelectRowOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectRowProps {
  value?: string | number
  onChange: (value: string | number | undefined) => void
  options: SelectRowOption[]
  variant?: 'buttons' | 'select'
  placeholder?: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
}

export default function SelectRow({
  value,
  onChange,
  options,
  variant = 'buttons',
  placeholder = 'Select option',
  className,
  size = 'sm',
  disabled = false
}: SelectRowProps) {
  const handleOptionClick = (optionValue: string | number) => {
    if (disabled) return

    // If clicking the same value, deselect it
    if (value === optionValue) {
      onChange(undefined)
    } else {
      onChange(optionValue)
    }
  }

  if (variant === 'select') {
    return (
      <Select
        value={value || ''}
        // @ts-expect-error
        onChange={onChange}
        disabled={disabled}
        options={options}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-w-[200px]",
          className
        )}
      />
    )
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "ghost"}
          size={size}
          onClick={() => handleOptionClick(option.value)}
          disabled={disabled || option.disabled}
          className={cn(
            "transition-colors",
            value === option.value && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
