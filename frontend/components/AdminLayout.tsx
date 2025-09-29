"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useModal, ModalContent } from "@/entities/modals/ModalContext"
import {Modal, ModalSize} from "@/components/ui/modal"

interface AdminLayoutProps {
  children: React.ReactNode
}

  const getModalConfig = (type: string): { size?: ModalSize, title: string | undefined; position: "center" | "right" } => {
    switch (type) {
      case "checklist-item-create":
        return {
          title: "Создание вопросы формы",
          position: "right" as const
        }
      case "checklist-item-edit":
        return {
          title: "Редактирование вопросы формы",
          position: "right" as const
        }
      case "listing-type-create":
        return {
          title: "Создание типа объекта",
          position: "right" as const
        }
      case "listing-type-edit":
        return {
          title: "Редактировать тип объекта",
          position: "right" as const
        }
      case "confirmation":
        return {
          size: "sm" as const,
          title: undefined,
          position: "center" as const
        }
      default:
        return {
          title: "Modal",
          position: "center" as const
        }
    }
  }

function ModalContainer() {
  const { modalState, closeModal } = useModal()
  const queryClient = useQueryClient()

  const handleModalSuccess = React.useCallback(() => {
    closeModal()
    // Refresh relevant data based on modal type
    if (modalState.type?.includes('checklist-item')) {
      queryClient.invalidateQueries({ queryKey: ['checklist_items_full'] })
    } else if (modalState.type?.includes('listing-type')) {
      queryClient.invalidateQueries({ queryKey: ['listing_types'] })
    }
  }, [closeModal, queryClient, modalState.type])

  const handleModalCancel = React.useCallback(() => {
    closeModal()
  }, [closeModal])

  const modalConfig = modalState.type ? getModalConfig(modalState.type) : null

  if (modalState.isOpen && modalConfig) {
    return (
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        size={modalConfig.size}
        position={modalConfig.position}
      >
        <div className="p-4 pb-20">
          <ModalContent
            type={modalState.type}
            payload={modalState.payload}
            onSuccess={handleModalSuccess}
            onCancel={handleModalCancel}
          />
        </div>
      </Modal>
    );
  }
  return undefined;
}

export function AdminLayout({ children }: AdminLayoutProps) {

  return (
    <div className="min-h-screen">
      {children}

      <ModalContainer />
    </div>
  )
}
