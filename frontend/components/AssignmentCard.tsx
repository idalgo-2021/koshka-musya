"use client"

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Assignment } from '@/entities/assignments/types'
import {formatDate} from "@/lib/date";

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
  return (
    <Card className="pt-2 pb-2 hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
      <CardContent className="p-3">
        <a href={`/admin/assignments/${assignment.id}`}>
          <div className="space-y-3">
            {/* Title/ID Section */}
            <div>
              <Link
                href={`/admin/assignments/${assignment.id}`}
                className="text-sm font-medium text-primary hover:underline line-clamp-2"
              >
                Задание в {assignment.listing?.title}
              </Link>
            </div>

            {/* Status Badge */}
            <div>
              <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(assignment.status?.id)}`}>
                {assignment.status?.name || 'No Status'}
              </span>
            </div>

            {/* Reporter Info */}
            <div className="text-sm gap-2">
              <span className="text-muted-foreground">Тайный гость:</span>
              <span className="font-medium">{assignment.reporter?.username || 'Unknown'}</span>
            </div>
            {assignment.deadline && (
              <div className="text-sm gap-2">
                <span className="text-muted-foreground">Дедлайн:</span>
                <span className="font-medium">{formatDate(assignment.deadline)}</span>
              </div>
            )}

            {/* Listing Info */}
            {assignment.listing && (
              <div className="text-sm">
                <div className="text-muted-foreground">Объект:</div>
                {assignment.listing.id ? (
                  <Link
                    href={`/admin/listings/${assignment.listing.id}`}
                    className="font-medium text-primary hover:underline line-clamp-2"
                  >
                    {assignment.listing.city + ' ' + assignment.listing.address}
                  </Link>
                ) : (
                  <div className="font-medium">{assignment.listing.city + ' ' + assignment.listing.address}</div>
                )}
              </div>
            )}

            {/* Guests Info */}
            {assignment.guests && (
              <div className="text-sm gap-2">
                <span className="text-muted-foreground">Гости:</span>
                <span className="font-medium">
                  {assignment.guests.adults} взросл{assignment.guests.adults === 1 ? 'ый' : assignment.guests.adults < 5 ? 'ых' : 'ых'}
                  {assignment.guests.children > 0 && (
                    <span>, {assignment.guests.children} дет{assignment.guests.children === 1 ? 'ь' : assignment.guests.children < 5 ? 'ей' : 'ей'}</span>
                  )}
                </span>
              </div>
            )}

            {/* Pricing Info */}
            {assignment.pricing && (
              <div className="text-sm gap-2">
                <span className="text-muted-foreground">Стоимость:</span>
                <span className="font-medium">
                  {assignment.pricing.total} {assignment.pricing.currency}
                  {assignment.pricing.breakdown && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({assignment.pricing.breakdown.nights} ноч{assignment.pricing.breakdown.nights === 1 ? 'ь' : assignment.pricing.breakdown.nights < 5 ? 'и' : 'ей'}, {assignment.pricing.breakdown.per_night} {assignment.pricing.currency}/ночь)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </a>
      </CardContent>
    </Card>
  )
}
