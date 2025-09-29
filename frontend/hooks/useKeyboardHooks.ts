import { useEffect } from 'react'

interface UseKeyboardHooksOptions {
  onEscape?: () => void
  onEnter?: () => void
  isActive?: boolean
}

export function useKeyboardHooks({ onEscape, onEnter, isActive = true }: UseKeyboardHooksOptions) {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
      } else if (e.key === 'Enter' && onEnter) {
        e.preventDefault()
        onEnter()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, onEnter, isActive])
}
