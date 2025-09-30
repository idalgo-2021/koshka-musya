import { useEventListener } from './useEventHooks'

interface UseKeyboardHooksOptions {
  onEscape?: () => void
  onEnter?: () => void
  isActive?: boolean
}

export function useKeyboardHooks({ onEscape, onEnter, isActive = true }: UseKeyboardHooksOptions) {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (!isActive) return

    if (e.key === 'Escape' && onEscape) {
      e.preventDefault()
      onEscape()
    } else if (e.key === 'Enter' && onEnter) {
      e.preventDefault()
      onEnter()
    }
  }, { enabled: isActive })
}
