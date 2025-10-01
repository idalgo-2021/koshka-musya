"use client"

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {redirect, useRouter} from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select'
import {RefreshCw, StepBackIcon} from 'lucide-react'

import { sgReservationsApi } from '@/entities/sgReservations/api'
import { CreateSGReservationRequest } from '@/entities/sgReservations/types'
import { USER_ROLE } from '@/entities/auth/useAuth'
import { ListingsApi } from '@/entities/listings/api'
import {SG_RESERVATION_STATUSES} from "@/entities/sgReservations/constants";
import {toast} from "sonner";
import {useUser} from "@/entities/auth/SessionContext";

// Form validation schema
const reservationSchema = z.object({
  received_at: z.string().min(1, 'Дата получения обязательна'),
  booking_number: z.string().min(1, 'Номер бронирования обязателен'),
  checkin: z.string().min(1, 'Дата заезда обязательна'),
  checkout: z.string().min(1, 'Дата выезда обязательна'),
  adults: z.number().min(1, 'Количество взрослых должно быть больше 0'),
  children: z.number().min(0, 'Количество детей не может быть отрицательным'),
  listing_id: z.string().min(1, 'Объект размещения обязателен'),
  ota_id: z.string().min(1, 'OTA ID обязателен'),
  nights: z.number().min(1, 'Количество ночей должно быть больше 0'),
  per_night: z.number().min(0, 'Цена за ночь не может быть отрицательной'),
  currency: z.string().min(1, 'Валюта обязательна'),
  total: z.number().min(0, 'Общая сумма не может быть отрицательной'),
  status: z.string().min(1, 'Статус обязателен'),
  source: z.string().min(1, 'Источник обязателен'),
})

type ReservationFormValues = z.infer<typeof reservationSchema>

