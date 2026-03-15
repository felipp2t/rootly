import { createContext, useContext, useEffect, useState } from 'react'
import type { getMeResponse } from '@/api/me/me'
import type { GetMe200 } from '@/api/model'
import { fetchWithAuth } from './fetch'

interface AuthContextValue {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  user: GetMe200 | null
}

const AuthContext = createContext<AuthContextValue>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<GetMe200 | null>(null)

  useEffect(() => {
    fetchWithAuth<getMeResponse>('http://localhost:3333/api/me', {
      method: 'GET',
    })
      .then((res) => {
        if (res.status === 200) {
          setAuthenticated(true)
          setUser(res.data)
        } else {
          setAuthenticated(false)
        }
      })
      .catch(() => setAuthenticated(false))
  }, [])

  if (isAuthenticated === null) return null
  if (user?.id === null) return null

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
