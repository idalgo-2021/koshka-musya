import * as React from "react"
import { useModal } from "@/entities/modals/ModalContext"

/**
 * Custom hook for checklist-related modal operations
 * Provides convenient methods for opening checklist modals
 */
export function useChecklistModals() {
  const { openModal, closeModal } = useModal()

  const openCreateItemModal = React.useCallback((sectionId: number) => {
    openModal("checklist-item-create", { sectionId })
  }, [openModal])

  const openEditItemModal = React.useCallback((itemId: number, sectionId?: number) => {
    openModal("checklist-item-edit", { itemId, sectionId })
  }, [openModal])

  const openCreateSectionModal = React.useCallback(() => {
    openModal("checklist-section-create", {})
  }, [openModal])

  const openEditSectionModal = React.useCallback((sectionId: number) => {
    openModal("checklist-section-edit", { sectionId })
  }, [openModal])

  return {
    openCreateItemModal,
    openEditItemModal,
    openCreateSectionModal,
    openEditSectionModal,
    closeModal
  }
}
