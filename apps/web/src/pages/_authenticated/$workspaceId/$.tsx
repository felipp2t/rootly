import { createFileRoute, Link } from '@tanstack/react-router'
import { FolderIcon, PlusIcon } from 'lucide-react'
import { Suspense } from 'react'
import {
  useGetFoldersSuspense,
  useResolveFolderPathSuspense,
} from '@/api/folders/folders'
import { useGetItemsSuspense } from '@/api/items/items'
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

export const Route = createFileRoute('/_authenticated/$workspaceId/$')({
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
        <h1 className='text-4xl font-bold text-white'>FOLDER</h1>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
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
  const { workspaceId, _splat } = Route.useParams()

  const folderPath = (_splat ?? '').split('/').filter(Boolean)
  const currentFolderId = folderPath.at(-1)

  const { data: workspaceResult } = useGetWorkspaceSuspense(workspaceId)
  const { data: foldersResult } = useGetFoldersSuspense({
    workspaceId,
    parentId: currentFolderId,
  })
  const { data: itemsResult } = useGetItemsSuspense({
    workspaceId,
    parentId: currentFolderId,
  })
  const { data: resolvedPathResult } = useResolveFolderPathSuspense({
    workspaceId,
    path: _splat,
  })

  const workspace =
    workspaceResult.status === 200 ? workspaceResult.data.workspace : null
  const folders = foldersResult.status === 200 ? foldersResult.data.folders : []
  const items = itemsResult.status === 200 ? itemsResult.data.items : []
  const resolvedPath =
    resolvedPathResult.status === 200 ? resolvedPathResult.data.path : []
  const currentFolderName = resolvedPath.at(-1)?.name

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-6'>
        <InlineCodeRoot>
          <InlineCodeContent>
            <Link to='/$workspaceId' params={{ workspaceId }} className='group'>
              <InlineCodeText className='max-w-[16ch] truncate text-primary transition-colors group-hover:text-foreground'>
                {workspace ? workspace.name : 'Workspace'}
              </InlineCodeText>
            </Link>
            {(() => {
              const truncate = resolvedPath.length > 3
              const visible = truncate
                ? [resolvedPath[0], null, ...resolvedPath.slice(-2)]
                : resolvedPath

              return visible.map((item, idx) => {
                if (item === null) {
                  return (
                    <span key='ellipsis' className='flex items-center'>
                      <InlineCodeSeparator />
                      <InlineCodeText className='text-muted-foreground'>
                        ...
                      </InlineCodeText>
                    </span>
                  )
                }
                const originalIdx = truncate
                  ? idx === 0
                    ? 0
                    : resolvedPath.length + idx - 4
                  : idx
                const splatTo = folderPath.slice(0, originalIdx + 1).join('/')
                const isLast = originalIdx === resolvedPath.length - 1
                return (
                  <span key={item.id} className='flex items-center'>
                    <InlineCodeSeparator />
                    {isLast ? (
                      <InlineCodeText className='max-w-[16ch] truncate text-primary'>
                        {item.name}
                      </InlineCodeText>
                    ) : (
                      <Link
                        to='/$workspaceId/$'
                        params={{ workspaceId, _splat: splatTo }}
                        className='group'
                      >
                        <InlineCodeText className='max-w-[16ch] truncate transition-colors group-hover:text-foreground'>
                          {item.name}
                        </InlineCodeText>
                      </Link>
                    )}
                  </span>
                )
              })
            })()}
            <InlineCodeSeparator className='px-0' />
          </InlineCodeContent>
        </InlineCodeRoot>

        <div className='flex items-center justify-between'>
          <div className='flex min-w-0 items-center gap-4'>
            <FolderIcon className='size-6 shrink-0 text-primary' />
            <h1 className='truncate text-3xl font-bold font-mono'>
              {currentFolderName ?? 'Folder'}
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            <NewFolderCard workspaceId={workspaceId} parentId={currentFolderId}>
              <Button
                type='button'
                className='cursor-pointer'
                variant='outline'
              >
                <FolderIcon className='size-4' />
                New Folder
              </Button>
            </NewFolderCard>
            <NewItemCard workspaceId={workspaceId} folderId={currentFolderId}>
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
                params={{
                  workspaceId,
                  _splat: [...folderPath, folder.id].join('/'),
                }}
              >
                <FolderCard
                  name={folder.name}
                  itemCount={folder.itemCount}
                  subfolderCount={folder.subfolderCount}
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
