import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router'

export const Route = createRootRouteWithContext()({
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
