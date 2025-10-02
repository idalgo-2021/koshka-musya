'use client'
import {QueryClientProvider} from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {getQueryClient} from './react-query';
import type * as React from 'react'
import {Suspense} from "react";
import { ModalProvider, useModal, ModalContent } from '@/entities/modals/ModalContext';
import { Modal } from '@/components/ui/modal';
import { ImageViewerProvider } from '@/contexts/ImageViewerContext';
import { ImageViewer } from '@/components/ImageViewer';

function ModalRenderer() {
  const { modalState, closeModal } = useModal();

  if (!modalState.isOpen) return null;

  return (
    <Modal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      title=""
      size="md"
      position="center"
    >
      <div className="p-4">
        <ModalContent
          type={modalState.type}
          payload={modalState.payload}
          onSuccess={closeModal}
          onCancel={closeModal}
        />
      </div>
    </Modal>
  );
}

export default function Providers({children}: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ImageViewerProvider>
        <ModalProvider>
          <Suspense>
            {children}
          </Suspense>
          <ModalRenderer />
          <ImageViewer />
        </ModalProvider>
      </ImageViewerProvider>
      {/*<ReactQueryDevtools />*/}
    </QueryClientProvider>
  )
}
