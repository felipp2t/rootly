import { createFileRoute, Link } from '@tanstack/react-router'
import { FolderIcon, PlusIcon } from 'lucide-react'
import { Suspense } from 'react'
import { useGetFoldersSuspense } from '@/api/folders/folders'
import { useGetItemsSuspense } from '@/api/items/items'
import { useGetTagsSuspense } from '@/api/tags/tags'
import { useGetWorkspaceSuspense } from '@/api/workspaces/workspaces'
import {
  FolderCard,
  FolderCardSkeleton,
  NewFolderCard,
} from '@/components/folder-card'
import {
  InlineCodeContent,
  InlineCodeRoot,
  InlineCodeSeparator,
  InlineCodeText,
} from '@/components/inline-code'
import { ItemCard, ItemCardSkeleton, NewItemCard } from '@/components/item-card'
import { Button } from '@/components/ui/button'

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
          <FolderCardSkeleton key={i} />
        ))}
      </div>

      <div className='flex flex-col gap-2'>
        <h2 className='font-mono text-xs font-semibold text-muted-foreground'>
          ITEMS
        </h2>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}

function RoutePage() {
  const { workspaceId } = Route.useParams()
  const { data: workspaceResult } = useGetWorkspaceSuspense(workspaceId)
  const { data: foldersResult } = useGetFoldersSuspense({ workspaceId })
  const { data: itemsResult } = useGetItemsSuspense({ workspaceId })
  const { data: tagsResult } = useGetTagsSuspense({ workspaceId })
  const workspace =
    workspaceResult.status === 200 ? workspaceResult.data.workspace : null
  const folders = foldersResult.status === 200 ? foldersResult.data.folders : []
  const items = itemsResult.status === 200 ? itemsResult.data.items : []
  const workspaceTags = tagsResult.status === 200 ? tagsResult.data.tags : []

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-6'>
        <InlineCodeRoot>
          <InlineCodeContent>
            <Link to='/' className='group'>
              <InlineCodeText className='transition-colors group-hover:text-foreground'>
                Workspaces
              </InlineCodeText>
            </Link>
            <InlineCodeSeparator />
            <InlineCodeText className='max-w-[16ch] truncate text-primary'>
              {workspace ? workspace.name : 'Workspace'}
            </InlineCodeText>
            <InlineCodeSeparator />
          </InlineCodeContent>
        </InlineCodeRoot>

        <div className='flex items-center justify-between'>
          <div className='flex min-w-0 items-center gap-4'>
            <FolderIcon className='size-6 shrink-0 text-primary' />
            <h1 className='truncate text-3xl font-bold font-mono'>
              {workspace?.name ? workspace.name : 'Workspace'}
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            <NewFolderCard workspaceId={workspaceId}>
              <Button
                type='button'
                className='cursor-pointer'
                variant='outline'
              >
                <FolderIcon className='size-4' />
                New Folder
              </Button>
            </NewFolderCard>
            <NewItemCard workspaceId={workspaceId}>
              <Button className='cursor-pointer'>
                <PlusIcon size={16} />
                New Item
              </Button>
            </NewItemCard>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <h2 className='font-mono text-XS font-semibold text-muted-foreground'>
          FOLDERS
        </h2>
        {folders.length === 0 ? (
          <div className='flex items-center justify-center py-8'>
            <p className='font-mono text-xs text-muted-foreground'>
              No folders yet
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
            {folders.map((folder) => (
              <Link
                key={folder.id}
                to='/$workspaceId/$'
                params={{ workspaceId, _splat: folder.id }}
              >
                <FolderCard
                  folderId={folder.id}
                  name={folder.name}
                  itemCount={folder.itemCount}
                  subfolderCount={folder.subfolderCount}
                  tagIds={folder.tagIds}
                  workspaceTags={workspaceTags}
                  workspaceId={workspaceId}
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <h2 className='font-mono text-sm font-semibold text-muted-foreground'>
          ITEMS
        </h2>
        {items.length === 0 ? (
          <div className='flex items-center justify-center py-8'>
            <p className='font-mono text-xs text-muted-foreground'>
              No items yet
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
