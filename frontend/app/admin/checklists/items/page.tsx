"use client"

import * as React from 'react'
import { useMemo } from "react";
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {Plus, Search, Edit, Trash2, Eye, StepBackIcon} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import {ChecklistApi, type ChecklistItem, ChecklistSection} from '@/entities/checklist/api'
import { useChecklistModals } from '@/hooks/useChecklistModals'

export default function ChecklistItemsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { openCreateItemModal, openEditItemModal } = useChecklistModals()

  const [searchTerm, setSearchTerm] = React.useState('')

  const itemsQuery = useQuery({
    queryKey: ['checklist_items_full'],
    queryFn: () => ChecklistApi.getItemsFull(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ChecklistApi.deleteItem(id),
    onSuccess: () => {
      toast.success('Item deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete item')
    },
  })

  const items = useMemo(() => itemsQuery.data?.checklist_items ?? [], [itemsQuery.data?.checklist_items]);

  // Filter items based on search term
  const filteredItems = React.useMemo(() => {
    if (!searchTerm.trim()) return items

    const search = searchTerm.toLowerCase()
    return items.filter(item =>
      item.title.toLowerCase().includes(search) ||
      item.description?.toLowerCase()?.includes(search) ||
      item.section?.title?.toLowerCase()?.includes(search) ||
      item.answer_type?.name?.toLowerCase().includes(search)
    )
  }, [items, searchTerm])

  const groupedSections = React.useMemo(() => {
    const grouped: Record<string, ChecklistSection> = {}
    for (const item of items) {
      const sectionId = String(item.section.id);
      if (!grouped[sectionId]) {
        grouped[sectionId] = item.section;
      }
    }
    return grouped
  }, [items]);

  const groupedItems = React.useMemo(() => {
    const grouped: Record<number, ChecklistItem[]> = {}
    for (const item of filteredItems) {
      const sectionId = item.section.id
      if (!grouped[sectionId]) grouped[sectionId] = []
      grouped[sectionId].push(item)
    }
    return grouped
  }, [filteredItems]);

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleAddItemToSection = (sectionId: number) => {
    openCreateItemModal(sectionId)
  }

  const handleEditItem = (itemId: number, sectionId?: number) => {
    openEditItemModal(itemId, sectionId)
  }

  const loading = itemsQuery.isLoading
  const error = itemsQuery.isError

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <StepBackIcon/>
          </Button>
           <h1 className="text-md md:text-2xl font-semibold">Checklist Items</h1>
        </div>

      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search items by title, description, section, or answer type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-destructive">Failed to load checklist items</div>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No items found matching your search.' : 'No checklist items created yet.'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Create sections first, then add items to each section.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([sectionId, sectionItems]) => (
            <Card key={sectionId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{groupedSections[sectionId]?.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal text-muted-foreground">
                      {sectionItems.length} item{sectionItems.length !== 1 ? 's' : ''}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddItemToSection(sectionItems[0].section.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                  {sectionItems.map((item) => (
                    <div key={item.id}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{item.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full h-fit ${
                                item.is_active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {item.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Answer: {item.answer_type.name}</span>
                              <span>Media: {item.media_requirement.name}</span>
                              <span>Max Files: {item.media_max_files}</span>
                              <span>Sort: {item.sort_order}</span>
                              <span>Types: {item.media_allowed_types.join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/checklists/items/${item.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item.id, item.section.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.title)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
