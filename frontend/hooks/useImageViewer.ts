import { useImageViewer as useImageViewerContext } from '@/contexts/ImageViewerContext'
import type { ImageItem } from '@/contexts/ImageViewerContext'

/**
 * Custom hook for easy image viewer usage
 * Provides simplified methods for opening and closing the image viewer
 */
export function useImageViewer() {
  const { openViewer, openImageViewer, closeViewer } = useImageViewerContext()

  const openImage = (imageUrl: string, imageTitle?: string) => {
    openViewer(imageUrl, imageTitle)
  }

  const openImages = (images: ImageItem[], startIndex?: number) => {
    openImageViewer(images, startIndex)
  }

  const closeImage = () => {
    closeViewer()
  }

  return {
    openImage,
    openImages,
    closeImage,
    openViewer, // Keep the original method for advanced usage
    openImageViewer, // Keep the original method for advanced usage
    closeViewer // Keep the original method for advanced usage
  }
}
