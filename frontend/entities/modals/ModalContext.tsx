"use client"

import * as React from "react"

// const ChecklistItemForm = React.lazy(() => import("@/components/ChecklistItemForm"))

import ChecklistItemForm from '@/components/ChecklistItemForm';
import ListingTypeForm from '@/components/ListingTypeForm';
import ConfirmationModal from '@/components/ConfirmationModal';
import ReorderSectionsModal from '@/components/ReorderSectionsModal';
import { useKeyboardHooks } from '@/hooks/useKeyboardHooks';
import { type ChecklistSection } from '@/entities/checklist/api';

// Define modal types
export type ModalType =
  | "checklist-item-create"
  | "checklist-item-edit"
  | "listing-type-create"
  | "listing-type-edit"
  | "confirmation"
  | "reorder-sections"
  | null

export interface ChecklistItemCreatePayload {
  sectionId: number
}

export interface ChecklistItemEditPayload {
  itemId: number
  sectionId?: number
}

export interface ListingTypeCreatePayload {
  // No initial data needed for create
}

export interface ListingTypeEditPayload {
  id: number
  name: string
  slug: string
}

export interface ConfirmationPayload {
  title: string
  message: string
  type?: 'warning' | 'info' | 'success' | 'danger'
  confirmText?: string
  cancelText?: string
  onConfirm: () => boolean
  isLoading?: boolean
}

export interface ReorderSectionsPayload {
  sections: ChecklistSection[]
  onSave: (sections: ChecklistSection[]) => void
  onCancel: () => void
  isLoading?: boolean
  getListingTypeName: (id: number) => string | null
}

export type ModalPayload =
  | ChecklistItemCreatePayload
  | ChecklistItemEditPayload
  | ListingTypeCreatePayload
  | ListingTypeEditPayload
  | ConfirmationPayload
  | ReorderSectionsPayload
  | null

export interface ModalState {
  type: ModalType
  payload: ModalPayload
  isOpen: boolean
}

export interface ModalContextType {
  modalState: ModalState
  openModal: (type: ModalType, payload: ModalPayload) => void
  closeModal: () => void
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = React.useState<ModalState>({
    type: null,
    payload: null,
    isOpen: false
  })

  const openModal = React.useCallback((type: ModalType, payload: ModalPayload) => {
    setModalState({
      type,
      payload,
      isOpen: true
    })
  }, [])

  const closeModal = React.useCallback(() => {
    setModalState({
      type: null,
      payload: null,
      isOpen: false
    })
  }, [])

  // Handle Escape key to close modal
  useKeyboardHooks({
    onEscape: modalState.isOpen ? closeModal : undefined,
    isActive: modalState.isOpen
  })

  const contextValue = React.useMemo(() => ({
    modalState,
    openModal,
    closeModal
  }), [modalState, openModal, closeModal])

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = React.useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export function useConfirmation() {
  const { openModal, closeModal } = useModal()

  const confirm = React.useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      type?: 'warning' | 'info' | 'success' | 'danger'
      confirmText?: string
      cancelText?: string
      isLoading?: boolean
    }
  ) => {
    openModal('confirmation', {
      title,
      message,
      type: options?.type || 'warning',
      confirmText: options?.confirmText || 'Подтвердить',
      cancelText: options?.cancelText || 'Отмена',
      onConfirm,
      isLoading: options?.isLoading || false
    })
  }, [openModal])

  return { confirm, closeModal }
}

export function useReorderSections() {
  const { openModal, closeModal } = useModal()

  const openReorderModal = React.useCallback((
    sections: ChecklistSection[],
    onSave: (sections: ChecklistSection[]) => void,
    onCancel: () => void,
    options?: {
      isLoading?: boolean
      getListingTypeName: (id: number) => string | null
    }
  ) => {
    openModal('reorder-sections', {
      sections,
      onSave,
      onCancel,
      isLoading: options?.isLoading || false,
      getListingTypeName: options?.getListingTypeName || (() => null)
    })
  }, [openModal])

  return { openReorderModal, closeModal }
}

export function ModalContent({
  type,
  payload,
  onSuccess,
  onCancel
}: {
  type: ModalType
  payload: ModalPayload
  onSuccess?: () => void
  onCancel?: () => void
}) {
  switch (type) {
    case "checklist-item-create":
      const createPayload = payload as ChecklistItemCreatePayload
      return (
        <ChecklistItemForm
          sectionId={createPayload?.sectionId}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )

    case "checklist-item-edit":
      const editPayload = payload as ChecklistItemEditPayload
      return (
        <ChecklistItemForm
          itemId={editPayload?.itemId}
          sectionId={editPayload?.sectionId}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )

    case "listing-type-create":
      return (
        <ListingTypeForm
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )

    case "listing-type-edit":
      const listingTypeEditPayload = payload as ListingTypeEditPayload
      return (
        <ListingTypeForm
          listingTypeId={listingTypeEditPayload?.id}
          initialData={{
            name: listingTypeEditPayload?.name || '',
            slug: listingTypeEditPayload?.slug || ''
          }}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )

    case "confirmation":
      const confirmationPayload = payload as ConfirmationPayload
      return (
        <ConfirmationModal
          title={confirmationPayload?.title || ''}
          message={confirmationPayload?.message || ''}
          type={confirmationPayload?.type}
          confirmText={confirmationPayload?.confirmText}
          cancelText={confirmationPayload?.cancelText}
          onConfirm={confirmationPayload?.onConfirm || (() => {})}
          onCancel={onCancel || (() => {})}
          isLoading={confirmationPayload?.isLoading}
        />
      )

    case "reorder-sections":
      const reorderPayload = payload as ReorderSectionsPayload
      return (
        <ReorderSectionsModal
          sections={reorderPayload?.sections || []}
          onSave={reorderPayload?.onSave || (() => {})}
          onCancel={onCancel || (() => {})}
          isLoading={reorderPayload?.isLoading}
          getListingTypeName={reorderPayload?.getListingTypeName || (() => null)}
        />
      )

    default:
      return null
  }
}
