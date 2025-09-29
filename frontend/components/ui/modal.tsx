"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "./button"

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen?: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: ModalSize
  position?: "center" | "right"
}

export function Modal({ isOpen = false, onClose, title, children, size = "lg", position = "center" }: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full"
  }

  const getModalClasses = () => {
    if (position === "right") {
      return `
        fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-xl
        z-10 overflow-hidden
        
        /* Mobile: Full screen */
        max-sm:max-w-full
      `
    }

    // Center position (default)
    return `
      relative w-full mx-4 bg-white rounded-lg shadow-xl
      ${sizeClasses[size]}
      max-h-[90vh] overflow-hidden
      
      /* Mobile: Full screen */
      sm:max-h-[90vh] sm:mx-4 sm:rounded-lg
      
      /* Mobile portrait: Full screen */
      max-sm:mx-0 max-sm:my-0 max-sm:h-full max-sm:max-h-full max-sm:rounded-none
    `
  }

  return (
    <div className={`fixed inset-0 z-50 ${position === "center" ? "flex items-center justify-center" : ""}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`${getModalClasses()} ${position === "right" ? "flex flex-col" : ""}`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-2 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className={`overflow-y-auto ${position === "right" ? "flex-1" : "max-h-full"}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
