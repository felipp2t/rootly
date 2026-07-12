import { FolderIcon, ShieldOffIcon, TextIcon, UserIcon } from 'lucide-react'
import { Suspense } from 'react'
import { useGetActivityLogsSuspense } from '@/api/activity/activity'
import type {
  GetActivityLogs200ActivityLogsItem,
  GetActivityLogs200ActivityLogsItemAction,
} from '@/api/model'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/utils/format-time-ago'

const ACTION_LABELS: Record<GetActivityLogs200ActivityLogsItemAction, string> =
  {
    folder_created: 'created folder',
    folder_renamed: 'renamed folder',
    folder_deleted: 'deleted folder',
    item_created: 'created item',
    item_updated: 'updated item',
    item_archived: 'archived item',
    item_restored: 'restored item',
    item_deleted: 'deleted item',
    member_invited: 'invited',
    member_joined: 'joined the workspace',
    member_role_changed: 'changed role for',
    member_removed: 'removed',
  }

export function ActivitySection({ workspaceId }: { workspaceId: string }) {
  return (
    <Suspense fallback={<ActivitySectionSkeleton />}>
      <ActivitySectionLoader workspaceId={workspaceId} />
    </Suspense>
  )
}

function ActivitySectionLoader({ workspaceId }: { workspaceId: string }) {
  const { data: activityRes } = useGetActivityLogsSuspense(workspaceId, {})

  if (activityRes.status === 403) {
    return (
      <div className='border border-border bg-card p-6 flex flex-col items-center justify-center gap-2'>
        <ShieldOffIcon className='size-5 text-muted-foreground' />
        <p className='font-mono text-xs text-muted-foreground'>
          You don't have permission to view this workspace's activity
        </p>
      </div>
    )
  }

  const activityLogs =
    activityRes.status === 200 ? activityRes.data.activityLogs : []

  if (activityLogs.length === 0) {
    return (
      <div className='border border-border bg-card p-6 flex items-center justify-center'>
        <p className='font-mono text-xs text-muted-foreground'>
          No activity yet
        </p>
      </div>
    )
  }

  return (
    <ScrollArea type='always'>
      <div className='max-h-120'>
        <div className='border border-border divide-y divide-border'>
          {activityLogs.map((log, i) => (
            <ActivityLogRow key={log.id} log={log} striped={i % 2 === 0} />
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

function ActivityLogRow({
  log,
  striped,
}: {
  log: GetActivityLogs200ActivityLogsItem
  striped: boolean
}) {
  const Icon =
    log.resourceType === 'folder'
      ? FolderIcon
      : log.resourceType === 'member'
        ? UserIcon
        : TextIcon

  const isSelfAction = log.action === 'member_joined'

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3',
        striped ? 'bg-card' : 'bg-muted/10',
      )}
    >
      <div className='size-8 shrink-0 flex items-center justify-center border border-border bg-muted/30 text-primary mt-0.5'>
        <Icon className='size-3.5' />
      </div>
      <div className='flex flex-col min-w-0 flex-1 gap-0.5'>
        <span className='font-mono text-xs tracking-wide truncate'>
          <span className='font-semibold uppercase'>{log.actorName}</span>{' '}
          <span className='text-muted-foreground'>
            {ACTION_LABELS[log.action]}
          </span>
          {!isSelfAction && (
            <>
              {' '}
              <span className='font-semibold'>"{log.resourceName}"</span>
            </>
          )}
        </span>
        <MetadataDiff metadata={log.metadata} />
        <span className='font-mono text-xs text-muted-foreground'>
          {formatTimeAgo(new Date(log.createdAt))}
        </span>
      </div>
    </div>
  )
}

function MetadataDiff({
  metadata,
}: {
  metadata: GetActivityLogs200ActivityLogsItem['metadata']
}) {
  if (!metadata) return null

  const before = metadata.before ?? {}
  const after = metadata.after ?? {}
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]

  if (keys.length === 0) return null

  return (
    <div className='flex flex-col gap-0.5'>
      {keys.map((key) => (
        <span key={key} className='font-mono text-[11px] text-muted-foreground'>
          {key}:{' '}
          <span className='line-through'>{String(before[key] ?? '—')}</span> →{' '}
          <span className='text-foreground'>{String(after[key] ?? '—')}</span>
        </span>
      ))}
    </div>
  )
}

export function ActivitySectionSkeleton() {
  return (
    <div className='border border-border divide-y divide-border'>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className='flex items-center gap-3 px-4 py-3'>
          <Skeleton className='size-8 shrink-0' />
          <div className='flex flex-col gap-1.5 flex-1'>
            <Skeleton className='h-3 w-56' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
      ))}
    </div>
  )
}
