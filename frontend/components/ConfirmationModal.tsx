"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

export interface ConfirmationModalProps {
  title: string
  message: string
  type?: 'warning' | 'info' | 'success' | 'danger'
  confirmText?: string
  cancelText?: string
  onConfirm: () => boolean|void
  onCancel: () => void
  isLoading?: boolean
}

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  danger: XCircle
}

const colorMap = {
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  success: 'text-green-600',
  danger: 'text-red-600'
}

const buttonVariantMap = {
  warning: 'default',
  info: 'default',
  success: 'default',
  danger: 'destructive'
} as const

export default function ConfirmationModal({
  title,
  message,
  type = 'warning',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmationModalProps) {
  const Icon = iconMap[type]
  const iconColor = colorMap[type]
  const confirmVariant = buttonVariantMap[type]

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              const ok = onConfirm();
              if (ok) {
                onCancel();
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : confirmText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
