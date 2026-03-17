import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useGetWorkspacesSuspense } from '@/api/workspaces/workspaces'
import {
  InlineCodeAddon,
  InlineCodeRoot,
  InlineCodeText,
} from '@/shared/components/inline-code'
import {
  NewWorkspaceCard,
  WorkspaceCard,
  WorkspaceCardSkeleton,
} from '@/shared/components/workspace-card'

export const Route = createFileRoute('/_authenticated/(dashboard)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='container mx-auto px-8 py-12 space-y-6'>
      <Suspense fallback={<RouteSuspense />}>
        <WorkspacePage />
      </Suspense>
    </main>
  )
}

function RouteSuspense() {
  return (
    <>
      <div className='space-y-1.5'>
        <h1 className='text-4xl font-bold text-white'>WORKSPACES</h1>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <WorkspaceCardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}

function WorkspacePage() {
  const { data: res } = useGetWorkspacesSuspense()
  const workspaces = res.status === 200 ? res.data.workspaces : []

  return (
    <>
      <div className='space-y-1.5'>
        <h1 className='text-4xl font-bold text-white'>WORKSPACES</h1>
        <InlineCodeRoot>
          <InlineCodeAddon>{`//`}</InlineCodeAddon>
          <InlineCodeText>
            {workspaces.length} WORKSPACES IN YOUR ORGANIZATION
          </InlineCodeText>
        </InlineCodeRoot>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
        {workspaces.map((ws) => (
          <WorkspaceCard
            key={ws.id}
            workspace={{
              id: ws.id,
              name: ws.name,
              updatedAt: ws.updatedAt,
              itemCount: ws.itemCount,
              memberCount: ws.memberCount,
            }}
          />
        ))}
        <NewWorkspaceCard />
      </div>
    </>
  )
}
