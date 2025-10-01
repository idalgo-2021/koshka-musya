"use client"

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyToClipboard } from '@/components/CopyToClipboard'
import type { Assignment } from '@/entities/assignments/types'
import { formatDate } from "@/lib/date"
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
  Eye
} from 'lucide-react'
import Image from 'next/image'

// Function to get badge color classes based on status
export const getStatusBadgeClasses = (statusId?: number) => {
  switch (statusId) {
    case 1: // offered
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 2: // accepted
      return 'bg-green-100 text-green-800 border-green-200'
    case 3: // cancelled
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 4: // declined
      return 'bg-red-100 text-red-800 border-red-200'
    case 5: // expired
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

interface AssignmentCardProps {
  assignment: Assignment
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
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

  return (
    <Card className="group py-0 my-0 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary/20">
      {/* Header with Image */}
      <div className="relative">
        {assignment.listing?.main_picture && (
          <div className="h-32 relative overflow-hidden">
            <Image
              src={assignment.listing.main_picture}
              alt={assignment.listing.title || 'Property image'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(assignment.status?.id)}`}>
                {assignment.status?.name || 'No Status'}
              </span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Title and ID */}
          <div className="space-y-2">
            <Link
              href={`/admin/assignments/${assignment.id}`}
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {assignment.listing?.title || 'Задание без названия'}
              </h3>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
             
              {assignment.reservation_id && assignment.booking_number && (
                <Badge variant="outline" className="text-xs">
                  Бронь: <CopyToClipboard text={assignment.booking_number} showIcon={false} />
                </Badge>
              )}
            </div>
          </div>

          {/* Purpose */}
          {assignment.purpose && (
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground line-clamp-2">{assignment.purpose}</p>
            </div>
          )}

          {/* Property Info */}
          {assignment.listing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm">
                  {assignment.listing.listing_type?.name && (
                    <Badge variant="secondary" className="text-xs mr-2">
                      {assignment.listing.listing_type.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">
                    {[assignment.listing.city, assignment.listing.country].filter(Boolean).join(', ')}
                  </span>
                  {assignment.listing.address && (
                    <span className="text-muted-foreground">{assignment.listing.address}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dates and Guests */}
          <div className="grid grid-cols-2 gap-4">
            {/* Dates */}
            {(assignment.dates?.checkin || assignment.dates?.checkout) && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Даты</span>
                </div>
                <div className="text-sm">
                  {assignment.dates.checkin && (
                    <div>Заезд: {formatDate(assignment.dates.checkin)}</div>
                  )}
                  {assignment.dates.checkout && (
                    <div>Выезд: {formatDate(assignment.dates.checkout)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Guests */}
            {assignment.guests && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>Гости</span>
                </div>
                <div className="text-sm font-medium">
                  {formatGuests(assignment.guests.adults, assignment.guests.children)}
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          {assignment.pricing?.pricing && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="w-3 h-3" />
                <span>Стоимость</span>
              </div>
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
          )}

          {/* Reporter and Dates */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>Репортер</span>
              </div>
              <div className="text-sm">
                {assignment.reporter?.username ? (
                  <span className="font-medium">{assignment.reporter.username}</span>
                ) : (
                  <span className="text-muted-foreground">Не назначен</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Создано</span>
              </div>
              <div className="text-sm">
                {assignment.created_at && formatDate(assignment.created_at)}
              </div>
            </div>
          </div>

          {/* Deadline */}
          {assignment.deadline && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="w-4 h-4 text-orange-600" />
              <div className="text-sm">
                <div className="font-medium text-orange-800">Дедлайн</div>
                <div className="text-orange-600">{formatDate(assignment.deadline)}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/admin/assignments/${assignment.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Подробнее
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
        </div>
      </CardContent>
    </Card>
  )
}
