"use client"

import { SgReservation } from '@/entities/sgReservations/types'
import { STATUS_COLORS } from '@/entities/sgReservations/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, User, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import ConfirmationModal from '@/components/ConfirmationModal'
import { useState } from 'react'

interface SgReservationCardProps {
  reservation: SgReservation
  onMarkAsNoShow: (id: string) => void
  isMarkingAsNoShow?: boolean
}

const calculateDays = (checkin: string, checkout: string) => {
  const checkinDate = new Date(checkin)
  const checkoutDate = new Date(checkout)
  const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const formatPricePerDay = (pricing: any, days: number) => {
  if (!pricing?.pricing || days === 0) return 'N/A'
  const { total, currency } = pricing.pricing
  const pricePerDay = Math.round(total / days)
  return `${pricePerDay.toLocaleString()} ${currency}/день`
}

export default function SgReservationCard({
  reservation,
  onMarkAsNoShow,
  isMarkingAsNoShow = false
}: SgReservationCardProps) {
  const [showNoShowModal, setShowNoShowModal] = useState(false)

  const daysCount = calculateDays(reservation.CheckinDate, reservation.CheckoutDate)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPrice = (pricing: any) => {
    if (!pricing?.pricing) return 'N/A'
    const { total, currency } = pricing.pricing
    return `${total.toLocaleString()} ${currency}`
  }

  const formatGuests = (guests: any) => {
    if (!guests) return 'N/A'

    // Handle different guest data structures
    if (typeof guests === 'object') {
      if (guests.adults && guests.children) {
        return `${guests.adults} взрослых${guests.children > 0 ? `, ${guests.children} детей` : ''}`
      }
      if (guests.total) {
        return `${guests.total} гостей`
      }
      if (guests.count) {
        return `${guests.count} гостей`
      }
      // If it's an object with guest details
      const guestCount = Object.keys(guests).length
      return guestCount > 0 ? `${guestCount} гостей` : 'N/A'
    }

    return guests.toString()
  }
  const handleMarkAsNoShow = () => {
    onMarkAsNoShow(reservation.id)
    setShowNoShowModal(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200 gap-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                {reservation.BookingNumber}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Listing ID: {reservation.ListingID}</span>
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs font-medium",
                STATUS_COLORS[reservation.status.slug as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
              )}
            >
              {reservation.status.name}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              {formatDate(reservation.CheckinDate)} - {formatDate(reservation.CheckoutDate)}
            </span>
          </div>

          {/* Days Count */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Продолжительность:</span> {daysCount} {daysCount === 1 ? 'день' : daysCount < 5 ? 'дня' : 'дней'}
          </div>

          {/* Pricing */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Стоимость:</span> {formatPrice(reservation.pricing)}
          </div>

          {/* Price Per Day */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Цена за день:</span> {formatPricePerDay(reservation.pricing, daysCount)}
          </div>

          {/* Guests */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              <span className="font-medium">Гости:</span> {formatGuests(reservation.guests)}
            </span>
          </div>

          {/* OTA ID */}
          <div className="text-sm text-gray-500">
            OTA ID: {reservation.ota_id}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {reservation.status.slug !== 'no-show' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNoShowModal(true)}
                disabled={isMarkingAsNoShow}
                className="flex items-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                {isMarkingAsNoShow ? 'Обработка...' : 'Не обрабатывать'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No-Show Confirmation Modal */}
      {showNoShowModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ConfirmationModal
            title="Отметить как не обрабатывать"
            message={`Вы уверены, что хотите отметить резервацию "${reservation.BookingNumber}" как не обрабатывать?`}
            type="warning"
            confirmText="Отметить"
            cancelText="Отмена"
            onConfirm={handleMarkAsNoShow}
            onCancel={() => setShowNoShowModal(false)}
            isLoading={isMarkingAsNoShow}
          />
        </div>
      )}
    </>
  )
}
