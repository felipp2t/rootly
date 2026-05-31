import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'
import { getGetMeQueryKey, useGetMe } from '@/api/me/me'
import type { GetMe200 } from '@/api/model'

interface AuthContextValue {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  user: GetMe200 | null
}

const AuthContext = createContext<AuthContextValue>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  // Optimistic flag so a fresh login flips auth synchronously (the query
  // refetch that follows is async and would otherwise race with navigation).
  const [optimisticAuth, setOptimisticAuth] = useState<boolean | null>(null)

  const query = useGetMe({
    query: { retry: false, staleTime: Number.POSITIVE_INFINITY },
  })

  function setAuthenticated(value: boolean) {
    setOptimisticAuth(value)
    if (value) {
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })
    }
  }

  // Still resolving the initial /me request and no optimistic decision yet.
  if (query.isPending && optimisticAuth === null) return null

  const fetchedAuth = query.data?.status === 200
  const isAuthenticated = optimisticAuth ?? fetchedAuth
  const user = query.data?.status === 200 ? query.data.data : null

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
