"use client"

import { useState } from 'react'
import { useSgReservations, useMarkAsNoShow } from '@/entities/sgReservations/useSgReservations'
import { SgReservationsFilters } from '@/entities/sgReservations/types'
import SgReservationCard from '@/components/SgReservationCard'
import { Button } from '@/components/ui/button'
import Select from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Filter, RotateCcw, Grid3X3, List } from 'lucide-react'
import { SG_RESERVATION_STATUSES } from '@/entities/sgReservations/constants'
import { ToggleButton, useToggleWithStorage } from '@/components/ToggleButton'

const ITEMS_PER_PAGE = 10

const calculateDays = (checkin: string, checkout: string) => {
  const checkinDate = new Date(checkin)
  const checkoutDate = new Date(checkout)
  const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function SgReservationsPage() {
  const [filters, setFilters] = useState<SgReservationsFilters>({
    page: 1,
    limit: ITEMS_PER_PAGE
  })

  const [isTableView, toggle] = useToggleWithStorage('sg-reservations-view', false)

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
        <ToggleButton
          checked={isTableView}
          onToggle={toggle}
        />
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

      {/* Reservations Display */}
      {data && data.reservations?.length > 0 ? (
        isTableView ? (
          /* Table View */
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Бронирование</th>
                  <th className="px-3 py-2 text-left font-medium">Даты</th>
                  <th className="px-3 py-2 text-left font-medium">Гости</th>
                  <th className="px-3 py-2 text-left font-medium">Стоимость</th>
                  <th className="px-3 py-2 text-left font-medium">Статус</th>
                  <th className="px-3 py-2 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-t">
                    <td className="px-3 py-2">
                      <div>
                        <div className="font-medium">{reservation.BookingNumber}</div>
                        <div className="text-xs text-gray-500">ID: {reservation.ListingID}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        <div>{new Date(reservation.CheckinDate).toLocaleDateString('ru-RU')}</div>
                        <div>{new Date(reservation.CheckoutDate).toLocaleDateString('ru-RU')}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        {reservation.guests ?
                          (typeof reservation.guests === 'object' && reservation.guests.adults ?
                            `${reservation.guests.adults} взр.${reservation.guests.children > 0 ? `, ${reservation.guests.children} дет.` : ''}` :
                            'N/A') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        <div>{reservation.pricing?.pricing?.total?.toLocaleString()} {reservation.pricing?.pricing?.currency}</div>
                        <div className="text-gray-500">
                          {reservation.pricing?.pricing?.total &&
                            Math.round(reservation.pricing.pricing.total / calculateDays(reservation.CheckinDate, reservation.CheckoutDate)).toLocaleString()} {reservation.pricing?.pricing?.currency}/день
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        reservation.status.slug === 'new' ? 'bg-blue-100 text-blue-800' :
                        reservation.status.slug === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status.slug === 'booked' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status.name}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {reservation.status.slug !== 'no-show' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsNoShow(reservation.id)}
                          disabled={markAsNoShowMutation.isPending}
                          className="text-xs"
                        >
                          Не обрабатывать
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Card View */
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
        )
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
