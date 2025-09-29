"use client"

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChecklistApi, type ChecklistSection } from '@/entities/checklist/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select'
import { toast } from 'sonner'
import { Save, X, Copy, Trash2 } from 'lucide-react'

import { ListingsApi } from "@/entities/listings/api";
import { useEscapeKey, useEnterKey } from '@/hooks/useEventHooks'
import { useConfirmation } from '@/entities/modals/ModalContext'

interface ChecklistSectionFormProps {
  sectionId?: number
  active?: boolean
  onSuccess?: () => void
  onCancel?: () => void
  inline?: boolean
}

export default function ChecklistSectionForm({
  sectionId,
  active = false,
  onSuccess,
  onCancel,
  inline = false
}: ChecklistSectionFormProps) {
  const queryClient = useQueryClient()
  const isEdit = !!sectionId

  const listingTypesQuery = useQuery({
    queryKey: ['listing_types'],
    queryFn: () => ListingsApi.getListingTypes(),
  })

  const sectionQuery = useQuery({
    queryKey: ['checklist_section', sectionId],
    queryFn: () => sectionId ? ChecklistApi.getSectionById(sectionId) : null,
    enabled: !!sectionId,
  })

  // Form state
  const [formData, setFormData] = React.useState<Partial<ChecklistSection>>({
    title: '',
    slug: '',
    sort_order: 0,
    listing_type_id: undefined,
  })

  // Update form when editing
  React.useEffect(() => {
    if (sectionQuery.data) {
      const section = sectionQuery.data
      setFormData({
        title: section.title,
        slug: section.slug,
        sort_order: section.sort_order,
        listing_type_id: section.listing_type_id,
      })
    }
  }, [sectionQuery.data])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<ChecklistSection>) => ChecklistApi.createSection(data),
    onSuccess: () => {
      toast.success('Section created successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create section')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ChecklistSection>) =>
      sectionId ? ChecklistApi.updateSection(sectionId, data) : Promise.reject('No section ID'),
    onSuccess: () => {
      toast.success('Section updated successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
      queryClient.invalidateQueries({ queryKey: ['checklist_section', sectionId] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update section')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (data: Partial<ChecklistSection>) => ChecklistApi.createSection(data),
    onSuccess: () => {
      toast.success('Section duplicated successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to duplicate section')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => sectionId ? ChecklistApi.deleteSection(sectionId) : Promise.reject('No section ID'),
    onSuccess: () => {
      toast.success('Section deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete section')
    },
  })

  const { confirm } = useConfirmation()

  const handleInputChange = React.useCallback((field: keyof ChecklistSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [setFormData]);

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title?.trim()) {
      toast.error('Title is required')
      return
    }

    const payload = formData as Partial<ChecklistSection>

    if (isEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }, [formData, isEdit, createMutation, updateMutation]);

  const handleDuplicate = React.useCallback(() => {
    if (!formData.title?.trim()) {
      toast.error('Title is required')
      return
    }

    // Create duplicate with modified title and slug
    const duplicateData: Partial<ChecklistSection> = {
      ...formData,
      title: `${formData.title} (Copy)`,
      slug: `${formData.slug || ''}-copy`,
      sort_order: (formData.sort_order || 0) + 1,
    }

    duplicateMutation.mutate(duplicateData)
  }, [formData, duplicateMutation]);

  const handleDelete = React.useCallback(() => {
    if (!sectionId) {
      toast.error('No section to delete')
      return
    }

    // Show confirmation dialog
    confirm(
      'Удалить секцию',
      'Вы уверены, что хотите удалить эту секцию? Это действие нельзя отменить.',
      () => {
        deleteMutation.mutate()
      },
      {
        type: 'danger',
        confirmText: 'Удалить',
        cancelText: 'Отмена'
      }
    )
  }, [sectionId, deleteMutation, confirm]);

  // Handle keyboard events
  useEscapeKey(onCancel || (() => {}), true)
  useEnterKey(() => {
    const mockEvent = { preventDefault: () => {} } as React.FormEvent
    handleSubmit(mockEvent)
  }, true)

  const loading = listingTypesQuery.isLoading || (isEdit && sectionQuery.isLoading)
  const error = listingTypesQuery.isError || (isEdit && sectionQuery.isError)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive p-4">
        Failed to load form data
      </div>
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {!inline && (
            <Label htmlFor="title">Section Title *</Label>
          )}
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter section title..."
            className="text-md md:text-lg border-t-0 border-l-0 border-r-0 placeholder:text-xl laceholder:text-gray-400 px-4 py-6 w-full border-0 outline-0 focus:border-0 focus:ring-0 rounded-md bg-gray-50"
            required
            autoFocus
            autoComplete='off'
            autoCorrect='off'
            autoSave='off'
          />
        </div>

        <div>
          {!inline && (
            <Label htmlFor="slug">Slug</Label>
          )}
          <Input
            id="slug"
            value={formData.slug || ''}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="auto-generated"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="listing_type_id">Listing Type</Label>
          <Select
            id="listing_type_id"
            value={formData.listing_type_id}
            onChange={(value) => handleInputChange('listing_type_id', value ? Number(value) : undefined)}
            placeholder="Select listing type (optional)"
            options={[
              { value: '', label: 'All' },
              ...(listingTypesQuery.data?.listing_types?.map((type) => ({
                value: type.id,
                label: type.name
              })) || [])
            ]}
          />
        </div>

        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order || 0}
            onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 fixed bottom-4 md:relative">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? 'Update' : 'Create'} Section
        </Button>

        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="w-4 h-4" />
          </Button>
        )}

        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  )

  if (inline) {
    return (
      <Card className={`mt-4 ${active ? 'border-l-4 border-l-[#4285f4]' : ''}`}>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    )
  }

  return formContent
}
