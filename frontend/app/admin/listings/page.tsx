"use client"

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleButton } from '@/components/ToggleButton'
import { useResponsiveToggle } from '@/hooks/useResponsiveToggle'

import { ListingsApi } from '@/entities/listings/api'
import {useAuth, USER_ROLE} from "@/entities/auth/useAuth";
import {Plus} from "lucide-react";

export default function ListingsPage() {
  const [page, setPage] = React.useState(1)
  const limit = 12
  const [isShow, setIsShow] = useResponsiveToggle(false, 'listings-view-mode') // false = card view, true = table view
  type ListingItem = { id: string; title: string;  main_picture?: string; description: string; code: string; address: string; city: string; country: string; latitude: number; longitude: number; listing_type: { id: number; name: string; slug: string }; }
  type PublicListingsResponse = { listings: ListingItem[]; page: number; total: number }
  const { data, isLoading, isError, error } = useQuery<PublicListingsResponse>({
    queryKey: ['public_listings', { page, limit }],
    queryFn: () => ListingsApi.getPublicListings(page, limit) as Promise<PublicListingsResponse>,
    placeholderData: keepPreviousData,
  })

  const { user } = useAuth();
  if (isLoading) return <div className="p-6">Loading...</div>
  if (isError) return <div className="p-6 text-red-600 text-sm">{(error as Error)?.message || 'Failed to load listings'}</div>

  const listings = data?.listings || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-md md:text-2xl font-semibold">Объекты размещения</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground hidden sm:block">Страница {page} / {totalPages}</div>
          {user?.role === USER_ROLE.Admin  && (
            <Button asChild>
              <Link href="/admin/listings/new">
                <Plus className="w-4 h-4 mr-2" />
                Добавить объект
              </Link>
            </Button>
          )}
        </div>
        <Link href={`/admin/listingTypes`} className="hover:underline">
          Типы объектов
        </Link>
      </div>
      <ToggleButton checked={isShow} onToggle={setIsShow} />

      {isShow ? (
        // Table View
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">Фото</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">Название</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">Код</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Адрес</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Тип</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden xl:table-cell">Описание</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l: ListingItem) => (
                  <tr key={l.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-2 md:p-4 align-middle">
                      {l.main_picture ? (
                        <div className="relative h-12 w-12 md:h-16 md:w-16 overflow-hidden rounded-md border">
                          <Image
                            src={l.main_picture}
                            alt={l.title}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-md border bg-muted/40" />
                      )}
                    </td>
                    <td className="p-2 md:p-4 align-middle">
                      <Link href={`/admin/listings/${l.id}`} className="font-medium hover:underline">
                        {l.title}
                      </Link>
                      <div className="text-xs text-muted-foreground sm:hidden">{l.code}</div>
                    </td>
                    <td className="p-2 md:p-4 align-middle text-sm text-muted-foreground hidden sm:table-cell">
                      {l.code}
                    </td>
                    <td className="p-2 md:p-4 align-middle text-sm hidden md:table-cell">
                      <div>{l.city}, {l.country}</div>
                      <div className="text-xs text-muted-foreground">{l.address}</div>
                    </td>
                    <td className="p-2 md:p-4 align-middle hidden lg:table-cell">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {l.listing_type?.name}
                      </span>
                    </td>
                    <td className="p-2 md:p-4 align-middle text-sm text-muted-foreground max-w-xs hidden xl:table-cell">
                      <div className="line-clamp-2">{l.description}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l: ListingItem) => (
            <Card key={l.id} className="overflow-hidden gap-2">
              <CardHeader>
                <CardTitle>
                  <Link href={`/admin/listings/${l.id}`} className="hover:underline">
                    {l.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {l.main_picture ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-md border">
                    <Image src={l.main_picture} alt={l.title}
                           width={300}
                           height={300}
                           className="object-cover" />
                  </div>
                ) : (
                  <div className="h-40 w-full rounded-md border bg-muted/40" />
                )}
                <div className="text-sm text-muted-foreground line-clamp-3">{l.description}</div>
                <div className="text-xs text-muted-foreground">Code: {l.code}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev || isLoading}
        >
          Назад
        </button>
        <div className="text-sm text-muted-foreground">{(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}</div>
        <button
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => (canNext ? p + 1 : p))}
          disabled={!canNext || isLoading}
        >
          Вперед
        </button>
      </div>
    </div>
  )
}


