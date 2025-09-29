import { useModal } from "@/entities/modals/ModalContext"

/**
 * Custom hook for checklist-related modal operations
 * Provides convenient methods for opening checklist modals
 */
export function useChecklistModals() {
  const { openModal, closeModal } = useModal()

  const openCreateItemModal = (sectionId: number) => {
    openModal("checklist-item-create", { sectionId })
  }

  const openEditItemModal = (itemId: number, sectionId?: number) => {
    openModal("checklist-item-edit", { itemId, sectionId })
  }

  return {
    openCreateItemModal,
    openEditItemModal,
    closeModal
  }
}
