"use client"

import { useEffect, useRef } from 'react'
import {
  AdminEventType,
  AdminEventPayload,
  subscribeToAdminEvent,
  subscribeToMultipleAdminEvents
} from '@/lib/eventBus'

// Hook for subscribing to a single admin event
export function useAdminEventBus(
  eventType: AdminEventType,
  callback: (payload: AdminEventPayload) => void,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const unsubscribe = subscribeToAdminEvent(eventType, (payload) => {
      callbackRef.current(payload)
    })

    return unsubscribe
  }, [eventType, enabled])
}

// Hook for subscribing to multiple admin events
export function useMultipleAdminEvents(
  eventTypes: AdminEventType[],
  callback: (payload: AdminEventPayload) => void,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const unsubscribe = subscribeToMultipleAdminEvents(eventTypes, (payload) => {
      callbackRef.current(payload)
    })

    return unsubscribe
  }, [eventTypes, enabled])
}

// Hook for refreshing data on specific events
export function useAdminDataRefresh(
  eventTypes: AdminEventType[],
  refreshFunction: () => void,
  enabled: boolean = true
) {
  useMultipleAdminEvents(
    eventTypes,
    () => {
      refreshFunction()
    },
    enabled
  )
}
