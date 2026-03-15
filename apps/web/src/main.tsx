import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, useAuth } from '@/shared/lib/auth'
import './globals.css'
import { routeTree } from './route-tree.gen.ts'
import { queryClient } from './shared/lib/query.tsx'

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

  return <RouterProvider context={{ auth }} router={router} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
