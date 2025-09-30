"use client"

import { cn } from '@/lib/utils'
import { StatisticCard } from '@/entities/admin/types'

interface AdminStatisticCardProps {
  statistic: StatisticCard
  className?: string
}

export default function AdminStatisticCard({
  statistic,
  className
}: AdminStatisticCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {statistic.description}
          </p>
          <p className="text-lg md:text-2xl font-bold text-gray-900">
            {statistic.value.toLocaleString()}
          </p>
        </div>
        <div
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center",
            statistic.color
          )}
        >
          <span className="text-lg md:text-2xl">{statistic.icon}</span>
        </div>
      </div>
    </div>
  )
}
