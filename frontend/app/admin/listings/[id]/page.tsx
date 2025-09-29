"use client"

import * as React from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ListingsApi } from '@/entities/listings/api'
import { Button } from '@/components/ui/button'
import MapLink from '@/components/MapLink'
import {StepBackIcon} from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['listing', id],
    enabled: !!id,
    queryFn: () => ListingsApi.getListingById(String(id)),
  })

  console.log({ data });
  if (!id) return <div className="p-6 text-sm text-muted-foreground">No id</div>
  if (isLoading) return <div className="p-6">Loading...</div>
  if (isError) return <div className="p-6 text-red-600 text-sm">{(error as Error)?.message || 'Failed to load'}</div>

  const l = data!

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
        {/* {typeof l.longitude === 'number' && typeof l.latitude === 'number' && (
          <Button asChild>
            <Link
              href={`https://yandex.ru/maps/?ll=${encodeURIComponent(String(l.longitude))}%2C${encodeURIComponent(String(l.latitude))}&z=16&pt=${encodeURIComponent(String(l.longitude))},${encodeURIComponent(String(l.latitude))},pm2rdm`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Yandex Maps
            </Link>
          </Button>
        )} */}
      </div>
      <div className="flex flex-col gap-2">
         <h1 className="text-md md:text-2xl font-semibold">{l.title}</h1>
        <p className="text-sm text-muted-foreground">{l.city}, {l.country}</p>
      </div>

      {l.mainPicture && (
        <div className="relative h-72 w-full overflow-hidden rounded-md border">
          <Image src={l.mainPicture} alt={l.title} fill
                 sizes="(max-width: 768px) 150px, 200px" className="object-cover" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Code</div>
          <div className="text-sm">{l.code}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Type</div>
          <div className="text-sm">{l.listing_type?.name}</div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="text-sm text-muted-foreground">Address</div>
          <div className="text-sm flex items-center gap-2">
            <span>{l.address}</span>
            {typeof l.longitude === 'number' && typeof l.latitude === 'number' && (
              <MapLink longitude={l.longitude} latitude={l.latitude} />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Description</div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{l.description}</div>
      </div>
    </div>
  );
}


