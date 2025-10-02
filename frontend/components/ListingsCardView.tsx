"use client"

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useImageViewer } from '@/hooks/useImageViewer'
import { CopyToClipboard } from '@/components/CopyToClipboard'
import {
  MapPin,
  Building,
  Hash,
  ExternalLink,
  Eye,
  Heart,
  Star
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

interface ListingsCardViewProps {
  listings: ListingItem[]
}

export function ListingsCardView({ listings }: ListingsCardViewProps) {
  const { openImage } = useImageViewer()

  const getMapUrl = (lat: number, lng: number) => {
    return `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`
  }

  const handleImageClick = (imageUrl: string, title: string) => {
    openImage(imageUrl, title)
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <Card 
          key={listing.id} 
          className="group py-0 my-0 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/30"
        >
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            {listing.main_picture ? (
              <div 
                className="relative h-full w-full cursor-pointer"
                onClick={() => handleImageClick(listing.main_picture!, listing.title)}
              >
                <Image
                  src={listing.main_picture}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/90 text-foreground border-white/50 backdrop-blur-sm shadow-sm"
                  >
                    {listing.listing_type?.name}
                  </Badge>
                </div>

                {/* Favorite Button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-muted/40 to-muted/60 flex items-center justify-center">
                <div className="text-center">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Нет изображения</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <CardContent className="p-4 space-y-3">
            {/* Title and Code */}
            <div className="space-y-2">
              <Link 
                href={`/admin/listings/${listing.id}`} 
                className="block group-hover:text-primary transition-colors duration-200"
              >
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:underline">
                  {listing.title}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-muted-foreground" />
                <CopyToClipboard text={listing.code} />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-foreground">
                    {listing.city}, {listing.country}
                  </div>
                  <div className="text-muted-foreground line-clamp-1">
                    {listing.address}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200">
                <Link href={`/admin/listings/${listing.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Подробнее
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
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>

            {/* Additional Info */}
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>{listing.listing_type?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>ID: {listing.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {listings.length === 0 && (
        <div className="col-span-full p-12 text-center">
          <div className="text-muted-foreground text-lg font-medium mb-2">Нет объектов для отображения</div>
          <p className="text-sm text-muted-foreground">Попробуйте изменить параметры поиска или добавьте новый объект</p>
        </div>
      )}
    </div>
  )
}
