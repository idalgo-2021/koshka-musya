"use client"

import Link from 'next/link'

import { useAdminStatistics } from '@/entities/admin/useAdminStatistics'
import { AdminStatistic } from '@/entities/admin/types'
import AdminGroupedStatisticCard from '@/components/AdminGroupedStatisticCard'
import AdminStatisticCard from '@/components/AdminStatisticCard'
import { StatisticCard } from '@/entities/admin/types'
import ErrorState from '@/components/ErrorState'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

const cardConfig: Record<string, { icon: string; color: string }> = {
  //  reservations
  'total_ota_reservations': { icon: '🏨', color: 'bg-blue-100 text-blue-600' },
  'ota_reservations_last_24h': { icon: '📅', color: 'bg-blue-100 text-blue-600' },
  // assignments
  'total_assignments': { icon: '📋', color: 'bg-green-100 text-green-600' },
  'open_assignments': { icon: '🔓', color: 'bg-yellow-100 text-yellow-600' },
  'pending_accept_assignments': { icon: '⏳', color: 'bg-orange-100 text-orange-600' },
  'total_assignment_declines': { icon: '❌', color: 'bg-red-100 text-red-600' },

  // reports
  'total_reports': { icon: '📊', color: 'bg-indigo-100 text-indigo-600' },
  'reports_today': { icon: '📈', color: 'bg-indigo-100 text-indigo-600' },
  'submitted_reports': { icon: '✅', color: 'bg-emerald-100 text-emerald-600' },

  // secret guest stats
  'total_sg': { icon: '👤', color: 'bg-purple-100 text-purple-600' },
  'new_sg_last_24h': { icon: '🆕', color: 'bg-pink-100 text-pink-600' }
}

const mapStatisticsToCards = (statistics: AdminStatistic[]): StatisticCard[] => {
  // Show all statistics
  return statistics.map(stat => ({
    ...stat,
    icon: cardConfig[stat.key]?.icon || '📊',
    color: cardConfig[stat.key]?.color || 'bg-gray-100 text-gray-600'
  }))
}

const groupStatisticsByCategory = (statistics: StatisticCard[]) => {
  return {
    reservations: {
      title: 'Бронирования',
      icon: '🏨',
      link: '/admin/sg_reservations',
      stats: statistics.filter(stat =>
        stat.key.includes('ota_reservations') || stat.key.includes('reservation')
      )
    },
    assignments: {
      title: 'Предложения',
      icon: '📋',
      link: '/admin/assignments',
      stats: statistics.filter(stat =>
        stat.key.includes('assignment')
      )
    },
    reports: {
      title: 'Отчеты',
      icon: '📊',
      link: '/admin/reports',
      stats: statistics.filter(stat =>
        stat.key.includes('report')
      )
    },
    secretGuests: {
      title: 'Тайные гости',
      icon: '👤',
      link: '/admin/users',
      stats: statistics.filter(stat =>
        stat.key.includes('sg')
      )
    }
  }
}

export default function AdminDashboard() {
  const { data, isLoading, isRefetching, error, refetch } = useAdminStatistics()

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
  const groupedStats = groupStatisticsByCategory(statisticCards)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
          <p className="text-gray-600 mt-1">
            Обзор статистики и ключевых показателей
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRefetching && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Mobile: Grouped cards */}
      <div className="block md:hidden space-y-4">
        {Object.entries(groupedStats).map(([categoryKey, category]) => (
          <AdminGroupedStatisticCard
            key={categoryKey}
            title={category.title}
            icon={category.icon}
            link={category.link}
            statistics={category.stats}
          />
        ))}
      </div>

      {/* Desktop: Individual cards */}
      <div className="hidden md:block">
        {Object.entries(groupedStats).map(([categoryKey, category]) => (
          <div key={categoryKey} className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              {category.link ? (
                <Link href={category.link} className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  {category.title}
                </Link>
              ) : (
                <h2 className="text-xl font-semibold text-gray-800">{category.title}</h2>
              )}
            </div>

            {category.stats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.stats.map((statistic) => (
                  <AdminStatisticCard
                    key={statistic.key}
                    statistic={statistic}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Нет данных в этой категории</p>
              </div>
            )}
          </div>
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
