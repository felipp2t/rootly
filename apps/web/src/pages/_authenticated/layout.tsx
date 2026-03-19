import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Header } from '@/shared/components/header'
import GridPattern from '@/shared/components/ui/grid-pattern'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    const { isAuthenticated } = context.auth
    if (!isAuthenticated)
      throw redirect({
        to: '/session',
        search: {
          redirect: location.href,
        },
      })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='relative h-svh'>
      <GridPattern />
      <div className='relative z-10 flex h-full flex-col bg-zinc-950/80'>
        <Header />
        <div className='flex flex-1 overflow-hidden'>
          <ScrollArea className='flex-1'>
            <Outlet />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
