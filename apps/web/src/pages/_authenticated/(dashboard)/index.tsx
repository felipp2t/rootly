import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getWorkspaces } from '@/api/workspaces/workspaces'
import { InlineCode } from '@/shared/components/inline-code'
import GridPattern from '@/shared/components/ui/grid-pattern'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import type { Workspace } from '@/shared/components/workspace-card'
import {
  NewWorkspaceCard,
  WorkspaceCard,
} from '@/shared/components/workspace-card'

export const Route = createFileRoute('/_authenticated/(dashboard)/')({
  component: RouteComponent,
})

const MOCK_WORKSPACES: Workspace[] = [
  {
    name: 'Time de DevOps',
    memberCount: 5,
    itemCount: 23,
    updatedAt: '2h ago',
    roleCount: 3,
  },
  {
    name: 'Projeto X',
    memberCount: 3,
    itemCount: 8,
    updatedAt: '1d ago',
    roleCount: 2,
  },
  {
    name: 'Backend',
    memberCount: 7,
    itemCount: 41,
    updatedAt: '3d ago',
    roleCount: 5,
  },
  {
    name: 'Infraestrutura',
    memberCount: 2,
    itemCount: 12,
    updatedAt: '1w ago',
    roleCount: 2,
  },
]

function Header() {
  return (
    <header className='h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-10'>
      <span className='text-sm font-semibold text-white tracking-tight'>
        Rootly
      </span>
      <div className='flex-1' />
      <div className='w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300'>
        U
      </div>
    </header>
  )
}

function RouteComponent() {
  const { data: res } = useSuspenseQuery({
    queryKey: ['workspaces'],
    queryFn: () => getWorkspaces(),
  })
  const workspaces = res.data

  console.info(workspaces)

  return (
    <div className='relative h-svh'>
      <GridPattern />
      <div className='relative z-10 flex h-full flex-col bg-zinc-950/90'>
        <Header />
        <div className='flex flex-1 overflow-hidden'>
          <ScrollArea className='flex-1'>
            <main className='container mx-auto px-8 py-12'>
              <div className='mb-10 space-y-1.5'>
                <h1 className='text-4xl font-bold text-white'>WORKSPACES</h1>
                <InlineCode>8 WORKSPACES IN YOUR ORGANIZATION</InlineCode>
              </div>

              <div className='grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4'>
                {MOCK_WORKSPACES.map((ws) => (
                  <WorkspaceCard key={ws.name} workspace={ws} />
                ))}
                <NewWorkspaceCard />
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
