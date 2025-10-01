"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useImageViewer } from '@/contexts/ImageViewerContext'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Image as ImageIcon
} from 'lucide-react'

export function ImageViewer() {
  const {
    state,
    closeViewer,
    setImageScale,
    setImageRotation,
    setImagePosition,
    setIsDragging,
    setDragStart
  } = useImageViewer()

  const handleZoomIn = React.useCallback(() => {
    setImageScale(Math.min(state.imageScale * 1.2, 5))
  }, [state.imageScale, setImageScale])

  const handleZoomOut = React.useCallback(() => {
    setImageScale(Math.max(state.imageScale / 1.2, 0.1))
  }, [state.imageScale, setImageScale])

  const handleRotate = React.useCallback(() => {
    setImageRotation((state.imageRotation + 90) % 360)
  }, [state.imageRotation, setImageRotation])

  const handleDownload = React.useCallback(() => {
    if (state.imageUrl) {
      const link = document.createElement('a')
      link.href = state.imageUrl
      link.download = `${state.imageTitle || 'image'}-image.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [state.imageUrl, state.imageTitle])

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - state.imagePosition.x,
      y: e.clientY - state.imagePosition.y
    })
  }, [state.imagePosition, setIsDragging, setDragStart])

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (state.isDragging) {
      setImagePosition({
        x: e.clientX - state.dragStart.x,
        y: e.clientY - state.dragStart.y
      })
    }
  }, [state.isDragging, state.dragStart, setImagePosition])

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [setIsDragging])

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setImageScale(Math.max(0.1, Math.min(5, state.imageScale * delta)))
  }, [state.imageScale, setImageScale])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isOpen) return

      switch (e.key) {
        case 'Escape':
          closeViewer()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
        case 'R':
          handleRotate()
          break
        case 'd':
        case 'D':
          handleDownload()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.isOpen, closeViewer, handleZoomIn, handleZoomOut, handleRotate, handleDownload])

  if (!state.isOpen || !state.imageUrl) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium">{state.imageTitle || 'Image'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeViewer}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div
        className="absolute inset-0 flex items-center justify-center p-16 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={state.imageUrl}
          alt={state.imageTitle || 'Image'}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${state.imageScale}) rotate(${state.imageRotation}deg) translate(${state.imagePosition.x}px, ${state.imagePosition.y}px)`,
            transition: state.isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          draggable={false}
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/20"
            disabled={state.imageScale <= 0.1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="text-white text-sm font-medium min-w-[60px] text-center">
            {Math.round(state.imageScale * 100)}%
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/20"
            disabled={state.imageScale >= 5}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-white/30" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="text-white hover:bg-white/20"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-center text-white/60 text-xs mt-2">
          <div className="flex items-center justify-center gap-4">
            <span>ESC - закрыть</span>
            <span>+/- - масштаб</span>
            <span>R - поворот</span>
            <span>D - скачать</span>
          </div>
        </div>
      </div>
    </div>
  )
}
