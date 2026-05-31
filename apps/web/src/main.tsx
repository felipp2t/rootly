import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, useAuth } from '@/lib/auth.tsx'
import './globals.css'
import { Toaster } from './components/ui/sonner.tsx'
import { queryClient } from './lib/query.tsx'
import { routeTree } from './route-tree.gen.ts'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadDelay: 500,
  context: { auth: undefined! },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
export function App() {
  const auth = useAuth()

  useEffect(() => {
    router.invalidate()
  }, [auth.isAuthenticated])

  return <RouterProvider context={{ auth }} router={router} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster richColors />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
