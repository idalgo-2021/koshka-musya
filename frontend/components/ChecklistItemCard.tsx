"use client"

import * as React from 'react'
import { useCallback } from "react";
import { Trash2, GripVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ChecklistItemForm from '@/components/ChecklistItemForm'
import {Badge} from "@/components/ui/badge";

import { type ChecklistItemFull, type ChecklistSection } from '@/entities/checklist/api'
import {useChecklistModals} from "@/hooks/useChecklistModals";


interface ChecklistItemCardProps {
  item: ChecklistItemFull
  section: ChecklistSection
  itemIndex: number
  collapsed: boolean;
  isEditing?: boolean;
  isActive?: boolean;
  onEditSuccess: () => void
  onEditCancel: () => void
  onStartEdit: (sectionId: number, itemId: number) => void
  onDelete: (id: number, title: string) => void
  onItemClick: (itemId: number) => void
  isDeletePending: boolean
  // Drag and drop props
  onDragStart?: (e: React.DragEvent, itemIndex: number) => void
  onDragOver?: (e: React.DragEvent, itemIndex: number) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, itemIndex: number) => void
  onDragEnd?: (e: React.DragEvent) => void
  isDragged?: boolean
  isDragOver?: boolean
  isSwapTarget?: boolean
}

function ChecklistItemCard({
  item,
  section,
  itemIndex,
  collapsed,
  isEditing = false,
  isActive = false,
  onEditSuccess,
  onEditCancel,
  // onStartEdit,
  onDelete,
  onItemClick,
  isDeletePending,
  // Drag and drop props
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragged = false,
  // isDragOver = false,
  isSwapTarget = false
} : ChecklistItemCardProps) {
  const { openEditItemModal } = useChecklistModals()

  const handleItemClick = useCallback(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      openEditItemModal(item.id, section.id);
    } else {
      onItemClick(item.id);
    }
  }, [item, section, onItemClick, openEditItemModal]);

  return (
    <div
      className={`transition-all duration-100 ease-in-out ${
        collapsed
          ? 'opacity-0'
          : 'opacity-100'
      }`}
      style={{
        transitionDelay: collapsed
          ? '0ms'
          : `${50}ms`
      }}
    >
      {isEditing ? (
        // <div className="mt-4 animate-in fade-in-0 duration-100">
          <ChecklistItemForm
            active
            sectionId={section.id}
            itemId={item.id}
            onSuccess={onEditSuccess}
            onCancel={onEditCancel}
            inline
          />
       // </div>
      ) : (
        <div
          // draggable={!isEditing}
          draggable={false}
          onDragStart={onDragStart ? (e) => onDragStart(e, itemIndex) : undefined}
          onDragOver={onDragOver ? (e) => onDragOver(e, itemIndex) : undefined}
          onDragLeave={onDragLeave}
          onDrop={onDrop ? (e) => onDrop(e, itemIndex) : undefined}
          onDragEnd={onDragEnd}
          className={`group flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
            isActive ? 'border-l-4 border-l-[#4285f4] bg-blue-50' : ''
          } ${
            isDragged ? 'opacity-50 scale-95' : ''
          } ${
            isSwapTarget ? 'border-l-4 border-l-[#4285f4] bg-blue-50 transform scale-105' : ''
          }`}
          onClick={handleItemClick}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Drag Handle */}
            <div
              className="p-1 text-gray-400 hover:text-gray-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1">
              <div className="font-medium gap-4 flex ">
                <span>{item.title}</span>
                <Badge className="h-fit" variant={item.is_active ? "default" : "secondary"}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Badge></div>
              <div className="text-sm text-muted-foreground">{item.description}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Answer: {item.answer_type.name} | Media: {item.media_requirement.name}
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center gap-2">
            {/*<Button */}
            {/*  className="h-fit" */}
            {/*  variant="ghost" */}
            {/*  size="sm" */}
            {/*  asChild*/}
            {/*  onClick={(e) => e.stopPropagation()}*/}
            {/*>*/}
            {/*  <a href={`/admin/checklists/items/${item.id}`}>*/}
            {/*    <Eye className="w-4 h-4" />*/}
            {/*  </a>*/}
            {/*</Button>*/}

            {/*<Button*/}
            {/*  className="h-fit"*/}
            {/*  variant="ghost"*/}
            {/*  size="sm"*/}
            {/*  onClick={(e) => {*/}
            {/*    e.stopPropagation()*/}
            {/*    onStartEdit(section.id, item.id)*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <Edit className="w-4 h-4" />*/}
            {/*</Button>*/}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id, item.title)
              }}
              disabled={isDeletePending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ChecklistItemCard);
