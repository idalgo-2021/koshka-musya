"use client"

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useImageViewer } from '@/hooks/useImageViewer'
import {
  MapPin,
  Building,
  Hash,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface ListingItem {
  id: string
  title: string
  main_picture?: string
  description: string
  code: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  listing_type: {
    id: number
    name: string
    slug: string
  }
}

interface ListingsTableViewProps {
  listings: ListingItem[]
}

type SortField = 'title' | 'description' | 'city' | 'listing_type' | 'address'
type SortDirection = 'asc' | 'desc' | null

export function ListingsTableView({ listings }: ListingsTableViewProps) {
  const { openImage } = useImageViewer()
  const [sortField, setSortField] = React.useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)

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

  const sortedListings = React.useMemo(() => {
    if (!sortField || !sortDirection) {
      return listings
    }

    return [...listings].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'title':
          aValue = a.title || ''
          bValue = b.title || ''
          break
        case 'description':
          aValue = a.description || ''
          bValue = b.description || ''
          break
        case 'city':
          aValue = a.city || ''
          bValue = b.city || ''
          break
        case 'listing_type':
          aValue = a.listing_type?.name || ''
          bValue = b.listing_type?.name || ''
          break
        case 'address':
          aValue = a.address || ''
          bValue = b.address || ''
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
  }, [listings, sortField, sortDirection])

  const getMapUrl = (lat: number, lng: number) => {
    return `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`
  }

  const handleImageClick = (imageUrl: string, title: string) => {
    openImage(imageUrl, title)
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
              <th className="h-14 px-3 text-left align-middle font-medium text-muted-foreground">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Название
                    {getSortIcon('title')}
                  </div>
                </Button>
              </th>
              <th className="h-14 px-3 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Описание
                    {getSortIcon('description')}
                  </div>
                </Button>
              </th>
              <th className="h-14 px-3 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Адрес
                    {getSortIcon('city')}
                  </div>
                </Button>
              </th>
              <th className="h-14 px-3 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground justify-start"
                  onClick={() => handleSort('listing_type')}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Тип
                    {getSortIcon('listing_type')}
                  </div>
                </Button>
              </th>
              <th className="h-14 px-3 text-left align-middle font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Действия
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedListings.map((listing) => {

              return (
                <React.Fragment key={listing.id}>
                  {/* Main Row */}
                  <tr className="border-b border-border/30 transition-all duration-200 hover:bg-muted/30 hover:shadow-sm">
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-3">
                        {listing.main_picture ? (
                          <div
                            className="relative h-12 w-12 md:h-16 md:w-16 overflow-hidden rounded-lg border-2 border-border/50 cursor-pointer group transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                            onClick={() => handleImageClick(listing.main_picture!, listing.title)}
                          >
                            <Image
                              src={listing.main_picture}
                              alt={listing.title}
                              width={64}
                              height={64}
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 md:h-16 md:w-16 rounded-lg border-2 border-border/50 bg-gradient-to-br from-muted/40 to-muted/60 flex items-center justify-center">
                            <Building className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/listings/${listing.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-1"
                          >
                            {listing.title}
                          </Link>
                          <div className="text-xs text-muted-foreground sm:hidden mt-1 line-clamp-2">
                            {listing.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-middle text-sm text-muted-foreground hidden sm:table-cell">
                      <div className="line-clamp-2">{listing.description}</div>
                    </td>
                    <td className="p-3 align-middle text-sm hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          {listing.city}, {listing.country}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {listing.address}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-middle hidden lg:table-cell">
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all duration-200"
                      >
                        {listing.listing_type?.name}
                      </Badge>
                    </td>
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
                          <Link href={`/admin/listings/${listing.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {listing.latitude && listing.longitude && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                          >
                            <a
                              href={getMapUrl(listing.latitude, listing.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      {sortedListings.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-muted-foreground text-lg font-medium mb-2">Нет объектов для отображения</div>
          <p className="text-sm text-muted-foreground">Попробуйте изменить параметры поиска или добавьте новый объект</p>
        </div>
      )}
    </div>
  )
}
