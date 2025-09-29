"use client"

import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingsApi, type CreateListingTypeRequest, type UpdateListingTypeRequest } from '@/entities/listings/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, X } from 'lucide-react'

interface ListingTypeFormProps {
  listingTypeId?: number
  initialData?: {
    name: string
    slug: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ListingTypeForm({
  listingTypeId,
  initialData,
  onSuccess,
  onCancel
}: ListingTypeFormProps) {
  const queryClient = useQueryClient()
  const isEdit = !!listingTypeId

  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    slug: initialData?.slug || ''
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateListingTypeRequest) => ListingsApi.createListingType(payload),
    onSuccess: () => {
      toast.success('Listing type created successfully')
      queryClient.invalidateQueries({ queryKey: ['listing_types'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create listing type')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateListingTypeRequest) => 
      ListingsApi.updateListingType(listingTypeId!, payload),
    onSuccess: () => {
      toast.success('Listing type updated successfully')
      queryClient.invalidateQueries({ queryKey: ['listing_types'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update listing type')
    }
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug when name changes (only for create mode)
    if (field === 'name' && !isEdit && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast.error('Name is required')
      return
    }

    if (!formData.slug?.trim()) {
      toast.error('Slug is required')
      return
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim()
    }

    if (isEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const loading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter listing type name..."
          required
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          placeholder="Enter URL slug..."
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          URL-friendly identifier (lowercase, no spaces)
        </p>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
