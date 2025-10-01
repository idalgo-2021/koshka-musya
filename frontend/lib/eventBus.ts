"use client"

// Event types for admin pages
export type AdminEventType =
  | 'users:refresh'
  | 'listings:refresh'
  | 'assignments:refresh'
  | 'reports:refresh'
  | 'sg-reservations:refresh'
  | 'profiles:refresh'
  | 'admin:refresh-all'

// Event payload interface
export interface AdminEventPayload {
  type: AdminEventType
  data?: any
  timestamp: number
}

// Create a global EventTarget instance
class AdminEventBus extends EventTarget {
  private static instance: AdminEventBus

  static getInstance(): AdminEventBus {
    if (!AdminEventBus.instance) {
      AdminEventBus.instance = new AdminEventBus()
    }
    return AdminEventBus.instance
  }

  // Emit an event
  emit(eventType: AdminEventType, data?: any): void {
    const event = new CustomEvent(eventType, {
      detail: {
        type: eventType,
        data,
        timestamp: Date.now()
      } as AdminEventPayload
    })
    this.dispatchEvent(event)
  }

  // Subscribe to an event
  subscribe(eventType: AdminEventType, callback: (payload: AdminEventPayload) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<AdminEventPayload>
      callback(customEvent.detail)
    }

    this.addEventListener(eventType, handler)

    // Return unsubscribe function
    return () => {
      this.removeEventListener(eventType, handler)
    }
  }

  // Subscribe to multiple events
  subscribeToMultiple(
    eventTypes: AdminEventType[],
    callback: (payload: AdminEventPayload) => void
  ): () => void {
    const handlers = eventTypes.map(eventType => {
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent<AdminEventPayload>
        callback(customEvent.detail)
      }
      this.addEventListener(eventType, handler)
      return { eventType, handler }
    })

    // Return unsubscribe function
    return () => {
      handlers.forEach(({ eventType, handler }) => {
        this.removeEventListener(eventType, handler)
      })
    }
  }
}

// Export singleton instance
export const adminEventBus = AdminEventBus.getInstance()

// Convenience functions
export const emitAdminEvent = (eventType: AdminEventType, data?: any) => {
  adminEventBus.emit(eventType, data)
}

export const subscribeToAdminEvent = (
  eventType: AdminEventType,
  callback: (payload: AdminEventPayload) => void
) => {
  return adminEventBus.subscribe(eventType, callback)
}

export const subscribeToMultipleAdminEvents = (
  eventTypes: AdminEventType[],
  callback: (payload: AdminEventPayload) => void
) => {
  return adminEventBus.subscribeToMultiple(eventTypes, callback)
}

// Refresh all admin data
export const refreshAllAdminData = () => {
  emitAdminEvent('admin:refresh-all')
}

// Refresh specific page data
export const refreshUsers = () => emitAdminEvent('users:refresh')
export const refreshListings = () => emitAdminEvent('listings:refresh')
export const refreshAssignments = () => emitAdminEvent('assignments:refresh')
export const refreshReports = () => emitAdminEvent('reports:refresh')
export const refreshSgReservations = () => emitAdminEvent('sg-reservations:refresh')
// export const refreshProfiles = () => emitAdminEvent('profiles:refresh')
