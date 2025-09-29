import { useEffect, useRef, useCallback } from 'react'

type EventTarget = Document | Window | HTMLElement

interface UseEventListenerOptions {
  enabled?: boolean
  target?: EventTarget | React.RefObject<EventTarget>
  capture?: boolean
  passive?: boolean
  once?: boolean
}

// Main useEventListener hook - follows React hook conventions
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: UseEventListenerOptions
): void

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: UseEventListenerOptions
): void

export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: UseEventListenerOptions
): void

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  options?: UseEventListenerOptions
): void

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  options: UseEventListenerOptions = {}
): void {
  const {
    enabled = true,
    target = document,
    capture = false,
    passive = false,
    once = false
  } = options

  // Create a ref that stores handler
  const savedHandler = useRef(handler)

  // Update ref.current value if handler changes
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // Validate target
    if (!enabled) return

    const targetElement = target && 'current' in target ? target.current : target
    if (!targetElement) return

    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => {
      savedHandler.current(event)
    }

    const eventListenerOptions = { capture, passive, once }
    targetElement.addEventListener(eventName, eventListener, eventListenerOptions)

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener, eventListenerOptions)
    }
  }, [eventName, target, enabled, capture, passive, once])
}

// Hook for multiple event listeners
export function useEventListeners(
  events: Array<{
    eventName: string
    handler: (event: Event) => void
    options?: UseEventListenerOptions
  }>
): void {
  events.forEach(({ eventName, handler, options = {} }) => {
    useEventListener(eventName, handler, options)
  })
}

// Convenience hook for click outside
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  enabled: boolean = true
): void {
  useEventListener(
    'mousedown',
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    },
    { enabled, target: document }
  )
}

// Convenience hook for keyboard events
export function useKeyDown(
  handler: (event: KeyboardEvent) => void,
  options: UseEventListenerOptions = {}
): void {
  useEventListener('keydown', handler, options)
}

// Convenience hook for escape key
export function useEscapeKey(
  handler: () => void,
  enabled: boolean = true
): void {
  useKeyDown(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handler()
      }
    },
    { enabled }
  )
}

// Convenience hook for enter key
export function useEnterKey(
  handler: () => void,
  enabled: boolean = true
): void {
  useKeyDown(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handler()
      }
    },
    { enabled }
  )
}
