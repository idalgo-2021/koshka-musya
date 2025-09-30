"use client"

import { useState } from 'react'
import { useSgReservations, useMarkAsNoShow } from '@/entities/sgReservations/useSgReservations'
import { SgReservationsFilters } from '@/entities/sgReservations/types'
import SgReservationCard from '@/components/SgReservationCard'
import { Button } from '@/components/ui/button'
import Select from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Filter, RotateCcw } from 'lucide-react'
import { SG_RESERVATION_STATUSES } from '@/entities/sgReservations/constants'

const ITEMS_PER_PAGE = 10

export default function SgReservationsPage() {
  const [filters, setFilters] = useState<SgReservationsFilters>({
    page: 1,
    limit: ITEMS_PER_PAGE
  })

  const { data, isLoading, error, refetch } = useSgReservations(filters)
//   const { data: statuses } = useSgReservationStatuses()
  const markAsNoShowMutation = useMarkAsNoShow()

  const handleStatusFilter = (statusId: string) => {
    const newFilters = { ...filters, page: 1 }
    if (statusId === 'all') {
      delete newFilters.status_id
    } else {
      newFilters.status_id = parseInt(statusId)
    }
    setFilters(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const handleMarkAsNoShow = (id: string) => {
    markAsNoShowMutation.mutate(id)
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: ITEMS_PER_PAGE })
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0
  const currentPage = filters.page || 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка резерваций...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка загрузки резерваций</p>
          <Button onClick={() => refetch()} variant="outline">
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OTA Резервации</h1>
          <p className="text-gray-600 mt-1">
            Управление резервациями от OTA партнеров
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Фильтры:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Статус:</label>
            <Select
              value={filters.status_id?.toString() || 'all'}
              onChange={handleStatusFilter}
              placeholder="Все статусы"
              options={[
                { value: 'all', label: 'Все статусы' },
                ...(SG_RESERVATION_STATUSES?.map((status) => ({
                  value: status.id.toString(),
                  label: status.name
                })) || [])
              ]}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </Button>
        </div>
      </div>

      {/* Results Info */}
      {Array.isArray(data?.reservations) && data.reservations.length > 0 && (
        <div className="text-sm text-gray-600">
          Показано {data.reservations.length} из {data.total} резерваций
          {filters.status_id && (
            <span className="ml-2">
              (статус: {SG_RESERVATION_STATUSES?.find(s => s.id === filters.status_id)?.name})
            </span>
          )}
        </div>
      )}

      {/* Reservations Grid */}
      {data && data.reservations?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.reservations.map((reservation) => (
            <SgReservationCard
              key={reservation.id}
              reservation={reservation}
              onMarkAsNoShow={handleMarkAsNoShow}
              isMarkingAsNoShow={markAsNoShowMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Резервации не найдены</p>
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Предыдущая
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Следующая
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
