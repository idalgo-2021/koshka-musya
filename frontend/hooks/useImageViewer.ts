import { useImageViewer as useImageViewerContext } from '@/contexts/ImageViewerContext'

/**
 * Custom hook for easy image viewer usage
 * Provides simplified methods for opening and closing the image viewer
 */
export function useImageViewer() {
  const { openViewer, closeViewer } = useImageViewerContext()

  const openImage = (imageUrl: string, imageTitle?: string) => {
    openViewer(imageUrl, imageTitle)
  }

  const closeImage = () => {
    closeViewer()
  }

  return {
    openImage,
    closeImage,
    openViewer, // Keep the original method for advanced usage
    closeViewer // Keep the original method for advanced usage
  }
}
