"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { ListingsApi, type ListingType } from '@/entities/listings/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {Plus, Search, Edit, Trash2, Save, X, StepBackIcon} from 'lucide-react'
import { useListingTypeModals } from '@/hooks/useListingTypeModals'
import { useConfirmation } from '@/entities/modals/ModalContext'
import {useAuth, USER_ROLE} from "@/entities/auth/useAuth";

export default function ListingTypesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { openCreateModal, openEditModal } = useListingTypeModals()
  const { confirm, closeModal } = useConfirmation()

  const [searchTerm, setSearchTerm] = React.useState('')
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editingData, setEditingData] = React.useState({ name: '', slug: '' })

  const { user } = useAuth();

  const listingTypesQuery = useQuery({
    queryKey: ['listing_types'],
    queryFn: () => ListingsApi.getListingTypes(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ListingsApi.deleteListingType(id),
    onSuccess: () => {
      closeModal()
      toast.success('Listing type deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['listing_types'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete listing type')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; slug: string } }) =>
      ListingsApi.updateListingType(id, data),
    onSuccess: () => {
      toast.success('Listing type updated successfully')
      queryClient.invalidateQueries({ queryKey: ['listing_types'] })
      setEditingId(null)
      setEditingData({ name: '', slug: '' })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update listing type')
    },
  })

  const listingTypes = React.useMemo(() =>
    listingTypesQuery.data?.listing_types ?? [],
    [listingTypesQuery.data?.listing_types]
  )

  // Filter listing types based on search term
  const filteredListingTypes = React.useMemo(() => {
    if (!searchTerm.trim()) return listingTypes

    const search = searchTerm.toLowerCase()
    return listingTypes.filter(type =>
      type.name.toLowerCase().includes(search) ||
      type.slug.toLowerCase().includes(search)
    )
  }, [listingTypes, searchTerm])

  const handleDelete = (id: number, name: string) => {
    confirm(
      'Delete Listing Type',
      `Are you sure you want to delete "${name}"?`,
      () => deleteMutation.mutate(id),
      {
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    )
  }

  const handleCreateNew = () => {
    openCreateModal()
  }

  const isAdmin = user?.role === USER_ROLE.Admin;
  const handleEdit = (listingType: ListingType) => {
    // Prevent editing if another item is already being edited
    if (editingId !== null && isAdmin) {
      toast.error('Please finish editing the current item first')
      return
    }

    // Check if we're on mobile (screen width < 768px)
    const isMobile = window.innerWidth < 768

    if (isMobile) {
      // Use modal on mobile
      openEditModal(listingType)
    } else {
      // Use inline editing on desktop
      setEditingId(listingType.id)
      setEditingData({ name: listingType.name, slug: listingType.slug })
    }
  }

  const handleSaveEdit = (id: number) => {
    if (!editingData.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!editingData.slug.trim()) {
      toast.error('Slug is required')
      return
    }

    updateMutation.mutate({
      id,
      data: {
        name: editingData.name.trim(),
        slug: editingData.slug.trim()
      }
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingData({ name: '', slug: '' })
  }

  const handleInputChange = (field: 'name' | 'slug', value: string) => {
    setEditingData(prev => ({ ...prev, [field]: value }))
  }

  const handleKeyDown = (e: React.KeyboardEvent, listingTypeId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit(listingTypeId)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  const loading = listingTypesQuery.isLoading
  const error = listingTypesQuery.isError

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <StepBackIcon/>
          </Button>
           <h1 className="text-md md:text-2xl font-semibold">Типы объектов</h1>
        </div>

        {isAdmin ? (
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить тип объекта
          </Button>
        ) : undefined}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск типа объекта..."
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
            <p className="text-destructive">Failed to load listing types</p>
          </CardContent>
        </Card>
      ) : filteredListingTypes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No listing types found matching your search.' : 'No listing types created yet.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Listing Type
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListingTypes.map((listingType) => {
            const isEditing = editingId === listingType.id
            const isSaving = isEditing && updateMutation.isPending

            return (
              <Card
                key={listingType.id}
                className={`hover:shadow-md transition-all ${isSaving ? 'opacity-50' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {isEditing ? (
                      <Input
                        value={editingData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, listingType.id)}
                        placeholder="Enter name..."
                        className="text-lg font-semibold"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate">{listingType.name}</span>
                    )}

                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveEdit(listingType.id)}
                            disabled={updateMutation.isPending}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={updateMutation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {isAdmin ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(listingType)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(listingType.id, listingType.name)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : undefined
                          }
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Slug</p>
                      {isEditing ? (
                        <Input
                          value={editingData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, listingType.id)}
                          placeholder="Enter slug..."
                          className="text-sm font-mono"
                        />
                      ) : (
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {listingType.slug}
                        </p>
                      )}
                    </div>
                    <p className="flex flex-row gap-1">
                      <span className="text-sm font-medium text-muted-foreground">ID</span>
                      <span className="text-sm">{listingType.id}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
