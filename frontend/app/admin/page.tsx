"use client"

import { useAdminStatistics } from '@/entities/admin/useAdminStatistics'
import { AdminStatistic } from '@/entities/admin/types'
import AdminStatisticCard from '@/components/AdminStatisticCard'
import { StatisticCard } from '@/entities/admin/types'
import ErrorState from '@/components/ErrorState'

const mapStatisticsToCards = (statistics: AdminStatistic[]): StatisticCard[] => {
  const cardConfig: Record<string, { icon: string; color: string }> = {
    'total_ota_reservations': { icon: '🏨', color: 'bg-blue-100 text-blue-600' },
    'ota_reservations_last_24h': { icon: '📅', color: 'bg-blue-100 text-blue-600' },
    'total_assignments': { icon: '📋', color: 'bg-green-100 text-green-600' },
    'open_assignments': { icon: '🔓', color: 'bg-yellow-100 text-yellow-600' },
    'pending_accept_assignments': { icon: '⏳', color: 'bg-orange-100 text-orange-600' },
    'total_assignment_declines': { icon: '❌', color: 'bg-red-100 text-red-600' },
    'total_reports': { icon: '📊', color: 'bg-indigo-100 text-indigo-600' },
    'reports_today': { icon: '📈', color: 'bg-indigo-100 text-indigo-600' },
    'total_sg': { icon: '👤', color: 'bg-purple-100 text-purple-600' },
    'new_sg_last_24h': { icon: '🆕', color: 'bg-pink-100 text-pink-600' }
  }

  // Show all statistics
  return statistics.map(stat => ({
    ...stat,
    icon: cardConfig[stat.key]?.icon || '📊',
    color: cardConfig[stat.key]?.color || 'bg-gray-100 text-gray-600'
  }))
}

export default function AdminDashboard() {
  const { data, isLoading, error, refetch } = useAdminStatistics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Загрузка...
        {/*<Loader />*/}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorState
          error="Не удалось загрузить статистику"
          onRetry={refetch}
        />
      </div>
    )
  }

  const statisticCards = data ? mapStatisticsToCards(data.statistics) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
        <p className="text-gray-600 mt-1">
          Обзор статистики и ключевых показателей
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statisticCards.map((statistic) => (
          <AdminStatisticCard
            key={statistic.key}
            statistic={statistic}
          />
        ))}
      </div>

      {statisticCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Нет данных для отображения</p>
        </div>
      )}
    </div>
  )
}
