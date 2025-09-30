"use client"

import React, {createContext, useContext, ReactNode, useCallback} from 'react'
import { RegisterInput, RegisterResponse, TokenInput } from './types'
import {useRouter} from "next/navigation";

export interface SessionActionContextType {
  login: (input: TokenInput) => Promise<void>
  logout: () => void
  validate: () => Promise<void>
  register: (input: RegisterInput) => Promise<RegisterResponse>
}

const SessionActionContext = createContext<SessionActionContextType | undefined>(undefined)

interface SessionActionProviderProps {
  children: ReactNode
  value: SessionActionContextType
}

export function SessionActionProvider({ children, value }: SessionActionProviderProps) {
  return (
    <SessionActionContext.Provider value={value}>
      {children}
    </SessionActionContext.Provider>
  )
}

export function useSessionActions(): SessionActionContextType {
  const context = useContext(SessionActionContext)
  if (context === undefined) {
    throw new Error('useSessionActions must be used within a SessionActionProvider')
  }
  return context
}

// Convenience hooks for specific actions
export function useLogin() {
  const { login } = useSessionActions()
  return login
}

export function useLogout() {
  const { logout } = useSessionActions()
  const router = useRouter();

  return useCallback(() => {
    logout();
    router.push('/');
  }, [router]);
}

export function useValidate() {
  const { validate } = useSessionActions()
  return validate
}

export function useRegister() {
  const { register } = useSessionActions()
  return register
}
