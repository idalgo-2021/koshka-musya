import { useModal } from "@/entities/modals/ModalContext"
import { ListingType } from "@/entities/listings/api"

/**
 * Custom hook for listing type modal operations
 * Provides convenient methods for opening listing type modals
 */
export function useListingTypeModals() {
  const { openModal, closeModal } = useModal()

  const openCreateModal = () => {
    openModal("listing-type-create", {})
  }

  const openEditModal = (listingType: ListingType) => {
    openModal("listing-type-edit", {
      id: listingType.id,
      name: listingType.name,
      slug: listingType.slug
    })
  }

  return {
    openCreateModal,
    openEditModal,
    closeModal
  }
}
