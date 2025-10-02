"use client"

import * as React from 'react'

export interface ImageItem {
  url: string
  title?: string
  id?: string
}

interface ImageViewerState {
  isOpen: boolean
  images: ImageItem[]
  currentIndex: number
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
  openImageViewer: (images: ImageItem[], startIndex?: number) => void
  closeViewer: () => void
  nextImage: () => void
  previousImage: () => void
  setCurrentIndex: (index: number) => void
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
  images: [],
  currentIndex: 0,
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
      images: [{ url: imageUrl, title: imageTitle }],
      currentIndex: 0,
      imageUrl,
      imageTitle: imageTitle || null,
      imageScale: 1,
      imageRotation: 0,
      imagePosition: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    }))
  }, [])

  const openImageViewer = React.useCallback((images: ImageItem[], startIndex: number = 0) => {
    const index = Math.max(0, Math.min(startIndex, images.length - 1))
    const currentImage = images[index]
    
    setState(prev => ({
      ...prev,
      isOpen: true,
      images,
      currentIndex: index,
      imageUrl: currentImage?.url || null,
      imageTitle: currentImage?.title || null,
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
      images: [],
      currentIndex: 0,
      imageUrl: null,
      imageTitle: null,
      imageScale: 1,
      imageRotation: 0,
      imagePosition: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    }))
  }, [])

  const nextImage = React.useCallback(() => {
    setState(prev => {
      if (prev.images.length <= 1) return prev
      
      const nextIndex = (prev.currentIndex + 1) % prev.images.length
      const nextImage = prev.images[nextIndex]
      
      return {
        ...prev,
        currentIndex: nextIndex,
        imageUrl: nextImage?.url || null,
        imageTitle: nextImage?.title || null,
        imageScale: 1,
        imageRotation: 0,
        imagePosition: { x: 0, y: 0 }
      }
    })
  }, [])

  const previousImage = React.useCallback(() => {
    setState(prev => {
      if (prev.images.length <= 1) return prev
      
      const prevIndex = prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
      const prevImage = prev.images[prevIndex]
      
      return {
        ...prev,
        currentIndex: prevIndex,
        imageUrl: prevImage?.url || null,
        imageTitle: prevImage?.title || null,
        imageScale: 1,
        imageRotation: 0,
        imagePosition: { x: 0, y: 0 }
      }
    })
  }, [])

  const setCurrentIndex = React.useCallback((index: number) => {
    setState(prev => {
      if (index < 0 || index >= prev.images.length) return prev
      
      const image = prev.images[index]
      
      return {
        ...prev,
        currentIndex: index,
        imageUrl: image?.url || null,
        imageTitle: image?.title || null,
        imageScale: 1,
        imageRotation: 0,
        imagePosition: { x: 0, y: 0 }
      }
    })
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
    openImageViewer,
    closeViewer,
    nextImage,
    previousImage,
    setCurrentIndex,
    setImageScale,
    setImageRotation,
    setImagePosition,
    setIsDragging,
    setDragStart,
    resetImageTransform
  }), [
    state,
    openViewer,
    openImageViewer,
    closeViewer,
    nextImage,
    previousImage,
    setCurrentIndex,
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
