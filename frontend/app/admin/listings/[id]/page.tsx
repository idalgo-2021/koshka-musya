"use client"

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ListingsApi } from '@/entities/listings/api'
import { Button } from '@/components/ui/button'
import { ListingDetailCard } from '@/components/ListingDetailCard'
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

  if (!id) return <div className="p-6 text-sm text-muted-foreground">No id</div>
  if (isLoading) return <div className="p-6">Loading...</div>
  if (isError) return <div className="p-6 text-red-600 text-sm">{(error as Error)?.message || 'Failed to load'}</div>

  const l = data!

  return (
    <div className="container max-w-6xl py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <StepBackIcon/>
        </Button>
        <h1 className="text-md md:text-2xl font-semibold">Детали объекта</h1>
      </div>

      <ListingDetailCard listing={l} />
    </div>
  );
}


