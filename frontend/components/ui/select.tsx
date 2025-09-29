"use client"

import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/hooks/useEventHooks'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string | number | (string | number)[]
  onChange: (value: string | number | (string | number)[] | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  multiple?: boolean
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  id,
  name
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const [buttonWidth, setButtonWidth] = React.useState<number>(0)
  const selectRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Find the selected option
  const selectedOption = options.find(option => option.value === value)

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
      case 'Escape':
        event.stopPropagation()
        event.preventDefault()
        setIsOpen(false)
        setFocusedIndex(-1)
        buttonRef.current?.focus()
        break

      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else {
          setFocusedIndex(prev => {
            const nextIndex = prev + 1
            return nextIndex >= options.length ? 0 : nextIndex
          })
        }
        break

      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(options.length - 1)
        } else {
          setFocusedIndex(prev => {
            const prevIndex = prev - 1
            return prevIndex < 0 ? options.length - 1 : prevIndex
          })
        }
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        event.stopPropagation()
        if (isOpen && focusedIndex >= 0) {
          const option = options[focusedIndex]
          if (!option.disabled) {
            onChange(option.value)
            setIsOpen(false)
            setFocusedIndex(-1)
            buttonRef.current?.focus()
          }
        } else if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        }
        break

      case 'Tab':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }, [disabled, isOpen, focusedIndex, options, onChange])

  // Handle clicking outside to close
  useClickOutside(selectRef, () => {
    setIsOpen(false)
    setFocusedIndex(-1)
  }, isOpen)


  // Measure button width for stable dropdown width
  React.useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth)
    }
  }, [isOpen])

  // Set initial focused index when opening
  React.useEffect(() => {
    if (isOpen) {
      const selectedIndex = options.findIndex(option => option.value === value)
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }, [isOpen, options, value])

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value)
      setIsOpen(false)
      setFocusedIndex(-1)
      buttonRef.current?.focus()
    }
  }

  return (
    <div ref={selectRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "hover:border-gray-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          isOpen && "ring-2 ring-blue-500 border-transparent",
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id ? `${id}-label` : undefined}
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-gray-500"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg"
          style={{ width: buttonWidth || '100%', minWidth: '100%' }}
        >
          <ul
            role="listbox"
            className="max-h-60 overflow-auto py-1"
            aria-labelledby={id ? `${id}-label` : undefined}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  "relative cursor-pointer select-none px-3 py-2 text-sm",
                  "hover:bg-gray-100 focus:bg-gray-100",
                  option.disabled && "cursor-not-allowed opacity-50",
                  index === focusedIndex && "bg-blue-50 text-blue-600",
                  option.value === value && "bg-blue-50 text-blue-600"
                )}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={(e) =>{
                  e.preventDefault();
                  e.stopPropagation();
                  setFocusedIndex(index);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate flex-1">{option.label}</span>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