// Format dates to ISO 8601 with timezone
const formatDateToISO = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString()
}
export default function SGReservationsPage() {
  const user = useUser()
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (user && user.role !== USER_ROLE.Admin) {
      redirect('/dashboard')
    }
  }, [user])

  // Fetch listing types and listings
  // const { data: listingTypesData } = useQuery({
  //   queryKey: ['listing_types'],
  //   queryFn: () => ListingsApi.getListingTypes(),
  // })

  const { data: listingsData } = useQuery({
    queryKey: ['listings'],
    queryFn: () => ListingsApi.getPublicListings(1, 100), // Fetch first 100 listings
  })

  // Use hardcoded reservation statuses
  const reservationStatuses = SG_RESERVATION_STATUSES

  // Generate UUID function
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Form setup
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      received_at: new Date().toISOString().slice(0, 16), // Current datetime
      adults: 1,
      children: 0,
      nights: 1,
      per_night: 100,
      currency: 'RUB',
      total: 100,
      ota_id: generateUUID(), // Auto-generate OTA ID
    },
  })


  // Create reservation mutation
  const createReservationMutation = useMutation({
    mutationFn: (data: CreateSGReservationRequest) => sgReservationsApi.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sg_reservations'] })
      form.reset()
      toast.success('Бронирование создано');
      router.push('/admin/sg_reservations');
      // Show success message (you can add toast notification here)
    },
    onError: (error) => {
      console.error('Error creating reservation:', error)
      toast.error('Произошла ошибка при создании бронирования');
    },
  })

  // Calculate total when nights or per_night changes
  const watchedNights = form.watch('nights')
  const watchedPerNight = form.watch('per_night')
  const watchedCheckin = form.watch('checkin')
  const watchedCheckout = form.watch('checkout')

  // Calculate nights between checkin and checkout dates
  React.useEffect(() => {
    if (watchedCheckin && watchedCheckout) {
      const checkinDate = new Date(watchedCheckin)
      const checkoutDate = new Date(watchedCheckout)

      if (checkoutDate > checkinDate) {
        const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        form.setValue('nights', diffDays)
      }
    }
  }, [watchedCheckin, watchedCheckout, form])

  React.useEffect(() => {
    const total = watchedNights * watchedPerNight
    form.setValue('total', total)
  }, [watchedNights, watchedPerNight, form])

  const onSubmit = (data: ReservationFormValues) => {
    // Find selected listing
    const selectedListing = listingsData?.listings?.find(listing => listing.id === data.listing_id)
    if (!selectedListing) {
      toast.error('Пожалуйста, выберите объект размещения');
      return
    }

    // Find selected status
    const selectedStatus = reservationStatuses?.find(rs => rs.id.toString() === data.status)
    if (!selectedStatus) {
      toast.error('Произошла ошибка при создании бронирования');
      return
    }

    const reservationData: CreateSGReservationRequest = {
      received_at: formatDateToISO(data.received_at),
      source: data.source,
      reservation: {
        booking_number: data.booking_number,
        dates: {
          checkin: formatDateToISO(data.checkin),
          checkout: formatDateToISO(data.checkout),
        },
        guests: {
          adults: data.adults,
          children: data.children,
        },
        listing: {
          id: selectedListing.id,
          title: selectedListing.title,
          description: selectedListing.description,
          address: selectedListing.address,
          city: selectedListing.city,
          country: selectedListing.country,
          latitude: selectedListing.latitude,
          longitude: selectedListing.longitude,
          main_picture: selectedListing.main_picture || 'https://cdn.worldota.net/t/1200x616/extranet/c6/81/c681b19c8d17548d22f3800e7266ecc361f258f1.jpeg',
          listing_type: {
            id: selectedListing.listing_type.id,
            name: selectedListing.listing_type.name,
            slug: selectedListing.listing_type.slug,
          },
        },
        ota_id: data.ota_id,
        pricing: {
          breakdown: {
            nights: data.nights,
            per_night: data.per_night,
          },
          currency: data.currency,
          total: data.total,
        },
        status: selectedStatus.slug,
      },
    }

    createReservationMutation.mutate(reservationData)
  }

  const router = useRouter();

  if (!user || user.role !== USER_ROLE.Admin) {
    return <div>Loading...</div>
    // return redirect('/dashboard');
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
        <h1 className="text-2xl font-semibold">SG Reservations</h1>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Создать новое бронирование</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="received_at">Дата получения</Label>
                <Input
                  id="received_at"
                  type="datetime-local"
                  {...form.register('received_at')}
                />
                {form.formState.errors.received_at && (
                  <p className="text-sm text-red-600">{form.formState.errors.received_at.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_number">Номер бронирования</Label>
                <Input
                  id="booking_number"
                  {...form.register('booking_number')}
                  placeholder="BK123456"
                />
                {form.formState.errors.booking_number && (
                  <p className="text-sm text-red-600">{form.formState.errors.booking_number.message}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin">Дата заезда</Label>
                <Input
                  id="checkin"
                  type="date"
                  {...form.register('checkin')}
                />
                {form.formState.errors.checkin && (
                  <p className="text-sm text-red-600">{form.formState.errors.checkin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout">Дата выезда</Label>
                <Input
                  id="checkout"
                  type="date"
                  {...form.register('checkout')}
                />
                {form.formState.errors.checkout && (
                  <p className="text-sm text-red-600">{form.formState.errors.checkout.message}</p>
                )}
              </div>
            </div>

            {/* Guests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Взрослые</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  {...form.register('adults', { valueAsNumber: true })}
                />
                {form.formState.errors.adults && (
                  <p className="text-sm text-red-600">{form.formState.errors.adults.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Дети</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  {...form.register('children', { valueAsNumber: true })}
                />
                {form.formState.errors.children && (
                  <p className="text-sm text-red-600">{form.formState.errors.children.message}</p>
                )}
              </div>
            </div>

            {/* Listing and OTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listing_id">Объект размещения</Label>
                <Select
                  value={form.watch('listing_id') || ''}
                  onChange={(value) => form.setValue('listing_id', String(value || ''))}
                  placeholder="Выберите объект размещения"
                  options={listingsData?.listings?.map((listing) => ({
                    value: listing.id,
                    label: `${listing.title} (${listing.listing_type?.name})`
                  })) || []}
                />
                {form.formState.errors.listing_id && (
                  <p className="text-sm text-red-600">{form.formState.errors.listing_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ota_id">OTA ID (автоматически)</Label>
                <div className="flex gap-2">
                  <Input
                    id="ota_id"
                    {...form.register('ota_id')}
                    placeholder="Автоматически сгенерированный ID"
                    className="flex-1 bg-gray-50"
                    readOnly
                    disabled
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('ota_id', generateUUID())}
                    className="px-3"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                {form.formState.errors.ota_id && (
                  <p className="text-sm text-red-600">{form.formState.errors.ota_id.message}</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nights">Ночи</Label>
                <Input
                  id="nights"
                  type="number"
                  min="1"
                  {...form.register('nights', { valueAsNumber: true })}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
                {form.formState.errors.nights && (
                  <p className="text-sm text-red-600">{form.formState.errors.nights.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="per_night">Цена за ночь</Label>
                <Input
                  id="per_night"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register('per_night', { valueAsNumber: true })}
                />
                {form.formState.errors.per_night && (
                  <p className="text-sm text-red-600">{form.formState.errors.per_night.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Валюта</Label>
                <Select
                  value={form.watch('currency') || 'RUB'}
                  onChange={(value) => form.setValue('currency', String(value || 'RUB'))}
                  options={[
                    { value: 'RUB', label: 'RUB' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                  ]}
                />
                {form.formState.errors.currency && (
                  <p className="text-sm text-red-600">{form.formState.errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">Общая сумма</Label>
                <Input
                  id="total"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register('total', { valueAsNumber: true })}
                  readOnly
                />
                {form.formState.errors.total && (
                  <p className="text-sm text-red-600">{form.formState.errors.total.message}</p>
                )}
              </div>
            </div>

            {/* Status and Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={form.watch('status') || ''}
                  onChange={(value) => form.setValue('status', String(value || ''))}
                  placeholder="Выберите статус"
                  options={reservationStatuses?.map((status) => ({
                    value: status.id.toString(),
                    label: status.name
                  })) || []}
                />
                {form.formState.errors.status && (
                  <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Источник</Label>
                <Input
                  id="source"
                  {...form.register('source')}
                  placeholder="booking.com, expedia.com"
                />
                {form.formState.errors.source && (
                  <p className="text-sm text-red-600">{form.formState.errors.source.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createReservationMutation.isPending}
                className="min-w-32"
              >
                {createReservationMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    Создание...
                  </div>
                ) : (
                  'Создать бронирование'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
