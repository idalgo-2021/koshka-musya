"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import {User, USER_ROLE, UserRole} from '@/entities/auth/useAuth'

export interface SessionContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  // login: (input: { username: string; password: string }) => Promise<void>
  // logout: () => void
  // validate: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

interface SessionProviderProps {
  children: ReactNode
  value: SessionContextType
}

export function SessionProvider({ children, value }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext(): SessionContextType {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider')
  }
  return context
}

// Convenience hooks for specific user data
export function useUser(): User | null {
  const { user } = useSessionContext()
  return user
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useSessionContext()
  return isAuthenticated
}

export function useIsLoading(): boolean {
  const { isLoading } = useSessionContext()
  return isLoading
}

export function useUserRole(): UserRole | null {
  const { user } = useSessionContext()
  return user?.role || null
}

export function useIsAdmin(): boolean {
  const { user } = useSessionContext()
  return user?.role === USER_ROLE.Admin
}

export function useIsStaff(): boolean {
  const { user } = useSessionContext()
  return user?.role === USER_ROLE.Staff
}

export function useIsUser(): boolean {
  const { user } = useSessionContext()
  return user?.role === USER_ROLE.User
}
