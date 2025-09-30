"use client"

import { cn } from '@/lib/utils'
import { StatisticCard } from '@/entities/admin/types'

interface AdminGroupedStatisticCardProps {
  title: string
  icon: string
  statistics: StatisticCard[]
  className?: string
}

export default function AdminGroupedStatisticCard({ 
  title,
  icon,
  statistics,
  className 
}: AdminGroupedStatisticCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {statistics.map((statistic) => (
          <div key={statistic.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{statistic.icon}</span>
              <span className="text-sm text-gray-600">{statistic.description}</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {statistic.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
