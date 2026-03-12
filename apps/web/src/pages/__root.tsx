import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router'
import type { useAuth } from '@/shared/lib/auth'

export const Route = createRootRouteWithContext<{
  auth: ReturnType<typeof useAuth>
}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}
