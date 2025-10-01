"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GripVertical, X } from 'lucide-react'
import { type ChecklistSection } from '@/entities/checklist/api'
import { vibrateShort } from '@/lib/vibrate'
import { isMobileDevice } from '@/lib/browser'
import { useEventListener } from '@/hooks/useEventHooks'

interface ReorderSectionsModalProps {
  sections: ChecklistSection[]
  onSave: (sections: ChecklistSection[]) => void
  onCancel: () => void
  isLoading?: boolean
  getListingTypeName: (id: number) => string | null
}

export default function ReorderSectionsModal({
  sections,
  onSave,
  onCancel,
  isLoading = false,
  getListingTypeName
}: ReorderSectionsModalProps) {
  const [reorderSections, setReorderSections] = React.useState<ChecklistSection[]>(sections)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  // Listen for resize events to update mobile detection
  useEventListener('resize', React.useCallback(() => {
    setIsMobile(isMobileDevice());
  }, []), { target: window })

  // Update local state when sections prop changes
  React.useEffect(() => {
    setReorderSections(sections)
  }, [sections])

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const newSections = [...reorderSections]
      const temp = newSections[index]
      newSections[index] = newSections[index - 1]
      newSections[index - 1] = temp

      // Update sort_order values based on new positions
      const updatedSections = newSections.map((section, idx) => ({
        ...section,
        sort_order: idx + 1
      }))

      setReorderSections(updatedSections)
    }
  }

  const moveSectionDown = (index: number) => {
    if (index < reorderSections.length - 1) {
      const newSections = [...reorderSections]
      const temp = newSections[index]
      newSections[index] = newSections[index + 1]
      newSections[index + 1] = temp

      // Update sort_order values based on new positions
      const updatedSections = newSections.map((section, idx) => ({
        ...section,
        sort_order: idx + 1
      }))

      setReorderSections(updatedSections)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    // Disable drag on mobile devices
    if (isMobile) {
      e.preventDefault()
      return
    }
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
  }

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(overIndex)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newSections = [...reorderSections]

    // Swap the two elements
    const temp = newSections[draggedIndex]
    newSections[draggedIndex] = newSections[dropIndex]
    newSections[dropIndex] = temp

    // Update sort_order values based on new positions
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      sort_order: idx + 1
    }))

    setReorderSections(updatedSections)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleSave = () => {
    vibrateShort()
    onSave(reorderSections)
  }

  const handleCancel = () => {
    vibrateShort()
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center md:items-center items-end z-50 p-0 md:p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] md:max-h-[80vh] max-h-[90vh] overflow-hidden flex flex-col md:rounded-lg rounded-t-lg">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <span>Переместить секции</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {reorderSections.map((section, index) => {
              const isDragged = draggedIndex === index
              const isSwapTarget = draggedIndex !== null && draggedIndex !== index && dragOverIndex === index

              return (
                <div
                  key={section.id}
                  draggable={!isMobile}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 border rounded-lg bg-gray-50 hover:border-l-4 hover:border-l-[#4285f4] hover:bg-blue-50 transition-all duration-200 md:cursor-move cursor-default ${
                    isDragged ? 'opacity-50 scale-95' : ''
                  } ${
                    isSwapTarget ? 'border-l-4 border-l-[#4285f4] bg-blue-50 transform scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="hidden md:block p-2 text-gray-400 hover:text-gray-600 cursor-move"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground"/>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-sm text-gray-500">
                        {section.listing_type_id ? getListingTypeName(section.listing_type_id) || 'No listing type' : 'No listing type'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                      className="p-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSectionDown(index)}
                      disabled={index === reorderSections.length - 1}
                      className="p-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <div className="flex-shrink-0 border-t bg-white p-4">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить порядок'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
