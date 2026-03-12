import { createContext, useContext, useEffect, useState } from 'react'
import { fetchWithAuth } from './fetch'

interface AuthContextValue {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
}

type MeResponse = { data: unknown; status: number }

const AuthContext = createContext<AuthContextValue>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    fetchWithAuth<MeResponse>('http://localhost:3333/api/me', { method: 'GET' })
      .then((res) => setAuthenticated(res.status === 200))
      .catch(() => setAuthenticated(false))
  }, [])

  if (isAuthenticated === null) return null

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
