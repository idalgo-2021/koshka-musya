"use client"

import { useState } from 'react'
import { useProfiles } from '@/entities/profiles/useProfiles'
import { ProfilesFilters } from '@/entities/profiles/types'
import ProfileCard from '@/components/ProfileCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ToggleButton } from '@/components/ToggleButton'
import { useResponsiveToggle } from '@/hooks/useResponsiveToggle'
import * as React from "react"

const ITEMS_PER_PAGE = 10

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActivityStatus = (lastActiveAt: string) => {
  const lastActive = new Date(lastActiveAt)
  const now = new Date()
  const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)

  if (diffHours < 1) return { label: 'Онлайн', color: 'bg-green-100 text-green-800' }
  if (diffHours < 24) return { label: 'Недавно', color: 'bg-yellow-100 text-yellow-800' }
  if (diffHours < 168) return { label: 'На этой неделе', color: 'bg-blue-100 text-blue-800' }
  return { label: 'Давно', color: 'bg-gray-100 text-gray-800' }
}

export default function ProfileTab() {
  const [filters, setFilters] = useState<ProfilesFilters>({
    page: 1,
    limit: ITEMS_PER_PAGE
  })

  const [isTableView, toggle] = useResponsiveToggle(false, 'profiles-view')
  const { data, isLoading, error, refetch } = useProfiles(filters)

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0
  const currentPage = filters.page || 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профилей...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка загрузки профилей</p>
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
          {/* <p className="text-gray-600 mt-1">
            Управление профилями и статистикой пользователей
          </p> */}
        </div>
        <ToggleButton
          checked={isTableView}
          onToggle={toggle}
        />
      </div>

      {/* Results Info */}
      {data?.profiles?.length && (
        <div className="text-sm text-gray-600">
          Показано {data.profiles.length} из {data.total} профилей
        </div>
      )}

      {/* Profiles Display */}
      {data && data.profiles?.length > 0 ? (
        isTableView ? (
          /* Table View */
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Пользователь</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Регистрация</th>
                  {/*<th className="px-3 py-2 text-left font-medium">Последняя активность</th>*/}
                  <th className="px-3 py-2 text-left font-medium">Статистика</th>
                  <th className="px-3 py-2 text-left font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {data.profiles.map((profile) => {
                  const activityStatus = getActivityStatus(profile.last_active_at)
                  return (
                    <tr key={profile.id} className="border-t">
                      <td className="px-3 py-2">
                        <div>
                          <div className="font-medium">{profile.username}</div>
                          <div className="text-xs text-gray-500">ID: {profile.user_id}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">{profile.email}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          {formatDate(profile.registered_at)}
                        </div>
                      </td>
                      {/*<td className="px-3 py-2">*/}
                      {/*  <div className="text-xs">*/}
                      {/*    {formatDate(profile.last_active_at)}*/}
                      {/*  </div>*/}
                      {/*</td>*/}
                      <td className="px-3 py-2">
                        <div className="text-xs space-y-1">
                          <div>Принято: <span className="font-medium text-green-600">{profile.accepted_offers_count}</span></div>
                          <div>Отчетов: <span className="font-medium text-blue-600">{profile.submitted_reports_count}</span></div>
                          <div>Правильных: <span className="font-medium text-purple-600">{profile.correct_reports_count}</span></div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activityStatus.color}`}>
                          {activityStatus.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Профили не найдены</p>
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
