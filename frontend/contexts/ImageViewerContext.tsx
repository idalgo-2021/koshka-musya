"use client"

import * as React from 'react'

interface ImageViewerState {
  isOpen: boolean
  imageUrl: string | null
  imageTitle: string | null
  imageScale: number
  imageRotation: number
  imagePosition: { x: number; y: number }
  isDragging: boolean
  dragStart: { x: number; y: number }
}

interface ImageViewerContextType {
  state: ImageViewerState
  openViewer: (imageUrl: string, imageTitle?: string) => void
  closeViewer: () => void
  setImageScale: (scale: number) => void
  setImageRotation: (rotation: number) => void
  setImagePosition: (position: { x: number; y: number }) => void
  setIsDragging: (isDragging: boolean) => void
  setDragStart: (dragStart: { x: number; y: number }) => void
  resetImageTransform: () => void
}

const ImageViewerContext = React.createContext<ImageViewerContextType | undefined>(undefined)

const initialState: ImageViewerState = {
  isOpen: false,
  imageUrl: null,
  imageTitle: null,
  imageScale: 1,
  imageRotation: 0,
  imagePosition: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 }
}

export function ImageViewerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ImageViewerState>(initialState)

  const openViewer = React.useCallback((imageUrl: string, imageTitle?: string) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      imageUrl,
      imageTitle: imageTitle || null,
      imageScale: 1,
      imageRotation: 0,
      imagePosition: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    }))
  }, [])

  const closeViewer = React.useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      imageUrl: null,
      imageTitle: null,
      imageScale: 1,
      imageRotation: 0,
      imagePosition: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    }))
  }, [])

  const setImageScale = React.useCallback((scale: number) => {
    setState(prev => ({ ...prev, imageScale: scale }))
  }, [])

  const setImageRotation = React.useCallback((rotation: number) => {
    setState(prev => ({ ...prev, imageRotation: rotation }))
  }, [])

  const setImagePosition = React.useCallback((position: { x: number; y: number }) => {
    setState(prev => ({ ...prev, imagePosition: position }))
  }, [])

  const setIsDragging = React.useCallback((isDragging: boolean) => {
    setState(prev => ({ ...prev, isDragging }))
  }, [])

  const setDragStart = React.useCallback((dragStart: { x: number; y: number }) => {
    setState(prev => ({ ...prev, dragStart }))
  }, [])

  const resetImageTransform = React.useCallback(() => {
    setState(prev => ({
      ...prev,
      imageScale: 1,
      imageRotation: 0,
      imagePosition: { x: 0, y: 0 }
    }))
  }, [])

  const value = React.useMemo(() => ({
    state,
    openViewer,
    closeViewer,
    setImageScale,
    setImageRotation,
    setImagePosition,
    setIsDragging,
    setDragStart,
    resetImageTransform
  }), [
    state,
    openViewer,
    closeViewer,
    setImageScale,
    setImageRotation,
    setImagePosition,
    setIsDragging,
    setDragStart,
    resetImageTransform
  ])

  return (
    <ImageViewerContext.Provider value={value}>
      {children}
    </ImageViewerContext.Provider>
  )
}

export function useImageViewer() {
  const context = React.useContext(ImageViewerContext)
  if (context === undefined) {
    throw new Error('useImageViewer must be used within an ImageViewerProvider')
  }
  return context
}
