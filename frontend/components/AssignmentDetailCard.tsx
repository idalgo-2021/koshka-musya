"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyToClipboard } from '@/components/CopyToClipboard'
import { formatDate } from '@/lib/date'
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Clock,
  Building,
  User,
  Target,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {isValidReportId} from "@/entities/reports/const";

interface AssignmentDetailData {
  id: string
  reservation_id?: string
  pricing?: {
    pricing?: {
      total: number
      currency: string
      breakdown?: {
        nights: number
        per_night: number
      }
    }
  }
  guests?: {
    adults: number
    children: number
  }
  dates?: {
    checkin?: string
    checkout?: string
  }
  purpose: string
  listing: {
    id: string
    code?: string
    title: string
    description: string
    main_picture?: string
    listing_type?: {
      id: number
      slug: string
      name: string
    }
    address?: string
    city?: string
    country?: string
    latitude?: number
    longitude?: number
  }
  reporter: {
    id: string
    username: string
  }
  status: {
    id: number
    slug: string
    name: string
  }
  created_at: string
  expires_at: string
}

interface AssignmentDetailCardProps {
  assignment: AssignmentDetailData
}

export function AssignmentDetailCard({ assignment }: AssignmentDetailCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: { slug: string; name: string }) => {
    const getStatusStyles = (slug: string) => {
      switch (slug) {
        case 'offered':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-200'
          }
        case 'accepted':
          return {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200'
          }
        case 'pending':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-200'
          }
        case 'completed':
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-200'
          }
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-200'
          }
      }
    }

    const styles = getStatusStyles(status.slug)

    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${styles.bg} ${styles.text} ${styles.border}`}>
        {status.name}
      </span>
    )
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="overflow-hidden">
        <div className="relative">
          {assignment.listing.main_picture && (
            <div className="h-64 relative overflow-hidden">
              <Image
                src={assignment.listing.main_picture}
                alt={assignment.listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  {assignment.listing.title}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <Building className="w-4 h-4" />
                  {assignment.listing.listing_type && (
                    <>
                      <span className="text-sm">{assignment.listing.listing_type.name}</span>
                      <span className="text-white/60">•</span>
                    </>
                  )}
                  <span className="text-sm">
                    {[assignment.listing.city, assignment.listing.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {getStatusBadge(assignment.status)}
                <Badge variant="outline" className="text-xs">
                  ID: <CopyToClipboard text={assignment.id} showIcon={false} />
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Создано: {formatDate(assignment.created_at)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Срок действия</div>
              <div className="font-medium text-orange-600">
                {formatDate(assignment?.expires_at)}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Детали задания
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Цель</div>
                <p className="text-sm">{assignment.purpose}</p>
              </div>

              {assignment.reservation_id && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">ID бронирования</div>
                  <CopyToClipboard text={assignment.reservation_id} />
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Статус</div>
                {getStatusBadge(assignment.status)}
              </div>
            </CardContent>
          </Card>

          {/* Dates & Guests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Даты и гости
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignment.dates && (assignment.dates.checkin || assignment.dates.checkout) && (
                <div className="grid grid-cols-2 gap-4">
                  {assignment.dates.checkin && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Заезд</div>
                      <div className="text-sm font-medium">
                        {formatDate(assignment.dates.checkin)}
                      </div>
                    </div>
                  )}
                  {assignment.dates.checkout && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Выезд</div>
                      <div className="text-sm font-medium">
                        {formatDate(assignment.dates.checkout)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {assignment.guests && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Гости</div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatGuests(assignment.guests.adults, assignment.guests.children)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          {assignment.pricing?.pricing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Стоимость
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(assignment.pricing.pricing.total, assignment.pricing.pricing.currency)}
                  </div>
                  <div className="text-sm text-green-600">Общая стоимость</div>
                </div>

                {assignment.pricing.pricing.breakdown && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{assignment.pricing.pricing.breakdown.nights}</div>
                      <div className="text-muted-foreground">ночей</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">
                        {formatCurrency(assignment.pricing.pricing.breakdown.per_night, assignment.pricing.pricing.currency)}
                      </div>
                      <div className="text-muted-foreground">за ночь</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Информация об объекте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Название</div>
                <div className="font-medium">{assignment.listing.title}</div>
              </div>

              {assignment.listing.code && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Код объекта</div>
                  <CopyToClipboard text={assignment.listing.code} />
                </div>
              )}

              {assignment.listing.listing_type && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Тип</div>
                  <Badge variant="secondary">
                    {assignment.listing.listing_type.name}
                  </Badge>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Описание</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {assignment.listing.description}
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Адрес</div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    {assignment.listing.address && <div>{assignment.listing.address}</div>}
                    <div className="text-muted-foreground">
                      {[assignment.listing.city, assignment.listing.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>

                {assignment.listing.latitude && assignment.listing.longitude && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    asChild
                  >
                    <a
                      href={getMapUrl(assignment.listing.latitude, assignment.listing.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Открыть на карте
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reporter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Информация о репортере
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">ID репортера</div>
                {isValidReportId(assignment.reporter?.id) ? (
                  <CopyToClipboard text={assignment.reporter.id} />
                ): 'Не взято в работу'}
              </div>

              {assignment.reporter.username && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Имя пользователя</div>
                  <div className="text-sm font-medium">{assignment.reporter.username}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/admin/listings/${assignment.listing.id}`}>
                  <Building className="w-4 h-4 mr-2" />
                  Просмотреть объект
                </Link>
              </Button>

              {assignment.listing.latitude && assignment.listing.longitude && (
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={getMapUrl(assignment.listing.latitude, assignment.listing.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть на карте
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
