"use client"

import * as React from 'react'
import Link from 'next/link'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { ToggleButton } from '@/components/ToggleButton'
import { useResponsiveToggle } from '@/hooks/useResponsiveToggle'
import { ListingsTableView } from '@/components/ListingsTableView'
import { ListingsCardView } from '@/components/ListingsCardView'

import { ListingsApi } from '@/entities/listings/api'
import {USER_ROLE} from "@/entities/auth/useAuth";
import {Plus} from "lucide-react";
import {useUser} from "@/entities/auth/SessionContext";

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

  const user = useUser();
  if (isLoading) return <div className="p-6">Loading...</div>
  if (isError) return <div className="p-6 text-red-600 text-sm">{(error as Error)?.message || 'Failed to load listings'}</div>

  const listings = data?.listings || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Объекты размещения
            </h1>
            <p className="text-sm text-muted-foreground">
              Управление объектами недвижимости и их размещением
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground hidden sm:block bg-muted/50 px-3 py-1 rounded-full">
              Страница {page} из {totalPages}
            </div>
            {user?.role === USER_ROLE.Admin && (
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                <Link href="/admin/listings/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить объект
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild className="hover:bg-primary/10 hover:border-primary/50">
              <Link href="/admin/listingTypes">
                Типы объектов
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <ToggleButton checked={isShow} onToggle={setIsShow}/>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Показано {listings.length} из {total} объектов
        </div>
      </div>

      {/* Content Views */}
      {isShow ? (
        <ListingsTableView listings={listings} />
      ) : (
        <ListingsCardView listings={listings} />
      )}

      {/* Pagination */}
      <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev || isLoading}
            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
          >
            Назад
          </Button>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              Показано <span className="font-medium text-foreground">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> из <span className="font-medium text-foreground">{total}</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setPage((p) => (canNext ? p + 1 : p))}
            disabled={!canNext || isLoading}
            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  )
}


