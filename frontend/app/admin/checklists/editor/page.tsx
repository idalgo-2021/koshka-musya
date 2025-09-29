"use client"

import * as React from 'react'
import {useMemo} from "react";

import {useRouter} from 'next/navigation'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import Select from '@/components/ui/select'
import SelectRow from '@/components/ui/select-row'
import {ChevronDown, ChevronUp, Eye, GripVertical, Plus, StepBackIcon, X} from 'lucide-react'
import ChecklistFilterPanel from '@/components/ChecklistFilterPanel'
import ChecklistSectionCard from '@/components/ChecklistSectionCard'
import QueueStatusIndicator from '@/components/QueueStatusIndicator'
import { useMutationQueue } from '@/hooks/useMutationQueue'
import { useEventListener } from '@/hooks/useEventHooks'
import { useConfirmation, useReorderSections } from '@/entities/modals/ModalContext'

import {ListingsApi} from "@/entities/listings/api";
import {
  ChecklistApi,
  type ChecklistItemFull,
  type ChecklistSection,
  type SectionFilters
} from '@/entities/checklist/api'
import {isMobileDevice} from "@/lib/browser";
import { useChecklistModals } from '@/hooks/useChecklistModals';

export default function ChecklistEditorPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [filters, setFilters] = React.useState<SectionFilters>({})

  // Detect if device is mobile
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  // Listen for resize events to update mobile detection
  useEventListener('resize', React.useCallback(() => {
    setIsMobile(isMobileDevice());
  }, []), { target: window })

  // Mutation queue for handling reorder operations
  const { addReorderOperation, setCallbacks } = useMutationQueue()
  const { confirm, closeModal } = useConfirmation()
  const { openReorderModal } = useReorderSections()

  const listingTypesQuery = useQuery({
    queryKey: ['listing_types'],
    queryFn: () => ListingsApi.getListingTypes(),
  })

  const sectionsQuery = useQuery({
    queryKey: ['checklist_sections_full', filters],
    queryFn: () => ChecklistApi.getSectionsFull(filters),
  })

  const itemsQuery = useQuery({
    queryKey: ['checklist_items_full'],
    queryFn: () => ChecklistApi.getItemsFull(),
  })

  const createSectionMutation = useMutation({
    mutationFn: (data: Partial<ChecklistSection>) => ChecklistApi.createSection(data),
    onSuccess: () => {
      toast.success('Section created')
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
    },
    onError: () => toast.error('Failed to create section'),
  })


  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => ChecklistApi.deleteSection(id),
    onSuccess: () => {
      toast.success('Section deleted')
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
    },
    onError: () => toast.error('Failed to delete section'),
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => ChecklistApi.deleteItem(id),
    onSuccess: () => {
      toast.success('Item deleted')
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
    },
    onError: () => toast.error('Failed to delete item'),
  })

  const updateSectionOrderMutation = useMutation({
    mutationFn: async (sectionsWithNewOrder: ChecklistSection[]) => {
      // Update each section's sort_order
      const updatePromises = sectionsWithNewOrder.map(section =>
        ChecklistApi.updateSection(section.id, { sort_order: section.sort_order })
      )
      await Promise.all(updatePromises)
    },
    onSuccess: () => {
      closeModal()
      toast.success('Порядок секций обновлен')
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
    },
    onError: () => {
      toast.error('Не удалось обновить порядок секций')
    },
  })

  const [newSectionTitle, setNewSectionTitle] = React.useState('')
  const [newSectionSlug, setNewSectionSlug] = React.useState('')
  const [newSectionListingTypeId, setNewSectionListingTypeId] = React.useState<number | undefined>()
  const [showCreateSectionForm, setShowCreateSectionForm] = React.useState(false)
  const [collapsedSections, setCollapsedSections] = React.useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = React.useState(false)

  const sections = useMemo(() => sectionsQuery.data?.checklist_sections ?? [], [sectionsQuery.data?.checklist_sections]);
  const items = useMemo(() => itemsQuery.data?.checklist_items ?? [], [itemsQuery.data?.checklist_items]);

  const listingTypes = useMemo(() => listingTypesQuery.data?.listing_types ?? [], [listingTypesQuery.data?.listing_types]);

  // Helper function to get listing type name
  const getListingTypeName = (listingTypeId?: number) => {
    if (!listingTypeId) return null
    const listingType = listingTypes.find(type => type.id === listingTypeId)
    return listingType?.name || null
  }

  // Helper function to toggle section collapse state
  const toggleSectionCollapse = (sectionId: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Helper function to toggle all items in a section
  const toggleAllItems = (sectionId: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Helper function to update filters
  const updateFilter = React.useCallback((key: keyof SectionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  // Helper function to clear all filters
  const clearFilters = React.useCallback(() => {
    setFilters({})
  }, [])

  // Helper function to check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return Object.values(filters).some(value =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    )
  }, [filters])

  // Group items by section
  const groupedItems = React.useMemo(() => {
    const grouped: Record<number, ChecklistItemFull[]> = {}
    for (const item of items) {
      const sectionId = item.section.id
      if (!grouped[sectionId]) grouped[sectionId] = []
      grouped[sectionId].push(item)
    }
    return grouped
  }, [items])

  const handleDeleteSection = (id: number, title: string) => {
    confirm(
      'Удалить секцию',
      `Вы уверены, что хотите удалить секцию "${title}"? Это действие нельзя отменить.`,
      () => {
        deleteSectionMutation.mutate(id)
      },
      {
        type: 'danger',
        confirmText: 'Удалить',
        cancelText: 'Отмена'
      }
    )
  };

  const handleDeleteItem = (id: number, title: string) => {
    confirm(
      'Удалить элемент',
      `Вы уверены, что хотите удалить элемент "${title}"? Это действие нельзя отменить.`,
      () => {
        deleteItemMutation.mutate(id)
      },
      {
        type: 'danger',
        confirmText: 'Удалить',
        cancelText: 'Отмена'
      }
    )
  }

  const handleNewSectionTitleChange = (value: string) => {
    setNewSectionTitle(value)
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setNewSectionSlug(slug)
  }

  const handleCreateSection = () => {
    if (!newSectionTitle.trim()) return

    const sortOrder = Math.max(0, ...sections.map(s => s.sort_order)) + 1

    createSectionMutation.mutate({
      title: newSectionTitle.trim(),
      slug: newSectionSlug.trim() || newSectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      sort_order: sortOrder,
      listing_type_id: newSectionListingTypeId,
    })
    setNewSectionTitle('')
    setNewSectionSlug('')
    setNewSectionListingTypeId(undefined)
    setShowCreateSectionForm(false)
  }

  const handleUpdateSection = async (id: number, data: Partial<ChecklistSection>) => {
    await ChecklistApi.updateSection(id, data)
    queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
  }

  const handleDuplicateSection = async (section: ChecklistSection) => {
    const duplicateTitle = `${section.title} (Copy)`
    const duplicateSlug = `${section.slug}-copy)`

    // Insert duplicate section right after the original section
    const originalSortOrder = section.sort_order
    const duplicateSortOrder = originalSortOrder + 1

    try {
      // First, update sort_order of all sections that come after the original section
      const sectionsToUpdate = sections
        .filter(s => s.sort_order > originalSortOrder)
        .map(s => ({
          ...s,
          sort_order: s.sort_order + 1
        }))

      // Update all affected sections
      const updatePromises = sectionsToUpdate.map(s =>
        ChecklistApi.updateSection(s.id, { sort_order: s.sort_order })
      )
      await Promise.all(updatePromises)

      // Then create the duplicate section
      const newSection = await ChecklistApi.createSection({
        title: duplicateTitle,
        slug: duplicateSlug,
        sort_order: duplicateSortOrder,
        listing_type_id: section.listing_type_id,
      })

      // Get all items from the original section
      const originalItems = groupedItems[section.id] || []

      // Duplicate all items in the new section
      const itemDuplicationPromises = originalItems.map((item, index) => {
        const duplicateItemTitle = `${item.title} (Copy)`
        const duplicateItemSlug = `${item.slug}-copy)`

        return ChecklistApi.createItem({
          title: duplicateItemTitle,
          description: item.description,
          slug: duplicateItemSlug,
          sort_order: index + 1,
          is_active: item.is_active,
          listing_type_id: item.listing_type_id,
          media_max_files: item.media_max_files,
          media_allowed_types: item.media_allowed_types,
          answer_type_id: item.answer_type.id,
          media_requirement_id: item.media_requirement.id,
          section_id: newSection.id,
        })
      })

      // Wait for all items to be duplicated
      await Promise.all(itemDuplicationPromises)

      // Show success message
      toast.success(`Section duplicated with ${originalItems.length} items`)

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['checklist_sections_full'] })
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
    } catch (error) {
      toast.error('Failed to duplicate section')
      console.error('Error duplicating section:', error)
    }
  }

  const handleAddItemSuccess = () => {
    // Item editing is now handled in ChecklistSectionCard
  }

  const handleAddItemCancel = () => {
    // Item editing is now handled in ChecklistSectionCard
  }

  const handleStartEdit = React.useCallback((sectionId: number, itemId: number) => {
    // Item editing is now handled in ChecklistSectionCard
    console.log(sectionId, itemId);
  }, [])

  const handleStartAddItem = React.useCallback((sectionId: number) => {
    // Item editing is now handled in ChecklistSectionCard
    console.log(sectionId);
  }, [])

  // Reorder functionality
  const handleOpenReorderModal = () => {
    // Create a copy with updated sort_order based on current index
    const sectionsWithOrder = sections.map((section, index) => ({
      ...section,
      sort_order: index + 1
    }))

    openReorderModal(
      sectionsWithOrder,
      (updatedSections) => {
        updateSectionOrderMutation.mutate(updatedSections)
      },
      () => {
        // Handle cancel - modal will be closed automatically
      },
      {
        isLoading: updateSectionOrderMutation.isPending,
        getListingTypeName: (id) => getListingTypeName(id)
      }
    )
  }


  // Active item handler - now handled in ChecklistSectionCard
  const handleItemClick = React.useCallback((itemId: number) => {
    // Item editing is now handled in ChecklistSectionCard
    console.log(itemId);
  }, [])

  // Set up mutation queue callbacks
  React.useEffect(() => {
    setCallbacks({
      onStart: (item) => {
        console.log(`Starting reorder operation for section ${item.sectionId}`)
      },
      onSuccess: (item) => {
        // Invalidate and refetch items to get updated order
        // queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
        const itemCount = item.items.length
        toast.success(`${itemCount} item${itemCount !== 1 ? 's' : ''} in section ${item.sectionId} reordered successfully`)
      },
      onError: (item, error) => {
        console.error(`Failed to reorder items in section ${item.sectionId}:`, error)
        toast.error(`Failed to reorder items in section ${item.sectionId}`)
      },
      onComplete: (status) => {
        console.log('Mutation queue completed:', status)
      }
    })
  }, [setCallbacks, queryClient])

  // Item reordering handler using mutation queue
  const handleReorderItems = React.useCallback((sectionId: number, reorderedItems: ChecklistItemFull[], originalItems?: ChecklistItemFull[]) => {
    // Add operation to queue instead of executing immediately
    const operationId = addReorderOperation(sectionId, reorderedItems, originalItems)
    console.log(`Added reorder operation ${operationId} to queue`)
  }, [addReorderOperation])

  const loading = sectionsQuery.isLoading || itemsQuery.isLoading || listingTypesQuery.isLoading
  const error = sectionsQuery.isError || itemsQuery.isError || listingTypesQuery.isError

  const { openCreateSectionModal } = useChecklistModals();
  const onPressCreateSection = React.useCallback(() => {
    if (window.innerWidth < 767) {
      openCreateSectionModal();
      return
    }
    if (showCreateSectionForm) {
      setNewSectionTitle('')
      setNewSectionListingTypeId(undefined)
    }
    setShowCreateSectionForm(!showCreateSectionForm)
  }, [showCreateSectionForm, openCreateSectionModal]);

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="sticky flex flex-col justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
          <h1 className="text-md md:text-2xl font-semibold">Форма ответов</h1>
          <QueueStatusIndicator compact/>
        </div>
        {/* <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <FilterX className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          )}
          <Button
            variant={hasActiveFilters ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {Object.values(filters).reduce((count, value) =>
                  count + (Array.isArray(value) ? value.length : (value ? 1 : 0)), 0
                )}
              </span>
            )}
          </Button>
        </div> */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onPressCreateSection}
            variant={showCreateSectionForm ? "outline" : "default"}
          >
            {showCreateSectionForm ? (
              <>
                <X className="w-4 h-4 mr-2"/>
                Отмена
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2"/>
                Добавить секцию
              </>
            )}
          </Button>

          {/* Preview Button */}
          {sections.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/admin/checklists/editor/preview`)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}

          {/* {!sectionsQuery.isFetching && sections?.length && ( */}
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenReorderModal}
            >
              <GripVertical className="w-4 h-4 mr-2"/>
              Переместить секции
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (collapsedSections.size === sections?.length) {
                  // If all collapsed, expand all
                  setCollapsedSections(new Set())
                } else {
                  // Otherwise, collapse all
                  setCollapsedSections(new Set(sections.map(s => s.id)))
                }
              }}
            >
              {collapsedSections.size === sections?.length ? (
                <>
                  <ChevronDown className="w-4 h-4"/>
                  {/* Развернуть */}
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4"/>
                  {/* Свернуть */}
                </>
              )}
            </Button>
          </>
          {/* )} */}
        </div>

        {/* Listing Type Filters */}
        <SelectRow
          value={filters.listing_type_id?.[0]}
          onChange={(value) => setFilters({
            ...filters,
            listing_type_id: value && value !== 'all' ? [Number(value)] : undefined
          })}
          variant="buttons"
          options={[
            { value: 'all', label: 'Все' },
            ...(listingTypes || []).map((type) => ({
              value: type.id,
              label: type.name
            }))
          ]}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-destructive">Не удалось загрузить отчет</div>
      ) : (
        <div className="space-y-6">
          {/* Filter Panel */}
          {showFilters && (
            <ChecklistFilterPanel
              filters={filters}
              listingTypes={listingTypes}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
              onClose={() => setShowFilters(false)}
              sectionsCount={sections.length}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          {/* Add New Section */}
          {showCreateSectionForm && (
            <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle>Add New Section</CardTitle>
              </CardHeader>
              <CardContent className="px-1 md:px-6">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1">
                    <Label htmlFor="section-title">Section Title</Label>
                    <Input
                      id="section-title"
                      value={newSectionTitle}
                      onChange={(e) => handleNewSectionTitleChange(e.target.value)}
                      placeholder="Enter section title..."
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="section-slug">Slug</Label>
                    <Input
                      id="section-slug"
                      value={newSectionSlug}
                      onChange={(e) => setNewSectionSlug(e.target.value)}
                      placeholder="section-slug"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="section-listing-type">Listing Type</Label>
                    <Select
                      id="section-listing-type"
                      value={newSectionListingTypeId}
                      onChange={(value) => setNewSectionListingTypeId(value ? Number(value) : undefined)}
                      placeholder="Select listing type"
                      options={[
                        { value: '', label: 'All' },
                        ...(listingTypesQuery.data?.listing_types?.map((type) => ({
                          value: type.id,
                          label: type.name
                        })) || [])
                      ]}
                    />
                  </div>
                  <div className="flex flex-row items-end gap-2">
                    <Button
                      onClick={handleCreateSection}
                      disabled={!newSectionTitle.trim() || createSectionMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить секцию
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateSectionForm(false)
                        setNewSectionTitle('')
                        setNewSectionSlug('')
                        setNewSectionListingTypeId(undefined)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections and Items */}
          {sections.map((section, index) => (
            <ChecklistSectionCard
              key={section.id}
              index={index}
              allCount={sections.length}
              section={section}
              groupedItems={groupedItems}
              collapsed={collapsedSections.has(section.id)}
              showAddItemForm={null}
              showAddItemId={null}
              activeItemId={null}
              onToggleCollapse={toggleSectionCollapse}
              onToggleAllItems={toggleAllItems}
              onStartAddItem={handleStartAddItem}
              onDeleteSection={handleDeleteSection}
              onDuplicateSection={handleDuplicateSection}
              onUpdateSection={handleUpdateSection}
              onEditSuccess={handleAddItemSuccess}
              onEditCancel={handleAddItemCancel}
              onStartEdit={handleStartEdit}
              onDeleteItem={handleDeleteItem}
              onItemClick={handleItemClick}
              getListingTypeName={getListingTypeName}
              listingTypes={listingTypesQuery.data?.listing_types || []}
              isDeleteSectionPending={deleteSectionMutation.isPending}
              isDeleteItemPending={deleteItemMutation.isPending}
              onReorderItems={handleReorderItems}
            />
          ))}

          {sections.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No sections created yet.</p>
                <p className="text-sm text-muted-foreground">Create your first section above to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

    </div>
  )
}