"use client"

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {Edit, StepBackIcon} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ChecklistItemForm from '@/components/ChecklistItemForm'

import { ChecklistApi } from '@/entities/checklist/api'

export default function ChecklistItemViewPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = parseInt(params.id as string)

  const [isEditing, setIsEditing] = React.useState(false)

  const itemQuery = useQuery({
    queryKey: ['checklist_item', itemId],
    queryFn: () => ChecklistApi.getItemById(itemId),
    enabled: !!itemId && !isNaN(itemId),
  })

  const item = itemQuery.data
  const loading = itemQuery.isLoading
  const error = itemQuery.isError

  const handleEditSuccess = () => {
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="container max-w-4xl py-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-destructive">Failed to load checklist item</div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-4"
            >
              <StepBackIcon/>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <StepBackIcon/>
          </Button>
           <h1 className="text-md md:text-2xl font-semibold">Checklist Item Details</h1>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Item
          </Button>
        )}
      </div>

      {isEditing ? (
        <ChecklistItemForm
          itemId={itemId}
          sectionId={item.section.id}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
          inline
        />
      ) : (
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                <Badge className="h-fit" variant={item.is_active ? "default" : "secondary"}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-lg font-medium">{item.title}</p>
              </div>

              {item.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{item.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.slug}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sort Order</label>
                  <p className="text-sm">{item.sort_order}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Listing Type ID</label>
                  <p className="text-sm">{item.listing_type_id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Listing Type Slug</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.listing_type_slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Information */}
          <Card>
            <CardHeader>
              <CardTitle>Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section Title</label>
                  <p className="text-sm font-medium">{item.section.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section Slug</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.section.slug}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section Sort Order</label>
                  <p className="text-sm">{item.section.sort_order}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answer Type Information */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Answer Type</label>
                  <p className="text-sm font-medium">{item.answer_type.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Answer Type Slug</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.answer_type.slug}</p>
                </div>
              </div>

              {item.answer_type.meta && Object.keys(item.answer_type.meta).length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Answer Type Meta</label>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                    {JSON.stringify(item.answer_type.meta, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Media Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Media Requirement</label>
                  <p className="text-sm font-medium">{item.media_requirement.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Max Files</label>
                  <p className="text-sm">{item.media_max_files}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Allowed Types</label>
                  <div className="flex gap-1 flex-wrap">
                    {item.media_allowed_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
