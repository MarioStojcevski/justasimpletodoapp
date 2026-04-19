import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'

export type SidebarLayoutValue = {
  sidebarOpen: boolean
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

export const SidebarLayoutContext = createContext<SidebarLayoutValue | null>(null)

export function useSidebarLayout(): SidebarLayoutValue {
  const ctx = useContext(SidebarLayoutContext)
  if (!ctx) {
    throw new Error('useSidebarLayout must be used within AppShell')
  }
  return ctx
}
