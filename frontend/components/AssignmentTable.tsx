"use client"

import * as React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyToClipboard } from '@/components/CopyToClipboard'
import type { Assignment } from '@/entities/assignments/types'
import { formatDate } from "@/lib/date"
import { getStatusBadgeClasses } from './AssignmentCard'
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Clock,
  Building,
  User,
  Target,
  ExternalLink,
  Eye,
  Hash,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface AssignmentTableProps {
  assignments: Assignment[]
}

type SortField = 'code' | 'reporter' | 'status' | 'expires_at' | 'listing' | 'created_at'
type SortDirection = 'asc' | 'desc' | null

export function AssignmentTable({ assignments }: AssignmentTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const [sortField, setSortField] = React.useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4" />
    }
    return <ArrowUpDown className="w-4 h-4" />
  }

  const sortedAssignments = React.useMemo(() => {
    if (!sortField || !sortDirection) {
      return assignments
    }

    return [...assignments].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'code':
          aValue = a.code || ''
          bValue = b.code || ''
          break
        case 'reporter':
          aValue = a.reporter?.username || ''
          bValue = b.reporter?.username || ''
          break
        case 'status':
          aValue = a.status?.name || ''
          bValue = b.status?.name || ''
          break
        case 'expires_at':
          aValue = a?.expires_at ? new Date(a?.expires_at).getTime() : 0
          bValue = b?.expires_at ? new Date(b?.expires_at).getTime() : 0
          break
        case 'listing':
          aValue = a.listing?.title || ''
          bValue = b.listing?.title || ''
          break
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [assignments, sortField, sortDirection])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatGuests = (adults: number, children: number) => {
    const parts = []
    if (adults > 0) {
      parts.push(`${adults} ${adults === 1 ? 'взрослый' : adults < 5 ? 'взрослых' : 'взрослых'}`)
    }
    if (children > 0) {
      parts.push(`${children} ${children === 1 ? 'ребенок' : children < 5 ? 'ребенка' : 'детей'}`)
    }
    return parts.join(', ')
  }

  const getMapUrl = (lat: number, lng: number) => {
    return `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Building className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Задания не найдены</h3>
        <p className="text-muted-foreground">Попробуйте изменить фильтры или создать новое задание.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-8">
                {/* Expand column */}
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Код
                    {getSortIcon('code')}
                  </div>
                </Button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('reporter')}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Репортер
                    {getSortIcon('reporter')}
                  </div>
                </Button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Статус
                    {getSortIcon('status')}
                  </div>
                </Button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('expires_at')}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Срок
                    {getSortIcon('expires_at')}
                  </div>
                </Button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden xl:table-cell">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('listing')}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Объект
                    {getSortIcon('listing')}
                  </div>
                </Button>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Действия
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.map((assignment) => {
              const isExpanded = expandedRows.has(assignment.id)

              return (
                <React.Fragment key={assignment.id}>
                  {/* Main Row */}
                  <tr className="border-b transition-colors hover:bg-muted/50 group">
                    {/* Expand Button */}
                    <td className="p-4 align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleRow(assignment.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </td>

                    {/* Code */}
                    <td className="p-4 align-middle">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {assignment.code || 'N/A'}
                        </div>
                        {assignment.reservation_id && (
                          <div className="text-xs text-muted-foreground">
                            Бронь: <CopyToClipboard text={assignment.reservation_id} showIcon={false} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="p-4 align-middle text-sm hidden sm:table-cell">
                      {assignment.reporter?.username ? (
                        <div className="space-y-1">
                          <div className="font-medium">{assignment.reporter.username}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: <CopyToClipboard text={assignment.reporter.id} showIcon={false} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Не назначен</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 align-middle hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(assignment.status?.id)}`}>
                        {assignment.status?.name || 'No Status'}
                      </span>
                    </td>

                    {/* Expires At */}
                    <td className="p-4 align-middle text-sm hidden lg:table-cell">
                      <div className="space-y-1">
                        {assignment?.expires_at && (
                          <div className="font-medium">
                            {formatDate(assignment?.expires_at)}
                          </div>
                        )}
                        {assignment?.deadline && (
                          <div className="text-xs text-orange-600">
                            Дедлайн: {formatDate(assignment?.deadline)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Listing */}
                    <td className="p-4 align-middle text-sm hidden xl:table-cell">
                      {assignment.listing ? (
                        <div className="space-y-1">
                          <div className="font-medium">
                            {assignment.listing.id ? (
                              <Link
                                href={`/admin/listings/${assignment.listing.id}`}
                                className="hover:underline hover:text-primary"
                              >
                                {assignment.listing.title}
                              </Link>
                            ) : (
                              assignment.listing.title
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {[assignment.listing.city, assignment.listing.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/assignments/${assignment.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>

                        {assignment.listing?.id && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/listings/${assignment.listing.id}`}>
                              <Building className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}

                        {assignment.listing?.latitude && assignment.listing?.longitude && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={getMapUrl(assignment.listing.latitude, assignment.listing.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="border-b bg-muted/25">
                      <td colSpan={7} className="p-0">
                        <div className="p-6 space-y-6">
                          {/* Purpose */}
                          {assignment.purpose && (
                            <div className="flex items-start gap-3">
                              <Target className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Цель задания</div>
                                <p className="text-sm">{assignment.purpose}</p>
                              </div>
                            </div>
                          )}

                          {/* Property Details */}
                          {assignment.listing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <Building className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Информация об объекте</div>
                                    <div className="space-y-1">
                                      <div className="font-medium">{assignment.listing.title}</div>
                                      {assignment.listing.listing_type && (
                                        <Badge variant="secondary" className="text-xs">
                                          {assignment.listing.listing_type.name}
                                        </Badge>
                                      )}
                                      {assignment.listing.code && (
                                        <div className="text-sm text-muted-foreground">
                                          Код: {assignment.listing.code}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Адрес</div>
                                    <div className="text-sm">
                                      {assignment.listing.address && (
                                        <div>{assignment.listing.address}</div>
                                      )}
                                      <div className="text-muted-foreground">
                                        {[assignment.listing.city, assignment.listing.country].filter(Boolean).join(', ')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {/* Dates */}
                                {(assignment.dates?.checkin || assignment.dates?.checkout) && (
                                  <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium text-muted-foreground">Даты</div>
                                      <div className="text-sm space-y-1">
                                        {assignment.dates.checkin && (
                                          <div>Заезд: {formatDate(assignment.dates.checkin)}</div>
                                        )}
                                        {assignment.dates.checkout && (
                                          <div>Выезд: {formatDate(assignment.dates.checkout)}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Guests */}
                                {assignment.guests && (
                                  <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium text-muted-foreground">Гости</div>
                                      <div className="text-sm font-medium">
                                        {formatGuests(assignment.guests.adults, assignment.guests.children)}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Pricing */}
                                {assignment.pricing?.pricing && (
                                  <div className="flex items-start gap-3">
                                    <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium text-muted-foreground">Стоимость</div>
                                      <div className="text-sm">
                                        <div className="font-semibold text-green-600">
                                          {formatCurrency(assignment.pricing.pricing.total, assignment.pricing.pricing.currency)}
                                        </div>
                                        {assignment.pricing.pricing.breakdown && (
                                          <div className="text-xs text-muted-foreground">
                                            {assignment.pricing.pricing.breakdown.nights} ноч. × {formatCurrency(assignment.pricing.pricing.breakdown.per_night, assignment.pricing.pricing.currency)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Creation Date */}
                          {assignment.created_at && (
                            <div className="flex items-center gap-3 pt-4 border-t">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                              <div className="text-sm">
                                <span className="text-muted-foreground">Создано: </span>
                                <span className="font-medium">{formatDate(assignment.created_at)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
