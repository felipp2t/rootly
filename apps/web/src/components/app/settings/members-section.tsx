import { ShieldIcon } from 'lucide-react'
import { Suspense } from 'react'
import { useGetWorkspaceMembersSuspense } from '@/api/members/members'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function MembersSection({ workspaceId }: { workspaceId: string }) {
  return (
    <Suspense fallback={<MembersSectionSkeleton />}>
      <MembersSectionLoader workspaceId={workspaceId} />
    </Suspense>
  )
}

function MembersSectionLoader({ workspaceId }: { workspaceId: string }) {
  const { data: membersRes } = useGetWorkspaceMembersSuspense(workspaceId)
  const members = membersRes.status === 200 ? membersRes.data.members : []

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <span className='font-mono text-sm font-bold uppercase tracking-wide'>
          Members
        </span>
        <span className='font-mono text-xs text-muted-foreground'>
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {members.length === 0 ? (
        <div className='border border-border bg-card p-6 flex items-center justify-center'>
          <p className='font-mono text-xs text-muted-foreground'>
            No members yet
          </p>
        </div>
      ) : (
        <ScrollArea type='always'>
          <div className='max-h-120'>
            <div className='border border-border divide-y divide-border'>
              {members.map((member, i) => (
                <div
                  key={member.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    i % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                  )}
                >
                  <div className='size-8 shrink-0 flex items-center justify-center border border-border bg-muted/30 font-mono text-xs font-bold uppercase text-primary'>
                    {member.name.charAt(0)}
                  </div>
                  <div className='flex flex-col min-w-0 flex-1'>
                    <span className='font-mono text-xs font-semibold uppercase tracking-wide truncate'>
                      {member.name}
                    </span>
                    <span className='font-mono text-xs text-muted-foreground truncate'>
                      {member.email}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0 px-2 py-1 border border-primary/50 bg-primary/5 text-primary'>
                    <ShieldIcon className='size-3 shrink-0' />
                    <span className='font-mono text-xs font-semibold uppercase tracking-wide'>
                      {member.roleName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function MembersSectionSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-4 w-16' />
      </div>
      <div className='border border-border divide-y divide-border'>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className='flex items-center gap-3 px-4 py-3'>
            <Skeleton className='size-8 shrink-0' />
            <div className='flex flex-col gap-1.5 flex-1'>
              <Skeleton className='h-3 w-32' />
              <Skeleton className='h-3 w-40' />
            </div>
            <Skeleton className='h-6 w-20' />
          </div>
        ))}
      </div>
    </div>
  )
}
