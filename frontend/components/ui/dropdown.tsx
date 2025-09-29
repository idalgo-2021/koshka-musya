"use client"

import * as React from 'react'
import { useClickOutside, useEscapeKey } from '@/hooks/useEventHooks'

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, align = 'right', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen)

  // Handle escape key to close dropdown
  useEscapeKey(() => setIsOpen(false), isOpen)

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="py-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === DropdownItem) {
                return React.cloneElement(child as React.ReactElement<DropdownItemProps>, { onClose: () => setIsOpen(false) })
              }
              return child
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  onClose?: () => void
}

export function DropdownItem({ children, onClick, disabled = false, className = '', onClose }: DropdownItemProps) {
  const handleClick = () => {
    if (onClick && !disabled) {
      onClick()
      onClose?.()
    }
  }

  return (
    <button
      className={`cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

interface DropdownSeparatorProps {
  className?: string
}

export function DropdownSeparator({ className = '' }: DropdownSeparatorProps) {
  return <div className={`border-t border-gray-200 my-1 ${className}`} />
}
