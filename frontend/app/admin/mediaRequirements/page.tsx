"use client"

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { MediaRequirementsApi } from '@/entities/mediaRequirements/api'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function MediaRequirementsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['media_requirements'],
    queryFn: () => MediaRequirementsApi.list(),
  })

  const [idFilter, setIdFilter] = React.useState('')
  const [slugFilter, setSlugFilter] = React.useState('')

  const requirements = React.useMemo(() => {
    const list = data?.media_requirements ?? []
    const byId = idFilter.trim()
    const bySlug = slugFilter.trim().toLowerCase()
    return list.filter((item) => {
      const idMatch = byId ? String(item.id).includes(byId) : true
      const slugMatch = bySlug ? item.slug.toLowerCase().includes(bySlug) : true
      return idMatch && slugMatch
    })
  }, [data?.media_requirements, idFilter, slugFilter])

  return (
    <div className="container max-w-4xl py-6 space-y-6">
       <h1 className="text-md md:text-2xl font-semibold">Media Requirements</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Filter by ID</div>
          <Input value={idFilter} onChange={(e) => setIdFilter(e.target.value)} placeholder="e.g. 12" />
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Filter by Slug</div>
          <Input value={slugFilter} onChange={(e) => setSlugFilter(e.target.value)} placeholder="e.g. photo" />
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div className="text-destructive">Failed to load</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {requirements.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">ID</div>
                    <div className="font-medium">{req.id}</div>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium break-all">{req.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Slug</div>
                    <div className="font-medium break-all">{req.slug}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {requirements.length === 0 && (
            <div className="text-sm text-muted-foreground">No items match current filters.</div>
          )}
        </div>
      )}
    </div>
  )
}


