"use client"

import { useState, useEffect, useCallback } from 'react'
import { useEventListener } from './useEventHooks'

export function useResponsiveToggle(
  defaultValue: boolean = false,
  storageKey: string = 'admin-view-mode'
): [boolean, (value: boolean) => void] {
  const [isMobile, setIsMobile] = useState(false)
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(storageKey)
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue
    }
    return defaultValue
  })

  // Check if device is mobile
  const checkIsMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  // Initial check
  useEffect(() => {
    checkIsMobile()
  }, [checkIsMobile])

  useEventListener('resize', checkIsMobile, { target: window })

  const setStoredValue = (newValue: boolean) => {
    setValue(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newValue))
    }
  }

  // On mobile, always return false (card view)
  // On desktop, return the actual stored value
  return [isMobile ? false : value, setStoredValue]
}
