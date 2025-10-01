"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CopyToClipboardProps {
  text: string
  children?: React.ReactNode
  className?: string
  showIcon?: boolean
  successMessage?: string
}

export function CopyToClipboard({ 
  text, 
  children, 
  className,
  showIcon = true,
  successMessage = 'Скопировано в буфер обмена'
}: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(successMessage)
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      toast.error('Не удалось скопировать')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-auto p-0 font-normal text-left justify-start ${className}`}
    >
      {children || text}
      {showIcon && (
        <span className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
          {copied ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </span>
      )}
    </Button>
  )
}
