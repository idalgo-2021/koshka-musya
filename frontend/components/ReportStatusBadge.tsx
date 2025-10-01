import { cn } from '@/lib/utils'
import type { ReportStatus } from '@/entities/reports/types'

interface ReportStatusBadgeProps {
  status: ReportStatus
  className?: string
}

const getStatusStyles = (slug: string) => {
  switch (slug) {
    case 'generating':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      }
    case 'draft':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      }
    case 'submitted':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      }
    case 'approved':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      }
    case 'rejected':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      }
    case 'failed_generation':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      }
  }
}

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  const styles = getStatusStyles(status.slug)

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium",
      styles.bg,
      styles.text,
      styles.border,
      className
    )}>
      {status.name}
    </span>
  )
}
