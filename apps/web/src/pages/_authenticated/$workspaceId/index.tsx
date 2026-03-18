import { createFileRoute } from '@tanstack/react-router'
import { FolderIcon, PlusIcon } from 'lucide-react'
import { Suspense } from 'react'
import { useGetFoldersSuspense } from '@/api/folders/folders'
import { useGetWorkspaceSuspense } from '@/api/workspaces/workspaces'
import { FolderCard, NewFolderCard } from '@/shared/components/folder-card'
import {
  InlineCodeContent,
  InlineCodeRoot,
  InlineCodeSeparator,
  InlineCodeText,
} from '@/shared/components/inline-code'
import { Button } from '@/shared/components/ui/button'
import { WorkspaceCardSkeleton } from '@/shared/components/workspace-card'

export const Route = createFileRoute('/_authenticated/$workspaceId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='container mx-auto px-8 py-12 space-y-6'>
      <Suspense fallback={<RouteSuspense />}>
        <RoutePage />
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

function RoutePage() {
  const { workspaceId } = Route.useParams()
  const { data: workspaceResult } = useGetWorkspaceSuspense(workspaceId)
  const { data: foldersResult } = useGetFoldersSuspense({ workspaceId })
  const workspace =
    workspaceResult.status === 200 ? workspaceResult.data.workspace : null
  const folders = foldersResult.status === 200 ? foldersResult.data.folders : []

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <InlineCodeRoot>
          <InlineCodeContent>
            <InlineCodeText>
              {workspace ? workspace.name : 'Workspace'}
            </InlineCodeText>
            <InlineCodeSeparator />
          </InlineCodeContent>
        </InlineCodeRoot>

        <div className='flex items-center gap-2'>
          <NewFolderCard workspaceId={workspaceId}>
            <Button type='button' className='cursor-pointer' variant='outline'>
              <FolderIcon className='size-4' />
              New Folder
            </Button>
          </NewFolderCard>
          <Button className='cursor-pointer'>
            <PlusIcon size={16} />
            New Item
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
        {folders.map((folder) => (
          <FolderCard key={folder.id} itemCount={0} name={folder.name} />
        ))}
      </div>
    </div>
  )
}
