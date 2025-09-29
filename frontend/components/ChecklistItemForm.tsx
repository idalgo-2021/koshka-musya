"use client"

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChecklistApi,type CreateItemRequest } from '@/entities/checklist/api'
import { AnswerTypesApi } from '@/entities/answerTypes/api'
import { MediaRequirementsApi } from '@/entities/mediaRequirements/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IOSSwitch } from '@/components/ui/switch'
import Select from '@/components/ui/select'
import IOSCheckbox from '@/components/ui/ios-checkbox'
import { toast } from 'sonner'
import { Save, X, Copy, Trash2 } from 'lucide-react'

import { ListingsApi } from "@/entities/listings/api";
import { useEscapeKey, useEnterKey } from '@/hooks/useEventHooks'
import { useConfirmation } from '@/entities/modals/ModalContext'

interface ChecklistItemFormProps {
  sectionId?: number
  itemId?: number
  active?: boolean
  onSuccess?: () => void
  onCancel?: () => void
  inline?: boolean
}

const MEDIA_TYPES = ['image', 'video', 'document'];

export default function ChecklistItemForm({
  sectionId,
  itemId,
  active = false,
  onSuccess,
  onCancel,
  inline = false
}: ChecklistItemFormProps) {
  const queryClient = useQueryClient()
  const isEdit = !!itemId

  const listingTypesQuery = useQuery({
    queryKey: ['listing_types'],
    queryFn: () => ListingsApi.getListingTypes(),
  })

  // Queries
  const answerTypesQuery = useQuery({
    queryKey: ['answer_types'],
    queryFn: () => AnswerTypesApi.list(),
  })

  const mediaRequirementsQuery = useQuery({
    queryKey: ['media_requirements'],
    queryFn: () => MediaRequirementsApi.list(),
  })

  const itemQuery = useQuery({
    queryKey: ['checklist_item', itemId],
    queryFn: () => itemId ? ChecklistApi.getItemById(itemId) : null,
    enabled: !!itemId,
  })

  // Form state
  const [formData, setFormData] = React.useState<Partial<CreateItemRequest>>({
    title: 'Untitled item',
    description: '',
    slug: '',
    sort_order: 0,
    is_active: true,
    listing_type_id: 1,
    media_max_files: 1,
    media_allowed_types: ['image'],
    answer_type_id: 1,
    media_requirement_id: 1,
    section_id: sectionId || 0,
  })

  // Update form when editing
  React.useEffect(() => {
    if (itemQuery.data) {
      const item = itemQuery.data
      setFormData({
        title: item.title,
        description: item.description,
        slug: item.slug,
        sort_order: item.sort_order,
        is_active: item.is_active,
        listing_type_id: item.listing_type_id,
        media_max_files: item.media_max_files,
        media_allowed_types: item.media_allowed_types,
        answer_type_id: item.answer_type.id,
        media_requirement_id: item.media_requirement.id,
        section_id: item.section.id,
      })
    }
  }, [itemQuery.data])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateItemRequest) => ChecklistApi.createItem(data),
    onSuccess: () => {
      toast.success('Item created successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create item')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateItemRequest>) =>
      itemId ? ChecklistApi.updateItem(itemId, data) : Promise.reject('No item ID'),
    onSuccess: () => {
      toast.success('Item updated successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
      queryClient.invalidateQueries({ queryKey: ['checklist_item', itemId] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update item')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (data: CreateItemRequest) => ChecklistApi.createItem(data),
    onSuccess: () => {
      toast.success('Item duplicated successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to duplicate item')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => itemId ? ChecklistApi.deleteItem(itemId) : Promise.reject('No item ID'),
    onSuccess: () => {
      toast.success('Item deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete item')
    },
  })

  const { confirm } = useConfirmation()

  const handleInputChange = React.useCallback((field: keyof CreateItemRequest, value: any) => {
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

    const payload = formData as CreateItemRequest

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
    const duplicateData: CreateItemRequest = {
      ...formData,
      title: `${formData.title} (Copy)`,
      slug: `${formData.slug || ''}-copy`,
      sort_order: (formData.sort_order || 0) + 1,
    } as CreateItemRequest

    duplicateMutation.mutate(duplicateData)
  }, [formData, duplicateMutation]);

  const handleDelete = React.useCallback(() => {
    if (!itemId) {
      toast.error('No item to delete')
      return
    }

    // Show confirmation dialog
    confirm(
      'Удалить элемент',
      'Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.',
      () => {
        deleteMutation.mutate()
      },
      {
        type: 'danger',
        confirmText: 'Удалить',
        cancelText: 'Отмена'
      }
    )
  }, [itemId, deleteMutation, confirm]);

  // Handle keyboard events
  useEscapeKey(onCancel || (() => {}), true)
  useEnterKey(() => {
    const mockEvent = { preventDefault: () => {} } as React.FormEvent
    handleSubmit(mockEvent)
  }, true)

  const loading = answerTypesQuery.isLoading || mediaRequirementsQuery.isLoading || (isEdit && itemQuery.isLoading)
  const error = answerTypesQuery.isError || mediaRequirementsQuery.isError || (isEdit && itemQuery.isError)

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

  const answerTypes = answerTypesQuery.data?.answer_types ?? []
  const mediaRequirements = mediaRequirementsQuery.data?.media_requirements ?? []

  const isMediaRequired = formData.media_requirement_id !== 1
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {!inline && (
            <Label htmlFor="title">Title *</Label>
          )}
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter item title..."
            className="text-xl border-t-0 border-l-0 border-r-0 placeholder:text-xl laceholder:text-gray-400 px-4 py-6 w-full border-0 outline-0 focus:border-0 focus:ring-0 rounded-md bg-gray-50"
            required
            autoFocus
            autoComplete='off'
            autoCorrect='off'
            autoSave='off'
          />
        </div>

        <div>
          {!inline && (
            <Label htmlFor="answer_type">Тип ответа *</Label>
          )}
          <Select
            id="answer_type"
            value={formData.answer_type_id}
            onChange={(value) => handleInputChange('answer_type_id', value ? Number(value) : undefined)}
            placeholder="Выберите тип ответа"
            options={[
              { value: '', label: 'Выберите тип ответа' },
              ...answerTypes.map((type) => ({
                value: type.id,
                label: type.name
              }))
            ]}
          />
        </div>
      </div>

      <div>
        {!inline && (
          <Label htmlFor="description">Description</Label>
        )}
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter item description..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="listing_type_id">Тип объекта</Label>
          <Select
            id="section-listing-type"
            value={formData.listing_type_id || 1}
            onChange={(value) => handleInputChange('listing_type_id', value ? Number(value) : undefined)}
            placeholder="Select listing type (optional)"
            options={[
              { value: '', label: 'Select listing type (optional)' },
              ...(listingTypesQuery.data?.listing_types?.map((type) => ({
                value: type.id,
                label: type.name
              })) || [])
            ]}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
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
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order || 0}
            onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="media_requirement">Media Requirement *</Label>
          <Select
            id="media_requirement"
            value={formData.media_requirement_id}
            onChange={(value) => handleInputChange('media_requirement_id', value ? Number(value) : undefined)}
            placeholder="Select media requirement"
            options={[
              { value: '', label: 'Select media requirement' },
              ...mediaRequirements.map((req) => ({
                value: req.id,
                label: req.name
              }))
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        { isMediaRequired && (
          <div>
            <Label htmlFor="media_max_files">Max Media Files</Label>
            <Input
              id="media_max_files"
              type="number"
              min="0"
              max="10"
              value={formData.media_max_files || 1}
              onChange={(e) => handleInputChange('media_max_files', parseInt(e.target.value) || 1)}
            />
          </div>
        )}

        { isMediaRequired && (
          <div>
            <Label>Media Allowed Types</Label>
            <div className="flex gap-4 mt-2">
              {MEDIA_TYPES.map((type) => (
                <IOSCheckbox
                  key={type}
                  checked={formData.media_allowed_types?.includes(type) || false}
                  onChange={(checked) => {
                    const current = formData.media_allowed_types || []
                    if (checked) {
                      handleInputChange('media_allowed_types', [...current, type])
                    } else {
                      handleInputChange('media_allowed_types', current.filter(t => t !== type))
                    }
                  }}
                  size="sm"
                  label={type}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <IOSSwitch
          id="is_active"
          checked={formData.is_active || false}
          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
        />
        <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
          Active
        </Label>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? 'Update' : 'Create'} Item
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
      <Card className={`mt-4  ${active ? 'border-l-4 border-l-[#4285f4]' : ''}`}>
        {/* <CardHeader> */}
          {/* <CardTitle>{isEdit ? 'Edit' : 'Add New'} Checklist Item</CardTitle> */}
        {/* </CardHeader> */}
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    )
  }

  return formContent
}
