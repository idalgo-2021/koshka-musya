"use client"

import * as React from 'react'
import { Plus, Trash2, Copy, Save, X, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown'
import Select from '@/components/ui/select'
import ChecklistItemForm from '@/components/ChecklistItemForm'
import ChecklistItemCard from '@/components/ChecklistItemCard'

import { type ChecklistSection, type ChecklistItemFull } from '@/entities/checklist/api'
import { useEscapeKey } from '@/hooks/useEventHooks'
import { useChecklistModals } from '@/hooks/useChecklistModals'

interface ChecklistSectionCardProps {
  index: number
  allCount: number
  section: ChecklistSection
  groupedItems: Record<number, ChecklistItemFull[]>
  collapsed: boolean;
  showAddItemForm: number | null
  showAddItemId: number | null
  activeItemId: number | null
  onToggleCollapse: (sectionId: number) => void
  onToggleAllItems: (sectionId: number) => void
  onStartAddItem: (sectionId: number) => void
  onDeleteSection: (id: number, title: string) => void
  onDuplicateSection: (section: ChecklistSection) => void
  onUpdateSection: (id: number, data: Partial<ChecklistSection>) => Promise<void>
  onEditSuccess: () => void
  onEditCancel: () => void
  onStartEdit: (sectionId: number, itemId: number) => void
  onDeleteItem: (id: number, title: string) => void
  onItemClick: (itemId: number) => void
  getListingTypeName: (listingTypeId?: number) => string | null
  listingTypes: Array<{ id: number; name: string }>
  isDeleteSectionPending: boolean
  isDeleteItemPending: boolean
  onReorderItems?: (sectionId: number, reorderedItems: ChecklistItemFull[], originalItems?: ChecklistItemFull[]) => void
}

const backgroundColor = 'rgb(103, 58, 183)';

function ChecklistSectionCard({
  index,
  allCount,
  section,
  groupedItems,
  collapsed,
  showAddItemForm,
  showAddItemId,
  activeItemId,
  onToggleCollapse,
  // onToggleAllItems,
  onStartAddItem,
  onDeleteSection,
  onDuplicateSection,
  onUpdateSection,
  onEditSuccess,
  onEditCancel,
  // onStartEdit,
  onDeleteItem,
  // onItemClick,
  getListingTypeName,
  listingTypes,
  isDeleteSectionPending,
  isDeleteItemPending,
  onReorderItems
} : ChecklistSectionCardProps) {

  // Local state for item editing within this section
  const [localActiveItemId, setLocalActiveItemId] = React.useState<number | null>(null)
  const [localShowAddItemForm, setLocalShowAddItemForm] = React.useState<number | null>(null)
  const [localShowAddItemId, setLocalShowAddItemId] = React.useState<number | null>(null)

  // Local state for section editing
  const [isEditingSection, setIsEditingSection] = React.useState(false)
  const [sectionTitle, setSectionTitle] = React.useState(section.title)
  const [sectionSlug, setSectionSlug] = React.useState(section.slug)
  const [sectionListingTypeId, setSectionListingTypeId] = React.useState(section.listing_type_id)

  // Handle item click with local state management
  const handleItemClick = React.useCallback((itemId: number) => {
    setLocalActiveItemId(itemId)
    setLocalShowAddItemForm(section.id)
    setLocalShowAddItemId(itemId)
  }, [section.id])

  // Handle start edit with local state management
  const handleStartEdit = React.useCallback((itemId: number) => {
    setLocalActiveItemId(itemId)
    setLocalShowAddItemForm(section.id)
    setLocalShowAddItemId(itemId)
  }, [section.id])

  // Handle edit success - clear local state and call parent callback
  const handleEditSuccess = React.useCallback(() => {
    setLocalShowAddItemForm(null)
    setLocalShowAddItemId(null)
    setLocalActiveItemId(null)
    onEditSuccess()
  }, [onEditSuccess])

  // Handle edit cancel - clear local state and call parent callback
  const handleEditCancel = React.useCallback(() => {
    setLocalShowAddItemForm(null)
    setLocalShowAddItemId(null)
    setLocalActiveItemId(null)
    onEditCancel()
  }, [onEditCancel])
  const { openCreateItemModal } = useChecklistModals()
  // Handle start add item with local state management
  const handleStartAddItem = React.useCallback(() => {
    if (window.innerWidth < 767) {
      openCreateItemModal(section.id);
      return;
    }
    // If section is collapsed, expand it first
    if (collapsed) {
      onToggleCollapse(section.id)
    }

    setLocalShowAddItemForm(section.id)
    setLocalShowAddItemId(null)
    onStartAddItem(section.id)
  }, [section.id, collapsed, onToggleCollapse, onStartAddItem])

  // Section editing handlers
  const handleStartSectionEdit = React.useCallback(() => {
    setIsEditingSection(true)
    setSectionTitle(section.title)
    setSectionSlug(section.slug)
    setSectionListingTypeId(section.listing_type_id)
  }, [section.title, section.slug, section.listing_type_id])

  const handleSaveSectionEdit = React.useCallback(async () => {
    if (!sectionTitle.trim()) return

    try {
      await onUpdateSection(section.id, {
        title: sectionTitle.trim(),
        slug: sectionSlug.trim(),
        listing_type_id: sectionListingTypeId
      })
      setIsEditingSection(false)
    } catch (error) {
      console.error('Failed to update section:', error)
    }
  }, [section.id, sectionTitle, sectionSlug, sectionListingTypeId, onUpdateSection])

  const handleCancelSectionEdit = React.useCallback(() => {
    setIsEditingSection(false)
    setSectionTitle(section.title)
    setSectionSlug(section.slug)
    setSectionListingTypeId(section.listing_type_id)
  }, [section.title, section.slug, section.listing_type_id])

  // Handle section card click - enter editing mode
  const handleSectionCardClick = React.useCallback(() => {
    // If there's active item editing, cancel it first
    if (localShowAddItemForm === section.id) {
      handleEditCancel()
    }

    // Enter section editing mode
    handleStartSectionEdit()
  }, [localShowAddItemForm, section.id, handleEditCancel, handleStartSectionEdit])

  // Handle section collapse with editing cancellation
  const handleToggleCollapse = React.useCallback(() => {
    // If collapsing and there's active editing, cancel it
    if (!collapsed) {
      // Section is being collapsed - cancel any active editing
      if (isEditingSection) {
        handleCancelSectionEdit()
      }
      if (localShowAddItemForm === section.id) {
        handleEditCancel()
      }
    }

    onToggleCollapse(section.id)
  }, [collapsed, isEditingSection, localShowAddItemForm, section.id, onToggleCollapse, handleCancelSectionEdit, handleEditCancel])

  // Auto-generate slug from title
  const handleTitleChange = React.useCallback((value: string) => {
    setSectionTitle(value)
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setSectionSlug(slug)
  }, [])

  // Handle keyboard events
  useEscapeKey(() => {
    if (isEditingSection) {
      handleCancelSectionEdit()
    } else if (localShowAddItemForm === section.id) {
      handleEditCancel()
    }
  }, isEditingSection || localShowAddItemForm === section.id)


  // Use local state if available, otherwise fall back to props
  const currentActiveItemId = localActiveItemId || activeItemId
  const currentShowAddItemForm = localShowAddItemForm || showAddItemForm
  const currentShowAddItemId = localShowAddItemId || showAddItemId

  // Item reordering state
  const [draggedItemIndex, setDraggedItemIndex] = React.useState<number | null>(null)
  const [dragOverItemIndex, setDragOverItemIndex] = React.useState<number | null>(null)

  // Item drag and drop handlers
  const handleItemDragStart = React.useCallback((e: React.DragEvent, itemIndex: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
    setDraggedItemIndex(itemIndex)
  }, [])

  const handleItemDragOver = React.useCallback((e: React.DragEvent, itemIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedItemIndex !== null && draggedItemIndex !== itemIndex) {
      setDragOverItemIndex(itemIndex)
    }
  }, [draggedItemIndex])

  const handleItemDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverItemIndex(null)
  }, [])

  const handleItemDrop = React.useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null)
      setDragOverItemIndex(null)
      return
    }

    // Get the items for this section
    const items = groupedItems[section.id] || []
    if (items.length === 0) return

    // Store original items for comparison
    const originalItems = [...items]

    // Create new order by swapping items
    const newItems = [...items]
    const temp = newItems[draggedItemIndex]
    newItems[draggedItemIndex] = newItems[dropIndex]
    newItems[dropIndex] = temp

    // Update sort_order for all items in the section
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }))

    // Get the dragged item (the one that was moved)
    // const draggedItem = items[draggedItemIndex]

    // Call parent callback to update the items with original items for comparison
    if (onReorderItems) {
      onReorderItems(section.id, updatedItems, originalItems)
    }

    setDraggedItemIndex(null)
    setDragOverItemIndex(null)
  }, [draggedItemIndex, groupedItems, section.id, onReorderItems])

  const handleItemDragEnd = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDraggedItemIndex(null)
    setDragOverItemIndex(null)
  }, [])
  return (
    <Card
      key={section.id}
      className="transition-all duration-200 ease-in-out shadow-none gap-0 border-0"
    >
      <div className="w-fit" style={{
        backgroundColor: backgroundColor,
        color: 'rgba(255, 255, 255, 1)',
        padding: '8px 16px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}>
        {`Секция ${index + 1} из ${allCount}`}
      </div>
      <div className="w-full h-2" style={{
        backgroundColor: backgroundColor,
        borderTopRightRadius: 8,
      }} ></div>
      <CardHeader className="px-3 border-1 py-2">

        <div className="flex flex-col md:flex-row justify-between">
          {isEditingSection ? (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <Input
                  value={sectionTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Section title"
                  className="flex-1"
                  autoFocus
                />
                <Input
                  value={sectionSlug}
                  onChange={(e) => setSectionSlug(e.target.value)}
                  placeholder="section-slug"
                  className="flex-1"
                />
                <div className="flex-1">
                  <Select
                    value={sectionListingTypeId}
                    onChange={(value) => setSectionListingTypeId(value ? Number(value) : undefined)}
                    placeholder="Select listing typ"
                    options={[
                      { value: '', label: 'Select listing type' },
                      ...listingTypes.map((type) => ({
                        value: type.id,
                        label: type.name
                      }))
                    ]}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSaveSectionEdit}
                  disabled={!sectionTitle.trim()}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelSectionEdit}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <CardTitle
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleSectionCardClick}
            >
              {/*<GripVertical className="w-4 h-4 text-muted-foreground"/>*/}
              <div className="flex items-center gap-2 md:flex-row flex-col">
                <div className="flex ">
                  <span>{section.title + ' | ' + section.slug}</span>
                </div>
                <div className="flex flex-row">
                  <span className="h-fit px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {groupedItems[section.id]?.length || 0} item{(groupedItems[section.id]?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  {getListingTypeName(section.listing_type_id) && (
                    <span className="h-fit px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {getListingTypeName(section.listing_type_id)}
                    </span>
                  )}
                </div>
              </div>
            </CardTitle>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              title="Toggle all items"
            >
              {collapsed ? <ChevronDown className="w-4 h-4"/> : <ChevronUp className="w-4 h-4"/>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartAddItem}
            >
              <Plus className="w-4 h-4 mr-2"/>
              Add Item
            </Button>
            <Dropdown
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4"/>
                </Button>
              }
              align="right"
            >
              <DropdownItem onClick={() => onDuplicateSection(section)}>
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4"/>
                  Duplicate Section
                </div>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={() => onDeleteSection(section.id, section.title)}
                disabled={isDeleteSectionPending}
                className="text-red-600 hover:bg-red-50"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4"/>
                  Delete Section
                </div>
              </DropdownItem>
            </Dropdown>

          </div>
        </div>
      </CardHeader>

      <div
        className={`transition-all duration-150 ease-in-out overflow-hidden ${
         collapsed
            ? 'max-h-0 opacity-0'
            : 'max-h-[2000px] opacity-100'
        }`}
      >
        <CardContent className="px-0  pl-0 pr-0">
          {groupedItems[section.id]?.length > 0 ? (
            <div className="space-y-1 md:space-y-2">
              {groupedItems[section.id].map((item, itemIndex) => {
                const isDragged = draggedItemIndex === itemIndex
                const isDragOver = dragOverItemIndex === itemIndex
                const isSwapTarget = draggedItemIndex !== null && draggedItemIndex !== itemIndex && dragOverItemIndex === itemIndex

                return (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    section={section}
                    itemIndex={itemIndex}
                    collapsed={collapsed}
                    isEditing={ currentShowAddItemForm === section.id && currentShowAddItemId === item.id}
                    isActive={item.id === currentActiveItemId}
                    onEditSuccess={handleEditSuccess}
                    onEditCancel={handleEditCancel}
                    onStartEdit={handleStartEdit}
                    onDelete={onDeleteItem}
                    onItemClick={handleItemClick}
                    isDeletePending={isDeleteItemPending}
                    // Drag and drop props
                    onDragStart={handleItemDragStart}
                    onDragOver={handleItemDragOver}
                    onDragLeave={handleItemDragLeave}
                    onDrop={handleItemDrop}
                    onDragEnd={handleItemDragEnd}
                    isDragged={isDragged}
                    isDragOver={isDragOver}
                    isSwapTarget={isSwapTarget}
                  />
                )
              })}
            </div>
          ) : (
            <div
              className={`text-center py-8 text-muted-foreground transition-all duration-150 ease-in-out ${
                collapsed
                  ? 'opacity-0 translate-y-[-10px]'
                  : 'opacity-100 translate-y-0'
              }`}
              style={{
                transitionDelay: collapsed ? '0ms' : '100ms'
              }}
            >
              <p>No items in this section yet.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleStartAddItem}
              >
                <Plus className="w-4 h-4 mr-2"/>
                Add First Item
              </Button>
            </div>
          )}

          {/* Inline Add Item Form */}
          {currentShowAddItemForm === section.id && currentShowAddItemId === null && (
            <div className="mt-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <ChecklistItemForm
                sectionId={section.id}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
                inline
              />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

export default React.memo(ChecklistSectionCard);
