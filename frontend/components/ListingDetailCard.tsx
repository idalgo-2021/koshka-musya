"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyToClipboard } from '@/components/CopyToClipboard'
import { formatDate } from '@/lib/date'
import {
  MapPin,
  Building,
  Hash,
  ExternalLink,
  Calendar,
  Globe,
  Image as ImageIcon,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download
} from 'lucide-react'
import Image from 'next/image'

interface ListingDetailData {
  id: string
  title: string
  description: string
  code: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  main_picture?: string
  listing_type: {
    id: number
    name: string
    slug: string
  }
  created_at?: string
  updated_at?: string
}

interface ListingDetailCardProps {
  listing: ListingDetailData
}

export function ListingDetailCard({ listing }: ListingDetailCardProps) {
  const [isImageViewerOpen, setIsImageViewerOpen] = React.useState(false)
  const [imageScale, setImageScale] = React.useState(1)
  const [imageRotation, setImageRotation] = React.useState(0)
  const [imagePosition, setImagePosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })

  const getMapUrl = (lat: number, lng: number) => {
    return `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`
  }

  const openImageViewer = () => {
    setIsImageViewerOpen(true)
    setImageScale(1)
    setImageRotation(0)
    setImagePosition({ x: 0, y: 0 })
  }

  const closeImageViewer = () => {
    setIsImageViewerOpen(false)
    setImageScale(1)
    setImageRotation(0)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    if (listing.main_picture) {
      const link = document.createElement('a')
      link.href = listing.main_picture
      link.download = `${listing.title}-image.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setImageScale(prev => Math.max(0.1, Math.min(5, prev * delta)))
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isImageViewerOpen) return
      
      switch (e.key) {
        case 'Escape':
          closeImageViewer()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
        case 'R':
          handleRotate()
          break
        case 'd':
        case 'D':
          handleDownload()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isImageViewerOpen])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="overflow-hidden">
        <div className="relative">
          {listing.main_picture && (
            <div className="h-64 relative overflow-hidden cursor-pointer group" onClick={openImageViewer}>
              <Image
                src={listing.main_picture}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <Building className="w-4 h-4" />
                  <span className="text-sm">{listing.listing_type.name}</span>
                  <span className="text-white/60">•</span>
                  <span className="text-sm">{listing.city}, {listing.country}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  ID: <CopyToClipboard text={listing.id} showIcon={false} />
                </Badge>
                <Badge variant="secondary">
                  {listing.listing_type.name}
                </Badge>
              </div>
              {listing.created_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Создано: {formatDate(listing.created_at)}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              {listing.updated_at && (
                <div className="text-sm text-muted-foreground">
                  Обновлено: {formatDate(listing.updated_at)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            {/* <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* <Building className="w-5 h-5" /> */}
                {/* Основная информация */}
              {/* </CardTitle> */}
            {/* </CardHeader> */}
            <CardContent className="space-y-4">
              <div>
                <div className="text-lg font-medium">{(listing.listing_type?.name + ' ' || '') + listing.title}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Описание</div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Код объекта</div>
                <CopyToClipboard text={listing.code} />
              </div>

            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            {/* <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Местоположение
              </CardTitle>
            </CardHeader> */}
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Адрес</div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    {listing.address && <div>{listing.address}</div>}
                    <div className="text-muted-foreground">
                      {listing.city}, {listing.country}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Координаты</div>
                <div className="text-sm font-mono text-muted-foreground">
                  {listing.latitude.toFixed(6)}, {listing.longitude.toFixed(6)}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <a
                  href={getMapUrl(listing.latitude, listing.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть на карте
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <a
                  href={getMapUrl(listing.latitude, listing.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Открыть на карте
                </a>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <a
                  href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Google Maps
                </a>
              </Button>

              {listing.main_picture && (
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={listing.main_picture}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Открыть изображение
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Техническая информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">ID объекта</div>
                <CopyToClipboard text={listing.id} />
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Код объекта</div>
                <CopyToClipboard text={listing.code} />
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Тип объекта</div>
                <div className="space-y-1">
                  <Badge variant="secondary">
                    {listing.listing_type.name}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Slug: {listing.listing_type.slug}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Координаты</div>
                <div className="space-y-1">
                  <div className="text-sm font-mono">
                    Широта: {listing.latitude.toFixed(6)}
                  </div>
                  <div className="text-sm font-mono">
                    Долгота: {listing.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Information */}
          {listing.main_picture && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Медиа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Главное изображение</div>
                  <div 
                    className="relative h-48 w-full overflow-hidden rounded-lg border cursor-pointer group"
                    onClick={openImageViewer}
                  >
                    <Image
                      src={listing.main_picture}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">URL изображения</div>
                  <CopyToClipboard text={listing.main_picture} />
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Additional Information */}
      {(listing.created_at || listing.updated_at) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              История изменений
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listing.created_at && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Создано:</span>
                  <span className="text-muted-foreground ml-2">{formatDate(listing.created_at)}</span>
                </div>
              </div>
            )}

            {listing.updated_at && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Обновлено:</span>
                  <span className="text-muted-foreground ml-2">{formatDate(listing.updated_at)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Screen Image Viewer */}
      {isImageViewerOpen && listing.main_picture && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ImageIcon className="w-5 h-5" />
                <span className="font-medium">{listing.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeImageViewer}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Container */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-16 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img
              src={listing.main_picture}
              alt={listing.title}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${imageScale}) rotate(${imageRotation}deg) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable={false}
            />
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/20"
                disabled={imageScale <= 0.1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <div className="text-white text-sm font-medium min-w-[60px] text-center">
                {Math.round(imageScale * 100)}%
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="text-white hover:bg-white/20"
                disabled={imageScale >= 5}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-white/30" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="text-white hover:bg-white/20"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Keyboard Shortcuts Help */}
            <div className="text-center text-white/60 text-xs mt-2">
              <div className="flex items-center justify-center gap-4">
                <span>ESC - закрыть</span>
                <span>+/- - масштаб</span>
                <span>R - поворот</span>
                <span>D - скачать</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
